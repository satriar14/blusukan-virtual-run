import {
    createParticipant,
    getActiveEvent,
    getEvent,
} from '@/app/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/register - Manual registration without Strava OAuth
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { name, eventId } = body;
    
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Name is required (min 2 characters)' },
        { status: 400 }
      );
    }
    
    // Get active event if not provided
    let targetEventId = eventId;
    if (!targetEventId) {
      const activeEvent = getActiveEvent();
      if (!activeEvent) {
        return NextResponse.json(
          { success: false, error: 'No active event found' },
          { status: 400 }
        );
      }
      targetEventId = activeEvent.id;
    }
    
    // Verify event exists
    const event = getEvent(targetEventId);
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Generate a unique athlete ID for manual registrations
    const manualAthleteId = Date.now() + Math.floor(Math.random() * 10000);
    
    const participant = createParticipant({
      eventId: targetEventId,
      athleteId: manualAthleteId,
      athleteName: name.trim(),
      athleteProfile: undefined,
      accessToken: '', // Empty for manual registration
      refreshToken: '',
      expiresAt: 0,
    });
    
    return NextResponse.json({
      success: true,
      participant: {
        id: participant.id,
        eventId: participant.eventId,
        athleteId: participant.athleteId,
        athleteName: participant.athleteName,
        registeredAt: participant.registeredAt,
      },
      event: {
        id: event.id,
        name: event.name,
        startDate: event.startDate,
        endDate: event.endDate,
        targetDistance: event.targetDistance,
      },
    });
  } catch (error: any) {
    console.error('Failed to register:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to register' },
      { status: 500 }
    );
  }
}
