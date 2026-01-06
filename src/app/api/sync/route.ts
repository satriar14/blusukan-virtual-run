import {
    createActivity,
    getActiveEvent,
    getActivityByStravaId,
    getEvent,
    getParticipant,
    getParticipants,
    updateParticipant,
    validateActivity,
} from '@/app/lib/db';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

const STRAVA_API_BASE = 'https://www.strava.com/api/v3';
const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/token';

// Refresh token if expired
async function refreshTokenIfNeeded(participant: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  
  if (participant.expiresAt > now + 300) {
    // Token still valid for more than 5 minutes
    return participant.accessToken;
  }
  
  // Refresh token
  try {
    const res = await axios.post(STRAVA_AUTH_URL, {
      client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
      client_secret: process.env.NEXT_PUBLIC_STRAVA_CLIENT_SECRET,
      refresh_token: participant.refreshToken,
      grant_type: 'refresh_token',
    });
    
    // Update participant with new tokens
    updateParticipant(participant.id, {
      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token,
      expiresAt: res.data.expires_at,
    });
    
    return res.data.access_token;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    throw new Error('Failed to refresh Strava token');
  }
}

// POST /api/sync - Sync activities from Strava
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { participantId, athleteId, eventId } = body;
    
    // Find participant
    let participant;
    if (participantId) {
      participant = getParticipant(participantId);
    } else if (athleteId) {
      const activeEvent = eventId ? getEvent(eventId) : getActiveEvent();
      if (!activeEvent) {
        return NextResponse.json(
          { success: false, error: 'No active event found' },
          { status: 400 }
        );
      }
      const participants = getParticipants(activeEvent.id);
      participant = participants.find(p => p.athleteId === athleteId);
    }
    
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
    
    // Get valid access token
    const accessToken = await refreshTokenIfNeeded(participant);
    
    // Fetch activities from Strava
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    endDate.setHours(23, 59, 59, 999);
    
    const res = await axios.get(`${STRAVA_API_BASE}/athlete/activities`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        after: Math.floor(startDate.getTime() / 1000),
        before: Math.floor(endDate.getTime() / 1000),
        per_page: 200,
      },
    });
    
    const stravaActivities = res.data;
    
    // Process and validate each activity
    const results = {
      synced: 0,
      skipped: 0,
      valid: 0,
      invalid: 0,
      activities: [] as any[],
    };
    
    for (const stravaActivity of stravaActivities) {
      // Check if already synced
      const existing = getActivityByStravaId(stravaActivity.id);
      if (existing) {
        results.skipped++;
        continue;
      }
      
      // Validate activity
      const validation = validateActivity(
        {
          type: stravaActivity.type,
          distance: stravaActivity.distance,
          startDate: stravaActivity.start_date,
        },
        event
      );
      
      // Create activity record
      const activity = createActivity({
        participantId: participant.id,
        eventId: event.id,
        stravaActivityId: stravaActivity.id,
        name: stravaActivity.name,
        distance: stravaActivity.distance,
        movingTime: stravaActivity.moving_time,
        startDate: stravaActivity.start_date,
        type: stravaActivity.type,
        isValid: validation.isValid,
        validationNote: validation.note,
      });
      
      results.synced++;
      if (validation.isValid) {
        results.valid++;
      } else {
        results.invalid++;
      }
      
      results.activities.push({
        id: activity.id,
        name: activity.name,
        distance: activity.distance,
        isValid: activity.isValid,
        validationNote: activity.validationNote,
      });
    }
    
    return NextResponse.json({
      success: true,
      message: `Synced ${results.synced} activities (${results.valid} valid, ${results.invalid} invalid), skipped ${results.skipped} duplicates`,
      results,
    });
  } catch (error: any) {
    console.error('Failed to sync activities:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to sync activities',
        details: error.response?.data || null
      },
      { status: 500 }
    );
  }
}
