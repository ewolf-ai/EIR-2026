import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET - Get all users with their preferences
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sortBy = searchParams.get('sortBy') || 'position';

    // Get all users with positions and their preferences in one query
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        preferences (
          id,
          user_id,
          specialty,
          preference_type,
          preference_value,
          priority,
          created_at,
          updated_at
        )
      `)
      .not('eir_position', 'is', null)
      .order(sortBy === 'position' ? 'eir_position' : 'display_name', { ascending: true });

    if (usersError) throw usersError;

    // Transform data to match expected format
    const combined = users?.map(user => ({
      user: {
        id: user.id,
        firebase_uid: user.firebase_uid,
        email: user.email,
        display_name: user.display_name,
        eir_position: user.eir_position,
        dni: user.dni,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      preferences: (user.preferences || []).sort((a: any, b: any) => a.priority - b.priority)
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
