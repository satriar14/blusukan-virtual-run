import { createEvent, getActiveEvent, getEvents } from '@/app/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/events - List all events
export async function GET() {
  try {
    const events = getEvents();
    const activeEvent = getActiveEvent();
    
    return NextResponse.json({
      success: true,
      events,
      activeEvent,
    });
  } catch (error) {
    console.error('Failed to get events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get events' },
      { status: 500 }
    );
  }
}

// POST /api/events - Create new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { name, description, startDate, endDate, targetDistance, status } = body;
    
    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, startDate, endDate' },
        { status: 400 }
      );
    }
    
    const event = createEvent({
      name,
      description: description || '',
      startDate,
      endDate,
      targetDistance: targetDistance || 300,
      status: status || 'active',
    });
    
    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error('Failed to create event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
