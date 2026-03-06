import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { PROVINCE_TO_COMMUNITY, ALL_HOSPITALS, ALL_PROVINCES, ALL_COMMUNITIES } from '@/lib/eir-data';

// GET - Get all available options for a given type from offered_positions table
// Falls back to static lists if offered_positions is empty
// If specialty is provided, filters to only show options where that specialty is available
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // hospital, province, community
    const specialty = searchParams.get('specialty'); // optional - filter by specialty
    const filter = searchParams.get('filter') || ''; // optional filter text

    if (!type) {
      return NextResponse.json(
        { error: 'Missing type parameter' },
        { status: 400 }
      );
    }

    let options: string[] = [];
    let fromDatabase = true;

    switch (type) {
      case 'hospital':
        // Get distinct centers (hospitals) from offered_positions
        // Filter by specialty if provided
        let hospitalQuery = supabaseAdmin
          .from('offered_positions')
          .select('center');
        
        if (specialty) {
          hospitalQuery = hospitalQuery.eq('specialty', specialty);
        }
        
        const { data: hospitals, error: hospitalError } = await hospitalQuery.order('center');
        
        if (hospitalError) {
          console.error('Error querying offered_positions:', hospitalError);
          // Fallback to static list only if no specialty filter
          options = specialty ? [] : ALL_HOSPITALS;
          fromDatabase = false;
        } else if (!hospitals || hospitals.length === 0) {
          // Database is empty or no results for this specialty
          if (specialty) {
            // No hospitals for this specialty - return empty
            options = [];
            fromDatabase = true;
          } else {
            console.warn('offered_positions table is empty, using static list');
            options = ALL_HOSPITALS;
            fromDatabase = false;
          }
        } else {
          options = Array.from(new Set(hospitals.map(h => h.center))).sort();
        }
        break;

      case 'province':
        // Get distinct provinces from offered_positions
        // Filter by specialty if provided
        let provinceQuery = supabaseAdmin
          .from('offered_positions')
          .select('province');
        
        if (specialty) {
          provinceQuery = provinceQuery.eq('specialty', specialty);
        }
        
        const { data: provinces, error: provinceError } = await provinceQuery.order('province');
        
        if (provinceError) {
          console.error('Error querying offered_positions:', provinceError);
          options = specialty ? [] : ALL_PROVINCES;
          fromDatabase = false;
        } else if (!provinces || provinces.length === 0) {
          if (specialty) {
            // No provinces for this specialty - return empty
            options = [];
            fromDatabase = true;
          } else {
            console.warn('offered_positions table is empty, using static list');
            options = ALL_PROVINCES;
            fromDatabase = false;
          }
        } else {
          options = Array.from(new Set(provinces.map(p => p.province))).sort();
        }
        break;

      case 'community':
        // Get distinct provinces and map to communities
        // Filter by specialty if provided
        let communityQuery = supabaseAdmin
          .from('offered_positions')
          .select('province');
        
        if (specialty) {
          communityQuery = communityQuery.eq('specialty', specialty);
        }
        
        const { data: provincesForCommunity, error: communityError } = await communityQuery;
        
        if (communityError || !provincesForCommunity || provincesForCommunity.length === 0) {
          if (communityError) {
            console.error('Error querying offered_positions:', communityError);
            options = specialty ? [] : ALL_COMMUNITIES;
            fromDatabase = false;
          } else if (specialty) {
            // No communities for this specialty - return empty
            options = [];
            fromDatabase = true;
          } else {
            console.warn('offered_positions table is empty, using static list');
            options = ALL_COMMUNITIES;
            fromDatabase = false;
          }
        } else {
          const uniqueProvinces = Array.from(new Set(provincesForCommunity.map(p => p.province)));
          const communities = new Set<string>();
          
          uniqueProvinces.forEach(province => {
            const mapping = PROVINCE_TO_COMMUNITY.find(m => m.province === province);
            if (mapping) {
              communities.add(mapping.community);
            }
          });
          
          options = Array.from(communities).sort();
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid type. Must be hospital, province, or community' },
          { status: 400 }
        );
    }

    // Apply filter if provided
    if (filter) {
      const filterLower = filter.toLowerCase();
      options = options.filter(option => 
        option.toLowerCase().includes(filterLower)
      );
    }

    return NextResponse.json({ 
      data: options,
      total: options.length,
      source: fromDatabase ? 'database' : 'static' // Indicates data source
    });
  } catch (error: any) {
    console.error('Error fetching options:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch options' },
      { status: 500 }
    );
  }
}
