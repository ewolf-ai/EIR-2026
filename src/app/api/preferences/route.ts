import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sanitizePreferenceValue, validatePreferenceType, validateSpecialty } from '@/lib/security';

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

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating specialty:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update specialty' },
      { status: 500 }
    );
  }
}
