import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET - Get all users with their preferences
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sortBy = searchParams.get('sortBy') || 'position';

    // Get all users with positions
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('*')
      .not('eir_position', 'is', null)
      .order(sortBy === 'position' ? 'eir_position' : 'display_name', { ascending: true });

    if (usersError) throw usersError;

    // Get all preferences
    const { data: prefs, error: prefsError } = await supabaseAdmin
      .from('preferences')
      .select('*')
      .order('priority', { ascending: true });

    if (prefsError) throw prefsError;

    // Combine data
    const combined = users?.map(user => ({
      user,
      preferences: prefs?.filter(p => p.user_id === user.id) || [],
    })) || [];

    return NextResponse.json({ data: combined });
  } catch (error: any) {
    console.error('Error fetching global data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch global data' },
      { status: 500 }
    );
  }
}
