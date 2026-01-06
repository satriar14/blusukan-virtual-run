import {
    createParticipant,
    getActiveEvent,
    getParticipantByAthleteId,
    getParticipants
} from '@/app/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/participants - List participants
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    
    const participants = getParticipants(eventId || undefined);
    
    // Remove sensitive token data from response
    const safeParticipants = participants.map(p => ({
      id: p.id,
      eventId: p.eventId,
      athleteId: p.athleteId,
      athleteName: p.athleteName,
      athleteProfile: p.athleteProfile,
      registeredAt: p.registeredAt,
    }));
    
    return NextResponse.json({
      success: true,
      participants: safeParticipants,
      total: safeParticipants.length,
    });
  } catch (error) {
    console.error('Failed to get participants:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get participants' },
      { status: 500 }
    );
  }
}

// POST /api/participants - Register participant after OAuth
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { 
      athleteId, 
      athleteName, 
      athleteProfile,
      accessToken, 
      refreshToken, 
      expiresAt,
      eventId 
    } = body;
    
    if (!athleteId || !accessToken) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: athleteId, accessToken' },
        { status: 400 }
      );
    }
    
    // Get active event if eventId not provided
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
    
    // Check if already registered
    const existing = getParticipantByAthleteId(athleteId, targetEventId);
    
    const participant = createParticipant({
      eventId: targetEventId,
      athleteId,
      athleteName: athleteName || `Athlete ${athleteId}`,
      athleteProfile,
      accessToken,
      refreshToken: refreshToken || '',
      expiresAt: expiresAt || 0,
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
      isNewRegistration: !existing,
    });
  } catch (error) {
    console.error('Failed to register participant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to register participant' },
      { status: 500 }
    );
  }
}
