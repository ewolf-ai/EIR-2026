import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET - Get comparison statistics for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const eirPosition = searchParams.get('eir_position');
    const preferenceValues = searchParams.get('preference_values'); // comma-separated

    if (!userId || !eirPosition) {
      return NextResponse.json(
        { error: 'Missing user_id or eir_position parameter' },
        { status: 400 }
      );
    }

    const position = parseInt(eirPosition);

    // Get total users with positions
    const { count: totalUsers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .not('eir_position', 'is', null);

    // Get users ahead
    const { count: usersAhead } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .lt('eir_position', position)
      .not('eir_position', 'is', null);

    // Get users behind
    const { count: usersBehind } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gt('eir_position', position);

    // Get users competing for same preferences
    let competing = 0;
    if (preferenceValues) {
      const values = preferenceValues.split(',').filter(v => v.trim());
      if (values.length > 0) {
        const { count } = await supabaseAdmin
          .from('preferences')
          .select('user_id', { count: 'exact', head: true })
          .in('preference_value', values)
          .neq('user_id', userId);
        competing = count || 0;
      }
    }

    return NextResponse.json({
      data: {
        totalUsers: totalUsers || 0,
        usersAhead: usersAhead || 0,
        usersBehind: usersBehind || 0,
        competingForSamePreferences: competing,
      },
    });
  } catch (error: any) {
    console.error('Error fetching comparison:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch comparison' },
      { status: 500 }
    );
  }
}
