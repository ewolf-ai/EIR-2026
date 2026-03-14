import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { PROVINCE_TO_COMMUNITY } from '@/lib/eir-data';

interface PreferenceAnalysis {
  preference: string;
  priority: number;
  type: string;
  specialty: string;
  totalPositions: number;
  usersFirstOption: number;
  usersTop3: number;
  usersInProvince: number;
}

// GET - Get comparison statistics for a user
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

    // Get total users with positions
    const { count: totalUsers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .not('eir_position', 'is', null);

    // Get current user's data including assigned position from DB
    const { data: currentUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, eir_position, assigned_position_simulation, assignment_calculated_at')
      .eq('id', userId)
      .single();

    if (userError || !currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!currentUser.eir_position) {
      return NextResponse.json({
        data: {
          totalUsers: totalUsers || 0,
          assignedPosition: null,
          assignmentCalculatedAt: null,
          preferenceAnalysis: [],
        },
      });
    }

    const userPosition = currentUser.eir_position;

    // Get current user's preferences
    const { data: userPreferences, error: prefsError } = await supabaseAdmin
      .from('preferences')
      .select('preference_value, preference_type, specialty, priority')
      .eq('user_id', userId)
      .order('priority');

    if (!userPreferences || userPreferences.length === 0) {
      return NextResponse.json({
        data: {
          totalUsers: totalUsers || 0,
          assignedPosition: currentUser.assigned_position_simulation,
          assignmentCalculatedAt: currentUser.assignment_calculated_at,
          preferenceAnalysis: [],
        },
      });
    }

    // Get all offered positions for statistics (needed for position counts and province mapping)
    const { data: offeredPositions } = await supabaseAdmin
      .from('offered_positions')
      .select('center, province, specialty, num_positions');

    // Build hospital->province mapping for later use
    const hospitalProvinceMap = new Map<string, string>();
    const positionCountMap = new Map<string, number>(); // key: center_specialty
    if (offeredPositions) {
      for (const pos of offeredPositions) {
        hospitalProvinceMap.set(pos.center, pos.province);
        const key = `${pos.center}_${pos.specialty}`;
        positionCountMap.set(key, (positionCountMap.get(key) || 0) + pos.num_positions);
      }
    }

    // Analyze each user preference
    const preferenceAnalysis: PreferenceAnalysis[] = [];

    for (const userPref of userPreferences) {
      // Get total positions available for this preference
      let totalPositions = 0;
      let provinceForPreference: string | null = null;

      if (userPref.preference_type === 'hospital') {
        // Count positions for this specific hospital/center
        const key = `${userPref.preference_value}_${userPref.specialty}`;
        totalPositions = positionCountMap.get(key) || 0;
        provinceForPreference = hospitalProvinceMap.get(userPref.preference_value) || null;
      } else if (userPref.preference_type === 'province') {
        // Count positions for this province
        if (offeredPositions) {
          totalPositions = offeredPositions
            .filter((p: any) => p.province === userPref.preference_value && p.specialty === userPref.specialty)
            .reduce((sum: number, p: any) => sum + p.num_positions, 0);
        }
        provinceForPreference = userPref.preference_value;
      } else if (userPref.preference_type === 'community') {
        // Count positions for all provinces in this community
        const provincesInCommunity = PROVINCE_TO_COMMUNITY
          .filter(p => p.community === userPref.preference_value)
          .map(p => p.province);

        if (offeredPositions) {
          totalPositions = offeredPositions
            .filter((p: any) => provincesInCommunity.includes(p.province) && p.specialty === userPref.specialty)
            .reduce((sum: number, p: any) => sum + p.num_positions, 0);
        }
      }

      // Count users ahead with this as first option - DB query
      const { data: firstChoiceCount, error: firstChoiceError } = await supabaseAdmin
        .rpc('get_users_first_choice_count', {
          target_preference: userPref.preference_value,
          target_type: userPref.preference_type,
          target_specialty: userPref.specialty,
          max_position: userPosition
        });

      console.log('🔍 RPC first_choice:', {
        preference: userPref.preference_value,
        type: userPref.preference_type,
        specialty: userPref.specialty,
        maxPos: userPosition,
        result: firstChoiceCount,
        error: firstChoiceError
      });

      const usersFirstOption = firstChoiceError ? 0 : (firstChoiceCount || 0);

      // Count users ahead with this in top 3 - DB query
      const { data: top3Count, error: top3Error } = await supabaseAdmin
        .rpc('get_users_top3_count', {
          target_preference: userPref.preference_value,
          target_type: userPref.preference_type,
          target_specialty: userPref.specialty,
          max_position: userPosition
        });

      const usersTop3 = top3Error ? 0 : (top3Count || 0);

      // Count users competing for same province/community - DB query
      let usersInProvince = 0;
      
      if (userPref.preference_type === 'hospital' && provinceForPreference) {
        // For hospital: Get count of users competing for same province
        const { data: provinceCount, error } = await supabaseAdmin
          .rpc('get_users_same_province_count', {
            target_province: provinceForPreference,
            target_specialty: userPref.specialty,
            max_position: userPosition
          });

        usersInProvince = error ? 0 : (provinceCount || 0);
        
      } else if (userPref.preference_type === 'province') {
        // For province: Get count of users competing for this province
        const { data: provinceCount, error } = await supabaseAdmin
          .rpc('get_users_same_province_count', {
            target_province: userPref.preference_value,
            target_specialty: userPref.specialty,
            max_position: userPosition
          });

        usersInProvince = error ? 0 : (provinceCount || 0);
        
      } else if (userPref.preference_type === 'community') {
        // For community: Get count of users competing for this community
        const { data: communityCount, error } = await supabaseAdmin
          .rpc('get_users_same_community_count', {
            target_community: userPref.preference_value,
            target_specialty: userPref.specialty,
            max_position: userPosition
          });

        usersInProvince = error ? 0 : (communityCount || 0);
      }

      preferenceAnalysis.push({
        preference: userPref.preference_value,
        priority: userPref.priority,
        type: userPref.preference_type,
        specialty: userPref.specialty,
        totalPositions,
        usersFirstOption,
        usersTop3,
        usersInProvince,
      });
    }

    return NextResponse.json({
      data: {
        totalUsers: totalUsers || 0,
        assignedPosition: currentUser.assigned_position_simulation,
        assignmentCalculatedAt: currentUser.assignment_calculated_at,
        preferenceAnalysis,
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
