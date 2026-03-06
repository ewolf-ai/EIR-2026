import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { PROVINCE_TO_COMMUNITY } from '@/lib/eir-data';

interface UserWithPreferences {
  id: string;
  eir_position: number;
  preferences: Array<{
    preference_value: string;
    preference_type: string;
    specialty: string;
    priority: number;
  }>;
}

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

// Helper function to get province from preference
function getProvinceFromPreference(preference: string, type: string): string | null {
  if (type === 'province') {
    return preference;
  }
  if (type === 'community') {
    // For community, return null as we'll match all provinces in that community
    return null;
  }
  // For hospital, we need to extract from offered_positions
  return null;
}

// GET - Get comparison statistics for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const eirPosition = searchParams.get('eir_position');

    if (!userId || !eirPosition) {
      return NextResponse.json(
        { error: 'Missing user_id or eir_position parameter' },
        { status: 400 }
      );
    }

    const userPosition = parseInt(eirPosition);

    // Get total users with positions
    const { count: totalUsers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .not('eir_position', 'is', null);

    // Get current user's preferences
    const { data: userPreferences } = await supabaseAdmin
      .from('preferences')
      .select('preference_value, preference_type, specialty, priority')
      .eq('user_id', userId)
      .order('priority');

    if (!userPreferences || userPreferences.length === 0) {
      return NextResponse.json({
        data: {
          totalUsers: totalUsers || 0,
          assignedPosition: null,
          preferenceAnalysis: [],
        },
      });
    }

    // Get all users with their positions and preferences (only users with position)
    const { data: allUsers } = await supabaseAdmin
      .from('users')
      .select('id, eir_position')
      .not('eir_position', 'is', null)
      .order('eir_position');

    // Get all preferences for all users
    const { data: allPreferences } = await supabaseAdmin
      .from('preferences')
      .select('user_id, preference_value, preference_type, specialty, priority')
      .order('priority');

    // Get all offered positions to build hospital->province mapping
    const { data: offeredPositions } = await supabaseAdmin
      .from('offered_positions')
      .select('center, province, specialty, num_positions');

    // Build hospital->province mapping
    const hospitalProvinceMap = new Map<string, string>();
    const positionCountMap = new Map<string, number>(); // key: center_specialty
    if (offeredPositions) {
      for (const pos of offeredPositions) {
        hospitalProvinceMap.set(pos.center, pos.province);
        const key = `${pos.center}_${pos.specialty}`;
        positionCountMap.set(key, (positionCountMap.get(key) || 0) + pos.num_positions);
      }
    }

    // Build user-preference mapping
    const userPreferenceMap = new Map<string, UserWithPreferences['preferences']>();
    if (allPreferences) {
      for (const pref of allPreferences) {
        if (!userPreferenceMap.has(pref.user_id)) {
          userPreferenceMap.set(pref.user_id, []);
        }
        userPreferenceMap.get(pref.user_id)!.push({
          preference_value: pref.preference_value,
          preference_type: pref.preference_type,
          specialty: pref.specialty,
          priority: pref.priority,
        });
      }
    }

    // Simulate REALISTIC assignment process
    const assignedPositions = new Map<string, string>(); // userId -> assigned preference_value
    const availablePositions = new Map<string, number>(); // key: center_specialty -> available count
    
    // Initialize available positions from offered_positions
    if (offeredPositions) {
      for (const pos of offeredPositions) {
        const key = `${pos.center}_${pos.specialty}`;
        availablePositions.set(key, (availablePositions.get(key) || 0) + pos.num_positions);
      }
    }

    // Process users in order of eir_position (best to worst)
    if (allUsers) {
      for (const user of allUsers) {
        const prefs = userPreferenceMap.get(user.id) || [];
        let assigned = false;

        // Try each preference in order
        for (const pref of prefs) {
          if (assigned) break;

          if (pref.preference_type === 'hospital') {
            // Try to assign to specific hospital
            const key = `${pref.preference_value}_${pref.specialty}`;
            const available = availablePositions.get(key) || 0;
            
            if (available > 0) {
              assignedPositions.set(user.id, pref.preference_value);
              availablePositions.set(key, available - 1);
              assigned = true;
            }
          } else if (pref.preference_type === 'province') {
            // Try to assign to any center in this province
            const centersInProvince = offeredPositions?.filter(
              p => p.province === pref.preference_value && p.specialty === pref.specialty
            ) || [];

            for (const center of centersInProvince) {
              const key = `${center.center}_${pref.specialty}`;
              const available = availablePositions.get(key) || 0;
              
              if (available > 0) {
                assignedPositions.set(user.id, center.center);
                availablePositions.set(key, available - 1);
                assigned = true;
                break;
              }
            }
          } else if (pref.preference_type === 'community') {
            // Try to assign to any center in provinces of this community
            const provincesInCommunity = PROVINCE_TO_COMMUNITY
              .filter(p => p.community === pref.preference_value)
              .map(p => p.province);

            const centersInCommunity = offeredPositions?.filter(
              p => provincesInCommunity.includes(p.province) && p.specialty === pref.specialty
            ) || [];

            for (const center of centersInCommunity) {
              const key = `${center.center}_${pref.specialty}`;
              const available = availablePositions.get(key) || 0;
              
              if (available > 0) {
                assignedPositions.set(user.id, center.center);
                availablePositions.set(key, available - 1);
                assigned = true;
                break;
              }
            }
          }
        }
      }
    }

    const userAssignedPosition = assignedPositions.get(userId) || null;

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
            .filter(p => p.province === userPref.preference_value && p.specialty === userPref.specialty)
            .reduce((sum, p) => sum + p.num_positions, 0);
        }
        provinceForPreference = userPref.preference_value;
      } else if (userPref.preference_type === 'community') {
        // Count positions for all provinces in this community
        const provincesInCommunity = PROVINCE_TO_COMMUNITY
          .filter(p => p.community === userPref.preference_value)
          .map(p => p.province);

        if (offeredPositions) {
          totalPositions = offeredPositions
            .filter(p => provincesInCommunity.includes(p.province) && p.specialty === userPref.specialty)
            .reduce((sum, p) => sum + p.num_positions, 0);
        }
      }

      // Count users ahead with this as first option
      let usersFirstOption = 0;
      if (allUsers) {
        for (const user of allUsers) {
          if (user.eir_position >= userPosition) break; // Only count users ahead
          const prefs = userPreferenceMap.get(user.id) || [];
          if (prefs.length === 0) continue;

          const firstPref = prefs[0];
          let matches = false;

          if (userPref.preference_type === 'hospital') {
            // Match exact hospital
            matches = firstPref.preference_value === userPref.preference_value && 
                     firstPref.specialty === userPref.specialty;
          } else if (userPref.preference_type === 'province') {
            // Match province OR any hospital in that province
            if (firstPref.preference_type === 'province') {
              matches = firstPref.preference_value === userPref.preference_value && 
                       firstPref.specialty === userPref.specialty;
            } else if (firstPref.preference_type === 'hospital') {
              const hospitalProvince = hospitalProvinceMap.get(firstPref.preference_value);
              matches = hospitalProvince === userPref.preference_value && 
                       firstPref.specialty === userPref.specialty;
            }
          } else if (userPref.preference_type === 'community') {
            // Match community OR any province/hospital in that community
            const provincesInCommunity = PROVINCE_TO_COMMUNITY
              .filter(p => p.community === userPref.preference_value)
              .map(p => p.province);

            if (firstPref.preference_type === 'community') {
              matches = firstPref.preference_value === userPref.preference_value && 
                       firstPref.specialty === userPref.specialty;
            } else if (firstPref.preference_type === 'province') {
              matches = provincesInCommunity.includes(firstPref.preference_value) && 
                       firstPref.specialty === userPref.specialty;
            } else if (firstPref.preference_type === 'hospital') {
              const hospitalProvince = hospitalProvinceMap.get(firstPref.preference_value);
              matches = !!(hospitalProvince && provincesInCommunity.includes(hospitalProvince) && 
                       firstPref.specialty === userPref.specialty);
            }
          }

          if (matches) usersFirstOption++;
        }
      }

      // Count users ahead with this in top 3
      let usersTop3 = 0;
      if (allUsers) {
        for (const user of allUsers) {
          if (user.eir_position >= userPosition) break; // Only count users ahead
          const prefs = userPreferenceMap.get(user.id) || [];
          const top3 = prefs.slice(0, 3);

          const hasMatch = top3.some(p => {
            if (userPref.preference_type === 'hospital') {
              // Match exact hospital
              return p.preference_value === userPref.preference_value && 
                     p.specialty === userPref.specialty;
            } else if (userPref.preference_type === 'province') {
              // Match province OR any hospital in that province
              if (p.preference_type === 'province') {
                return p.preference_value === userPref.preference_value && 
                       p.specialty === userPref.specialty;
              } else if (p.preference_type === 'hospital') {
                const hospitalProvince = hospitalProvinceMap.get(p.preference_value);
                return hospitalProvince === userPref.preference_value && 
                       p.specialty === userPref.specialty;
              }
            } else if (userPref.preference_type === 'community') {
              // Match community OR any province/hospital in that community
              const provincesInCommunity = PROVINCE_TO_COMMUNITY
                .filter(pc => pc.community === userPref.preference_value)
                .map(pc => pc.province);

              if (p.preference_type === 'community') {
                return p.preference_value === userPref.preference_value && 
                       p.specialty === userPref.specialty;
              } else if (p.preference_type === 'province') {
                return provincesInCommunity.includes(p.preference_value) && 
                       p.specialty === userPref.specialty;
              } else if (p.preference_type === 'hospital') {
                const hospitalProvince = hospitalProvinceMap.get(p.preference_value);
                return hospitalProvince && provincesInCommunity.includes(hospitalProvince) && 
                       p.specialty === userPref.specialty;
              }
            }
            return false;
          });

          if (hasMatch) usersTop3++;
        }
      }

      // Count users competing for same province using SQL query
      // Uses PostgreSQL function that executes: 
      // SELECT * FROM preferences WHERE specialty = X AND preference_value IN 
      //   (SELECT province FROM offered_positions WHERE province = Y UNION SELECT center FROM offered_positions WHERE province = Y)
      let usersInProvince = 0;
      
      if (userPref.preference_type === 'hospital' && provinceForPreference) {
        // For hospital: Get users competing for same province where hospital is located
        const { data: competingUsers, error } = await supabaseAdmin
          .rpc('get_users_competing_for_province', {
            target_province: provinceForPreference,
            target_specialty: userPref.specialty
          });

        if (competingUsers && !error) {
          const competingUserIds = new Set(competingUsers.map((u: any) => u.user_id));
          // Filter only users ahead
          if (allUsers) {
            usersInProvince = allUsers.filter(u => 
              u.eir_position < userPosition && competingUserIds.has(u.id)
            ).length;
          }
        }
        
      } else if (userPref.preference_type === 'province') {
        // For province: Get users competing for this province
        const { data: competingUsers, error } = await supabaseAdmin
          .rpc('get_users_competing_for_province', {
            target_province: userPref.preference_value,
            target_specialty: userPref.specialty
          });

        if (competingUsers && !error) {
          const competingUserIds = new Set(competingUsers.map((u: any) => u.user_id));
          // Filter only users ahead
          if (allUsers) {
            usersInProvince = allUsers.filter(u => 
              u.eir_position < userPosition && competingUserIds.has(u.id)
            ).length;
          }
        }
        
      } else if (userPref.preference_type === 'community') {
        // For community: Get users competing for any province in this community
        const provincesInCommunity = PROVINCE_TO_COMMUNITY
          .filter(p => p.community === userPref.preference_value)
          .map(p => p.province);

        // Call RPC for each province and combine results
        const allCompetingUserIds = new Set<string>();
        
        for (const province of provincesInCommunity) {
          const { data: competingUsers, error } = await supabaseAdmin
            .rpc('get_users_competing_for_province', {
              target_province: province,
              target_specialty: userPref.specialty
            });

          if (competingUsers && !error) {
            competingUsers.forEach((u: any) => allCompetingUserIds.add(u.user_id));
          }
        }

        // Filter only users ahead
        if (allUsers) {
          usersInProvince = allUsers.filter(u => 
            u.eir_position < userPosition && allCompetingUserIds.has(u.id)
          ).length;
        }
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
        assignedPosition: userAssignedPosition,
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
