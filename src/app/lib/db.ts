import fs from 'fs';
import path from 'path';

// Data directory path
const DATA_DIR = path.join(process.cwd(), 'src', 'app', 'data');

// Types
export interface Event {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  targetDistance: number; // in km
  status: 'upcoming' | 'active' | 'completed';
  createdAt: string;
}

export interface Participant {
  id: string;
  eventId: string;
  athleteId: number;
  athleteName: string;
  athleteProfile?: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  registeredAt: string;
}

export interface Activity {
  id: string;
  participantId: string;
  eventId: string;
  stravaActivityId: number;
  name: string;
  distance: number; // in meters
  movingTime: number; // in seconds
  startDate: string;
  type: string;
  isValid: boolean;
  validationNote: string;
  syncedAt: string;
}

// Helper to ensure data files exist
function ensureDataFile(filename: string, defaultData: any) {
  const filepath = path.join(DATA_DIR, filename);
  
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, JSON.stringify(defaultData, null, 2));
  }
  
  return filepath;
}

// Read data from file
function readData<T>(filename: string, defaultData: T): T {
  const filepath = ensureDataFile(filename, defaultData);
  try {
    const data = fs.readFileSync(filepath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return defaultData;
  }
}

// Write data to file
function writeData<T>(filename: string, data: T): void {
  const filepath = ensureDataFile(filename, data);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

// ============ EVENTS ============

export function getEvents(): Event[] {
  const data = readData<{ events: Event[] }>('events.json', { events: [] });
  return data.events;
}

export function getEvent(id: string): Event | undefined {
  return getEvents().find((e) => e.id === id);
}

export function getActiveEvent(): Event | undefined {
  return getEvents().find((e) => e.status === 'active');
}

export function createEvent(event: Omit<Event, 'id' | 'createdAt'>): Event {
  const events = getEvents();
  const newEvent: Event = {
    ...event,
    id: `event-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  events.push(newEvent);
  writeData('events.json', { events });
  return newEvent;
}

export function updateEvent(id: string, updates: Partial<Event>): Event | null {
  const events = getEvents();
  const index = events.findIndex((e) => e.id === id);
  if (index === -1) return null;
  
  events[index] = { ...events[index], ...updates };
  writeData('events.json', { events });
  return events[index];
}

// ============ PARTICIPANTS ============

export function getParticipants(eventId?: string): Participant[] {
  const data = readData<{ participants: Participant[] }>('participants.json', { participants: [] });
  if (eventId) {
    return data.participants.filter((p) => p.eventId === eventId);
  }
  return data.participants;
}

export function getParticipant(id: string): Participant | undefined {
  return getParticipants().find((p) => p.id === id);
}

export function getParticipantByAthleteId(athleteId: number, eventId: string): Participant | undefined {
  return getParticipants().find((p) => p.athleteId === athleteId && p.eventId === eventId);
}

export function createParticipant(participant: Omit<Participant, 'id' | 'registeredAt'>): Participant {
  const participants = getParticipants();
  
  // Check if already registered
  const existing = participants.find(
    (p) => p.athleteId === participant.athleteId && p.eventId === participant.eventId
  );
  if (existing) {
    // Update tokens
    return updateParticipant(existing.id, {
      accessToken: participant.accessToken,
      refreshToken: participant.refreshToken,
      expiresAt: participant.expiresAt,
    }) as Participant;
  }
  
  const newParticipant: Participant = {
    ...participant,
    id: `participant-${Date.now()}`,
    registeredAt: new Date().toISOString(),
  };
  participants.push(newParticipant);
  writeData('participants.json', { participants });
  return newParticipant;
}

export function updateParticipant(id: string, updates: Partial<Participant>): Participant | null {
  const participants = getParticipants();
  const index = participants.findIndex((p) => p.id === id);
  if (index === -1) return null;
  
  participants[index] = { ...participants[index], ...updates };
  writeData('participants.json', { participants });
  return participants[index];
}

// ============ ACTIVITIES ============

export function getActivities(eventId?: string, participantId?: string): Activity[] {
  const data = readData<{ activities: Activity[] }>('activities.json', { activities: [] });
  let activities = data.activities;
  
  if (eventId) {
    activities = activities.filter((a) => a.eventId === eventId);
  }
  if (participantId) {
    activities = activities.filter((a) => a.participantId === participantId);
  }
  
  return activities;
}

export function getActivityByStravaId(stravaActivityId: number): Activity | undefined {
  return getActivities().find((a) => a.stravaActivityId === stravaActivityId);
}

export function createActivity(activity: Omit<Activity, 'id' | 'syncedAt'>): Activity {
  const activities = getActivities();
  
  // Check for duplicate
  const existing = activities.find((a) => a.stravaActivityId === activity.stravaActivityId);
  if (existing) {
    return existing; // Don't create duplicate
  }
  
  const newActivity: Activity = {
    ...activity,
    id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    syncedAt: new Date().toISOString(),
  };
  activities.push(newActivity);
  writeData('activities.json', { activities });
  return newActivity;
}

export function updateActivity(id: string, updates: Partial<Activity>): Activity | null {
  const activities = getActivities();
  const index = activities.findIndex((a) => a.id === id);
  if (index === -1) return null;
  
  activities[index] = { ...activities[index], ...updates };
  writeData('activities.json', { activities });
  return activities[index];
}

// ============ LEADERBOARD ============

export interface LeaderboardEntry {
  rank: number;
  participantId: string;
  athleteId: number;
  athleteName: string;
  athleteProfile?: string;
  totalDistance: number; // in meters
  totalTime: number; // in seconds
  validActivities: number;
  invalidActivities: number;
  pace: number; // seconds per km
}

export function getLeaderboard(eventId: string): LeaderboardEntry[] {
  const participants = getParticipants(eventId);
  const activities = getActivities(eventId);
  
  const leaderboard: LeaderboardEntry[] = participants.map((p) => {
    const participantActivities = activities.filter((a) => a.participantId === p.id);
    const validActivities = participantActivities.filter((a) => a.isValid);
    const invalidActivities = participantActivities.filter((a) => !a.isValid);
    
    const totalDistance = validActivities.reduce((sum, a) => sum + a.distance, 0);
    const totalTime = validActivities.reduce((sum, a) => sum + a.movingTime, 0);
    const pace = totalDistance > 0 ? (totalTime / totalDistance) * 1000 : 0;
    
    return {
      rank: 0,
      participantId: p.id,
      athleteId: p.athleteId,
      athleteName: p.athleteName,
      athleteProfile: p.athleteProfile,
      totalDistance,
      totalTime,
      validActivities: validActivities.length,
      invalidActivities: invalidActivities.length,
      pace,
    };
  });
  
  // Sort by total distance (descending) and assign ranks
  leaderboard.sort((a, b) => b.totalDistance - a.totalDistance);
  leaderboard.forEach((entry, index) => {
    entry.rank = index + 1;
  });
  
  return leaderboard;
}

// ============ VALIDATION ============

export function validateActivity(
  activity: { type: string; distance: number; startDate: string },
  event: Event
): { isValid: boolean; note: string } {
  // Check activity type
  if (activity.type !== 'Run' && activity.type !== 'VirtualRun') {
    return { isValid: false, note: `Invalid type: ${activity.type}. Must be Run or VirtualRun.` };
  }
  
  // Check distance
  if (activity.distance <= 0) {
    return { isValid: false, note: 'Distance must be greater than 0.' };
  }
  
  // Check date range
  const activityDate = new Date(activity.startDate);
  const eventStart = new Date(event.startDate);
  const eventEnd = new Date(event.endDate);
  eventEnd.setHours(23, 59, 59, 999); // End of day
  
  if (activityDate < eventStart || activityDate > eventEnd) {
    return { 
      isValid: false, 
      note: `Activity date ${activityDate.toLocaleDateString()} is outside event period (${eventStart.toLocaleDateString()} - ${eventEnd.toLocaleDateString()}).` 
    };
  }
  
  return { isValid: true, note: 'Valid activity.' };
}
