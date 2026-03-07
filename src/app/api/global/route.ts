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

    // Fetch preferences for each user individually to avoid Supabase limits
    const combined = await Promise.all(
      (users || []).map(async (user) => {
        const { data: preferences, error: prefError } = await supabaseAdmin
          .from('preferences')
          .select('*')
          .eq('user_id', user.id)
          .order('priority', { ascending: true });

        if (prefError) {
          console.error(`Error fetching preferences for user ${user.id}:`, prefError);
          return { user, preferences: [] };
        }

        return { user, preferences: preferences || [] };
      })
    );

    return NextResponse.json({ data: combined });
  } catch (error: any) {
    console.error('Error fetching global data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch global data' },
      { status: 500 }
    );
  }
}
