import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Search for positions/provinces/communities (uses anon key, read-only)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // hospital, province, community
    const search = searchParams.get('search') || '';

    if (!type) {
      return NextResponse.json(
        { error: 'Missing type parameter' },
        { status: 400 }
      );
    }

    let data: any[] = [];

    if (type === 'hospital') {
      const { data: positions, error } = await supabase
        .from('offered_positions')
        .select('center')
        .ilike('center', `%${search}%`)
        .limit(10);

      if (error) throw error;
      data = Array.from(new Set(positions?.map(p => p.center) || [])).map(center => ({ value: center }));
    } else if (type === 'province') {
      const { data: positions, error } = await supabase
        .from('offered_positions')
        .select('province')
        .ilike('province', `%${search}%`)
        .limit(10);

      if (error) throw error;
      data = Array.from(new Set(positions?.map(p => p.province) || [])).map(province => ({ value: province }));
    } else if (type === 'community') {
      const { data: communities, error } = await supabase
        .from('autonomous_communities')
        .select('community')
        .ilike('community', `%${search}%`)
        .limit(10);

      if (error) throw error;
      data = Array.from(new Set(communities?.map(c => c.community) || [])).map(community => ({ value: community }));
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Must be hospital, province, or community' },
        { status: 400 }
      );
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error searching:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search' },
      { status: 500 }
    );
  }
}
