import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * POST /api/recalculate-assignments
 * 
 * Processes the assignment recalculation queue.
 * This endpoint should be called:
 * 1. Manually by admin when needed
 * 2. By a background job (cron) every few minutes
 * 3. After bulk data imports
 * 
 * The actual triggers queue the recalculation automatically when:
 * - User preferences change
 * - User EIR position changes
 * - Offered positions are added/modified
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication check for admin only
    // const authHeader = request.headers.get('authorization');
    // if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Check if there's a pending recalculation in the queue
    const { data: pendingQueue, error: queueError } = await supabaseAdmin
      .from('assignment_recalculation_queue')
      .select('*')
      .eq('processed', false)
      .limit(1);

    if (queueError) {
      throw queueError;
    }

    if (!pendingQueue || pendingQueue.length === 0) {
      return NextResponse.json({
        message: 'No pending recalculations',
        recalculated: false,
      });
    }

    // Process the recalculation queue
    const { data: result, error: recalcError } = await supabaseAdmin
      .rpc('process_assignment_recalculation_queue');

    if (recalcError) {
      throw recalcError;
    }

    if (!result || result.length === 0) {
      return NextResponse.json({
        message: 'No recalculations processed',
        recalculated: false,
      });
    }

    const recalcResult = result[0];

    return NextResponse.json({
      message: 'Assignments recalculated successfully',
      recalculated: true,
      data: {
        queueId: recalcResult.queue_id,
        reason: recalcResult.reason,
        usersProcessed: recalcResult.users_processed,
        usersAssigned: recalcResult.users_assigned,
        calculationTimestamp: recalcResult.calculation_timestamp,
      },
    });
  } catch (error: any) {
    console.error('Error recalculating assignments:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to recalculate assignments' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/recalculate-assignments
 * 
 * Gets the status of the recalculation queue and last calculation
 */
export async function GET(request: NextRequest) {
  try {
    // Get queue status
    const { data: queue, error: queueError } = await supabaseAdmin
      .from('assignment_recalculation_queue')
      .select('*')
      .order('triggered_at', { ascending: false })
      .limit(10);

    if (queueError) {
      throw queueError;
    }

    // Get statistics
    const { data: stats, error: statsError } = await supabaseAdmin
      .from('assignment_statistics')
      .select('*')
      .limit(1);

    if (statsError) {
      throw statsError;
    }

    const statData = stats && stats.length > 0 ? stats[0] : null;

    return NextResponse.json({
      queue: queue || [],
      hasPending: queue?.some((q: any) => !q.processed) || false,
      statistics: statData ? {
        totalUsersWithPosition: statData.total_users_with_position,
        usersWithAssignment: statData.users_with_assignment,
        lastCalculation: statData.last_calculation,
        minutesSinceCalculation: statData.minutes_since_calculation,
      } : null,
    });
  } catch (error: any) {
    console.error('Error getting recalculation status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get recalculation status' },
      { status: 500 }
    );
  }
}
