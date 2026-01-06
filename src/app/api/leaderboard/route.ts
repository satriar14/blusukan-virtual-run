import { getActiveEvent, getEvent, getLeaderboard } from '@/app/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/leaderboard - Get leaderboard for event
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    
    // Get event
    let event;
    if (eventId) {
      event = getEvent(eventId);
    } else {
      event = getActiveEvent();
    }
    
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'No event found' },
        { status: 404 }
      );
    }
    
    const leaderboard = getLeaderboard(event.id);
    
    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        name: event.name,
        startDate: event.startDate,
        endDate: event.endDate,
        targetDistance: event.targetDistance,
        status: event.status,
      },
      leaderboard,
      totalParticipants: leaderboard.length,
    });
  } catch (error) {
    console.error('Failed to get leaderboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get leaderboard' },
      { status: 500 }
    );
  }
}
