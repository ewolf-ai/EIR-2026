import { NextRequest, NextResponse } from 'next/server';
import { ALL_HOSPITALS, ALL_PROVINCES, ALL_COMMUNITIES } from '@/lib/eir-data';

// GET - Get all available options for a given type
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // hospital, province, community
    const filter = searchParams.get('filter') || ''; // optional filter text

    if (!type) {
      return NextResponse.json(
        { error: 'Missing type parameter' },
        { status: 400 }
      );
    }

    let options: string[] = [];

    switch (type) {
      case 'hospital':
        options = ALL_HOSPITALS;
        break;
      case 'province':
        options = ALL_PROVINCES;
        break;
      case 'community':
        options = ALL_COMMUNITIES;
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
      total: options.length 
    });
  } catch (error: any) {
    console.error('Error fetching options:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch options' },
      { status: 500 }
    );
  }
}
