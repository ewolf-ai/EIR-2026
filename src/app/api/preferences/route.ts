import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sanitizePreferenceValue, validatePreferenceType } from '@/lib/security';

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
    const { user_id, preference_type, preference_value, priority } = body;

    // Validate required fields
    if (!user_id || !preference_type || !preference_value || priority === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    if (!Array.isArray(preferences)) {
      return NextResponse.json(
        { error: 'preferences must be an array' },
        { status: 400 }
      );
    }

    // Update each preference and check for errors
    const updatePromises = preferences.map(({ id, priority }) =>
      supabaseAdmin
        .from('preferences')
        .update({ priority })
        .eq('id', id)
        .select()
    );

    const results = await Promise.all(updatePromises);

    // Check if any update failed
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('Some updates failed:', errors);
      throw new Error('Failed to update some preferences');
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
