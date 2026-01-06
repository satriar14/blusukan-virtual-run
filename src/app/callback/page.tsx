'use client';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { CheckCircle, LogOut, RotateCw } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Leaderboard from '../components/Leaderboard';
import ResultActivities from '../components/ResultActivities';
import { getAccessToken } from '../lib/strava';

type Athlete = {
  id: number;
  firstname: string;
  lastname: string;
  profile?: string;
  profile_medium?: string;
  city?: string;
  state?: string;
  country?: string;
};

type Event = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  targetDistance: number;
  status: string;
};

type LeaderboardEntry = {
  rank: number;
  participantId: string;
  athleteId: number;
  athleteName: string;
  athleteProfile?: string;
  totalDistance: number;
  totalTime: number;
  validActivities: number;
  invalidActivities: number;
  pace: number;
};

export default function Callback() {
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const code = new URLSearchParams(window.location.search).get('code');
      const localAccessToken = localStorage.getItem('stravaAccessToken');
      const localAthlete = localStorage.getItem('athlete');
      const localParticipantId = localStorage.getItem('participantId');

      if (localAthlete) {
        try {
          setAthlete(JSON.parse(localAthlete));
        } catch (e) {
          console.error('Failed to parse athlete data:', e);
        }
      }

      if (localAccessToken) {
        try {
          const parsedToken = JSON.parse(localAccessToken);
          setAccessToken(parsedToken?.access_token || parsedToken);
        } catch (e) {
          console.error('Failed to parse access token:', e);
        }
      }

      if (localParticipantId) {
        setParticipantId(localParticipantId);
        setIsRegistered(true);
      }

      if (code && !localAccessToken) {
        try {
          const data = await getAccessToken(code);
          if (data) {
            setAthlete(data.athlete);
            setAccessToken(data.access_token);
            localStorage.setItem('athlete', JSON.stringify(data.athlete));
            await registerParticipant(data);
            window.history.replaceState({}, document.title, '/callback');
          }
        } catch (e) {
          console.error('Failed to get access token:', e);
          toast.error('Login failed. Please try again.');
        }
      }

      setInitialLoading(false);
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (!initialLoading) {
      fetchLeaderboard();
    }
  }, [initialLoading]);

  const registerParticipant = async (tokenData: any) => {
    try {
      const res = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          athleteId: tokenData.athlete.id,
          athleteName: `${tokenData.athlete.firstname} ${tokenData.athlete.lastname}`,
          athleteProfile: tokenData.athlete.profile_medium || tokenData.athlete.profile,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresAt: tokenData.expires_at,
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        setParticipantId(data.participant.id);
        setIsRegistered(true);
        localStorage.setItem('participantId', data.participant.id);
        toast.success(data.isNewRegistration ? 'Berhasil terdaftar di event!' : 'Selamat datang kembali!');
      }
    } catch (e) {
      console.error('Failed to register participant:', e);
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      
      if (data.success) {
        setEvent(data.event);
        setLeaderboard(data.leaderboard);
      }
    } catch (e) {
      console.error('Failed to fetch leaderboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const syncActivities = async () => {
    if (!athlete) return;
    
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ athleteId: athlete.id }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSyncResult(data.results);
        toast.success(data.message);
        await fetchLeaderboard();
      } else {
        toast.error(data.error || 'Failed to sync activities');
      }
    } catch (e) {
      console.error('Failed to sync activities:', e);
      toast.error('Failed to sync activities');
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('stravaAccessToken');
    localStorage.removeItem('athlete');
    localStorage.removeItem('participantId');
    window.location.href = '/';
  };

  const myStats = leaderboard.find(e => e.athleteId === athlete?.id);

  if (initialLoading) {
    return (
      <div className="container-app bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Spinner className="w-8 h-8 mx-auto" />
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!athlete) {
    return (
      <div className="container-app bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Processing login...</p>
          <Spinner className="w-8 h-8 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="container-app bg-slate-100 px-4 py-6 overflow-y-auto">
      {/* Header with Logo */}
      <div className="flex flex-col items-center mb-6">
        <Image
          src="/Logo blusukan-01.jpg"
          alt="Blusukan Logo"
          className="rounded-full shadow-lg border-2 border-orange-500/30"
          width={80}
          height={80}
          priority
        />
        <h1 className="text-xl font-bold text-slate-800 mt-3">
          Virtual Run Blusukan
        </h1>
      </div>

      {/* User Profile Card */}
      <div className="bg-white rounded-2xl p-5 shadow-md mb-6">
        <div className="flex items-center gap-4">
          {(athlete.profile_medium || athlete.profile) && (
            <img
              src={athlete.profile_medium || athlete.profile}
              alt="Profile"
              className="w-14 h-14 rounded-full border-2 border-orange-500"
            />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">
                {athlete.firstname} {athlete.lastname}
              </h2>
              {isRegistered && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </div>
            {isRegistered && (
              <p className="text-sm text-green-600">✓ Terdaftar di event</p>
            )}
            {(athlete.city || athlete.state) && (
              <p className="text-sm text-slate-400">
                {[athlete.city, athlete.state, athlete.country]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <Button
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold h-11 rounded-xl"
            onClick={syncActivities}
            disabled={syncing}
          >
            {syncing ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Syncing...
              </>
            ) : (
              <>
                <RotateCw className="w-4 h-4 mr-2" />
                Sync Activities
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="h-11 rounded-xl"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Sync Result */}
        {syncResult && (
          <div className="mt-4 p-3 bg-slate-50 rounded-xl text-sm">
            <p className="font-medium text-slate-700">Sync Result:</p>
            <div className="flex gap-4 mt-1 text-slate-600">
              <span>✅ Valid: {syncResult.valid}</span>
              <span>❌ Invalid: {syncResult.invalid}</span>
              <span>⏭️ Skipped: {syncResult.skipped}</span>
            </div>
          </div>
        )}
      </div>

      {/* Challenge Info */}
      {event && (
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl px-5 py-4 mb-6">
          <h3 className="text-white font-bold text-lg mb-1">🏃 {event.name}</h3>
          <p className="text-slate-300 text-sm">
            {new Date(event.startDate).getDate()} - {new Date(event.endDate).getDate()}{' '}
            {new Date(event.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            {' '}• Target: {event.targetDistance} km
          </p>
        </div>
      )}

      {/* My Progress */}
      {myStats && (
        <ResultActivities 
          totalDistance={myStats.totalDistance}
          totalTime={myStats.totalTime}
          validActivities={myStats.validActivities}
          invalidActivities={myStats.invalidActivities}
          targetDistance={event?.targetDistance || 300}
          endDate={event?.endDate}
        />
      )}

      {/* Leaderboard */}
      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner className="w-8 h-8" />
          </div>
        ) : (
          <Leaderboard 
            entries={leaderboard} 
            currentAthleteId={athlete.id}
            event={event}
          />
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 py-4 text-center">
        <p className="text-slate-400 text-sm">
          Data from Strava API • © 2025 Blusukan
        </p>
      </div>
    </div>
  );
}
