'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trophy, UserPlus } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Leaderboard from '../components/Leaderboard';

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

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityName, setActivityName] = useState('');
  const [distance, setDistance] = useState('');
  const [movingTime, setMovingTime] = useState('');
  const [activityDate, setActivityDate] = useState<Date | undefined>(new Date());
  const [addingActivity, setAddingActivity] = useState(false);

  useEffect(() => {
    const storedParticipantId = localStorage.getItem('manualParticipantId');
    const storedName = localStorage.getItem('participantName');
    
    if (storedParticipantId) {
      setParticipantId(storedParticipantId);
      setIsRegistered(true);
    }
    if (storedName) {
      setName(storedName);
    }
    
    fetchLeaderboard();
  }, []);

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

  const handleRegister = async () => {
    if (!name.trim()) {
      toast.error('Masukkan nama Anda');
      return;
    }
    
    setRegistering(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      
      if (data.success) {
        setParticipantId(data.participant.id);
        setIsRegistered(true);
        localStorage.setItem('manualParticipantId', data.participant.id);
        localStorage.setItem('participantName', name.trim());
        toast.success('Berhasil terdaftar!');
        await fetchLeaderboard();
      } else {
        toast.error(data.error || 'Gagal mendaftar');
      }
    } catch (e) {
      toast.error('Gagal mendaftar');
    } finally {
      setRegistering(false);
    }
  };

  const handleAddActivity = async () => {
    if (!participantId) return;
    
    const distanceNum = parseFloat(distance);
    const timeNum = parseFloat(movingTime);
    
    if (!distanceNum || distanceNum <= 0) {
      toast.error('Jarak harus lebih dari 0');
      return;
    }
    if (!timeNum || timeNum <= 0) {
      toast.error('Waktu harus lebih dari 0');
      return;
    }
    
    setAddingActivity(true);
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId,
          name: activityName || `Run ${activityDate ? format(activityDate, 'dd MMM') : ''}`,
          distance: distanceNum,
          movingTime: timeNum,
          startDate: activityDate?.toISOString() || new Date().toISOString(),
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(data.activity.isValid ? 'Aktivitas berhasil ditambahkan! ✅' : 'Aktivitas ditambahkan (tidak valid) ❌');
        setShowActivityModal(false);
        setActivityName('');
        setDistance('');
        setMovingTime('');
        setActivityDate(new Date());
        await fetchLeaderboard();
      } else {
        toast.error(data.error);
      }
    } catch (e) {
      toast.error('Gagal menambahkan aktivitas');
    } finally {
      setAddingActivity(false);
    }
  };

  const myEntry = leaderboard.find(e => e.participantId === participantId);

  return (
    <div className="container-app bg-slate-100 px-4 py-6 overflow-y-auto">
      <div className="flex flex-col items-center mb-6">
        <Image src="/Logo blusukan-01.jpg" alt="Logo" className="rounded-full shadow-lg border-2 border-orange-500/30" width={80} height={80} priority />
        <h1 className="text-xl font-bold text-slate-800 mt-3">Virtual Run Blusukan</h1>
        <p className="text-slate-500 text-sm">Daftar & Input Aktivitas Manual</p>
      </div>

      {event && (
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl px-5 py-4 mb-6">
          <h3 className="text-white font-bold text-lg mb-1">🏃 {event.name}</h3>
          <p className="text-slate-300 text-sm">
            {new Date(event.startDate).getDate()} - {new Date(event.endDate).getDate()}{' '}
            {new Date(event.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} • Target: {event.targetDistance} km
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl p-5 shadow-md mb-6">
        {!isRegistered ? (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800">📝 Daftar Sekarang</h3>
            <Input 
              placeholder="Nama lengkap" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="h-11"
            />
            <Button 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold h-11"
              onClick={handleRegister}
              disabled={registering}
            >
              {registering ? <Spinner className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
              Daftar Event
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-800">{name}</h3>
                <p className="text-sm text-green-600">✓ Terdaftar</p>
                {myEntry && <p className="text-sm text-slate-500">Rank #{myEntry.rank} • {(myEntry.totalDistance / 1000).toFixed(2)} km</p>}
              </div>
              <Trophy className="w-8 h-8 text-orange-500" />
            </div>
            <Button 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold h-11"
              onClick={() => setShowActivityModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Aktivitas Lari
            </Button>
          </>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner className="w-8 h-8" />
        </div>
      ) : (
        <Leaderboard entries={leaderboard} currentAthleteId={myEntry?.athleteId} event={event} />
      )}

      <Dialog open={showActivityModal} onOpenChange={setShowActivityModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Aktivitas Lari</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nama (opsional)</Label>
              <Input 
                placeholder="Morning Run" 
                value={activityName} 
                onChange={(e) => setActivityName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Jarak (km) *</Label>
              <Input 
                type="number"
                step="0.1"
                placeholder="5.5" 
                value={distance} 
                onChange={(e) => setDistance(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Waktu (menit) *</Label>
              <Input 
                type="number"
                placeholder="30" 
                value={movingTime} 
                onChange={(e) => setMovingTime(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Tanggal *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !activityDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {activityDate ? format(activityDate, "PPP") : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={activityDate}
                    onSelect={setActivityDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold h-11"
              onClick={handleAddActivity}
              disabled={addingActivity}
            >
              {addingActivity && <Spinner className="w-4 h-4 mr-2" />}
              Simpan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="mt-8 py-4 text-center">
        <a href="/" className="text-orange-500 text-sm hover:underline">← Kembali ke Homepage</a>
      </div>
    </div>
  );
}
