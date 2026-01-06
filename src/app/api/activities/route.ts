import {
    createActivity,
    getEvent,
    getParticipants,
    validateActivity
} from '@/app/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/activities - Manually add activity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { 
      participantId,
      name,
      distance, // in km
      movingTime, // in minutes
      startDate,
      type = 'Run'
    } = body;
    
    if (!participantId || !distance || !movingTime || !startDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: participantId, distance, movingTime, startDate' },
        { status: 400 }
      );
    }
    
    // Get participant
    const participants = getParticipants();
    const participant = participants.find(p => p.id === participantId);
    
    if (!participant) {
      return NextResponse.json(
        { success: false, error: 'Participant not found' },
        { status: 404 }
      );
    }
    
    // Get event
    const event = getEvent(participant.eventId);
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Convert to proper units (km to meters, minutes to seconds)
    const distanceMeters = distance * 1000;
    const movingTimeSeconds = movingTime * 60;
    
    // Validate activity
    const validation = validateActivity(
      { type, distance: distanceMeters, startDate },
      event
    );
    
    // Create activity with a unique manual ID
    const manualId = Date.now() + Math.floor(Math.random() * 10000);
    
    const activity = createActivity({
      participantId: participant.id,
      eventId: event.id,
      stravaActivityId: manualId, // Use timestamp as unique ID for manual entries
      name: name || `Manual Run - ${new Date(startDate).toLocaleDateString()}`,
      distance: distanceMeters,
      movingTime: movingTimeSeconds,
      startDate,
      type,
      isValid: validation.isValid,
      validationNote: validation.note,
    });
    
    return NextResponse.json({
      success: true,
      activity: {
        id: activity.id,
        name: activity.name,
        distance: activity.distance,
        movingTime: activity.movingTime,
        isValid: activity.isValid,
        validationNote: activity.validationNote,
      },
    });
  } catch (error: any) {
    console.error('Failed to add activity:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add activity' },
      { status: 500 }
    );
  }
}

// GET /api/activities - Get activities 
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const participantId = searchParams.get('participantId');
    const eventId = searchParams.get('eventId');
    
    const { getActivities } = await import('@/app/lib/db');
    const activities = getActivities(eventId || undefined, participantId || undefined);
    
    return NextResponse.json({
      success: true,
      activities,
      total: activities.length,
    });
  } catch (error) {
    console.error('Failed to get activities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get activities' },
      { status: 500 }
    );
  }
}
