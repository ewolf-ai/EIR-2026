import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sanitizePreferenceValue, validatePreferenceType, validateSpecialty } from '@/lib/security';

// Helper function to trigger assignment recalculation
async function triggerRecalculation() {
  console.log('🔄 [RECALC] Triggering assignment recalculation...');
  try {
    // Call the recalculation queue processor
    const { data, error } = await supabaseAdmin
      .rpc('process_assignment_recalculation_queue');
    
    if (error) {
      console.error('❌ [RECALC] Failed to trigger recalculation:', error);
      // Don't throw - this is non-critical
    } else {
      console.log('✅ [RECALC] Success:', data);
    }
  } catch (err) {
    console.error('❌ [RECALC] Error triggering recalculation:', err);
    // Silently fail - preference change should still succeed
  }
}

// GET - Get user preferences
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing user_id parameter' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('preferences')
      .select('*')
      .eq('user_id', userId)
      .order('priority', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ data: data || [] });
  } catch (error: any) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

// POST - Create preference
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, specialty, preference_type, preference_value, priority } = body;

    // Validate required fields
    if (!user_id || !specialty || !preference_type || !preference_value || priority === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate specialty
    if (!validateSpecialty(specialty)) {
      return NextResponse.json(
        { error: 'Invalid specialty' },
        { status: 400 }
      );
    }

    // Validate preference type
    if (!validatePreferenceType(preference_type)) {
      return NextResponse.json(
        { error: 'Invalid preference type' },
        { status: 400 }
      );
    }

    // Sanitize preference value
    const sanitized = sanitizePreferenceValue(preference_value);

    // Validate that preference_value exists in offered_positions table for the given specialty
    // Only validate if the table has data (to avoid blocking when table is empty)
    let shouldValidate = false;
    let validationQuery;
    
    switch (preference_type) {
      case 'hospital':
        validationQuery = supabaseAdmin
          .from('offered_positions')
          .select('center')
          .eq('center', sanitized)
          .eq('specialty', specialty)
          .limit(1);
        shouldValidate = true;
        break;
      case 'province':
        validationQuery = supabaseAdmin
          .from('offered_positions')
          .select('province')
          .eq('province', sanitized)
          .eq('specialty', specialty)
          .limit(1);
        shouldValidate = true;
        break;
      case 'community':
        // For communities, we need to check if any province in that community has this specialty
        // Get all provinces in this community from PROVINCE_TO_COMMUNITY mapping
        // Then check if any of them has positions for this specialty
        const { PROVINCE_TO_COMMUNITY } = await import('@/lib/eir-data');
        const provincesInCommunity = PROVINCE_TO_COMMUNITY
          .filter(mapping => mapping.community === sanitized)
          .map(mapping => mapping.province);
        
        if (provincesInCommunity.length > 0) {
          validationQuery = supabaseAdmin
            .from('offered_positions')
            .select('province')
            .in('province', provincesInCommunity)
            .eq('specialty', specialty)
            .limit(1);
          shouldValidate = true;
        } else {
          // Community not found in mapping - will fail validation below
          validationQuery = null;
          shouldValidate = false;
        }
        break;
    }

    if (shouldValidate && validationQuery) {
      try {
        const { data: validationData, error: validationError } = await validationQuery;
        
        // Only enforce validation if the table has data
        if (!validationError && validationData) {
          if (validationData.length === 0) {
            // Check if table is empty (no validation needed if empty)
            const { count } = await supabaseAdmin
              .from('offered_positions')
              .select('*', { count: 'exact', head: true });
            
            if (count && count > 0) {
              // Table has data but value not found for this specialty - reject
              return NextResponse.json(
                { error: `La especialidad "${specialty}" no está disponible en "${sanitized}" (${preference_type})` },
                { status: 400 }
              );
            }
            // Table is empty - allow insertion (fallback mode)
            console.warn('offered_positions is empty - skipping validation');
          }
        }
      } catch (validationErr) {
        // If validation fails due to error, log and continue (don't block)
        console.error('Validation error (continuing):', validationErr);
      }
    }

    // Create preference
    const { data, error } = await supabaseAdmin
      .from('preferences')
      .insert({
        user_id,
        specialty,
        preference_type,
        preference_value: sanitized,
        priority,
      })
      .select()
      .single();

    if (error) throw error;

    // Trigger recalculation asynchronously
    await triggerRecalculation();

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating preference:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create preference' },
      { status: 500 }
    );
  }
}

// DELETE - Delete preference
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing id parameter' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('preferences')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Trigger recalculation asynchronously
    await triggerRecalculation();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting preference:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete preference' },
      { status: 500 }
    );
  }
}

// PATCH - Update preferences priority
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { preferences } = body; // Array of {id, priority}

    console.log('PATCH preferences received:', preferences);

    if (!Array.isArray(preferences)) {
      return NextResponse.json(
        { error: 'preferences must be an array' },
        { status: 400 }
      );
    }

    if (preferences.length === 0) {
      return NextResponse.json({ success: true });
    }

    // Validate that all items have id and priority
    for (const pref of preferences) {
      if (!pref.id || pref.priority === undefined) {
        return NextResponse.json(
          { error: 'Each preference must have id and priority' },
          { status: 400 }
        );
      }
    }

    // Use RPC function to update priorities atomically
    // This avoids UNIQUE constraint conflicts when reordering
    const { error } = await supabaseAdmin.rpc('update_preferences_priorities', {
      preferences_data: preferences
    });

    if (error) {
      console.error('Error updating preferences:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to update preferences' },
        { status: 500 }
      );
    }

    console.log('All preferences updated successfully');
    
    // Trigger recalculation asynchronously
    await triggerRecalculation();
    
    return NextResponse.json({ success: true, updated: preferences.length });
  } catch (error: any) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

// PUT - Update preference specialty
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, specialty } = body;

    // Validate required fields
    if (!id || !specialty) {
      return NextResponse.json(
        { error: 'Missing required fields (id, specialty)' },
        { status: 400 }
      );
    }

    // Validate specialty
    if (!validateSpecialty(specialty)) {
      return NextResponse.json(
        { error: 'Invalid specialty' },
        { status: 400 }
      );
    }

    // Update specialty
    const { data, error } = await supabaseAdmin
      .from('preferences')
      .update({ specialty })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Trigger recalculation asynchronously
    await triggerRecalculation();

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating specialty:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update specialty' },
      { status: 500 }
    );
  }
}
