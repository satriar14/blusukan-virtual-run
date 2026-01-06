'use client';

import { useState, useEffect } from 'react';
import { Button, Input, message, Spin, Modal, InputNumber, DatePicker } from 'antd';
import '@ant-design/v5-patch-for-react-19';
import Image from 'next/image';
import { UserAddOutlined, PlusOutlined, TrophyOutlined } from '@ant-design/icons';
import Leaderboard from '../components/Leaderboard';
import dayjs from 'dayjs';

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
  
  // Activity modal
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityData, setActivityData] = useState({
    name: '',
    distance: 0,
    movingTime: 0,
    startDate: dayjs(),
  });
  const [addingActivity, setAddingActivity] = useState(false);

  // Check for stored participant
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
      message.error('Masukkan nama Anda');
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
        message.success('Berhasil terdaftar! Sekarang tambahkan aktivitas lari Anda.');
        await fetchLeaderboard();
      } else {
        message.error(data.error || 'Gagal mendaftar');
      }
    } catch (e) {
      console.error('Failed to register:', e);
      message.error('Gagal mendaftar');
    } finally {
      setRegistering(false);
    }
  };

  const handleAddActivity = async () => {
    if (!participantId) {
      message.error('Anda harus terdaftar terlebih dahulu');
      return;
    }
    
    if (activityData.distance <= 0) {
      message.error('Jarak harus lebih dari 0');
      return;
    }
    
    if (activityData.movingTime <= 0) {
      message.error('Waktu harus lebih dari 0');
      return;
    }
    
    setAddingActivity(true);
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId,
          name: activityData.name || `Run ${activityData.startDate.format('DD MMM YYYY')}`,
          distance: activityData.distance,
          movingTime: activityData.movingTime,
          startDate: activityData.startDate.toISOString(),
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        if (data.activity.isValid) {
          message.success(`Aktivitas berhasil ditambahkan! ✅ ${data.activity.validationNote}`);
        } else {
          message.warning(`Aktivitas ditambahkan tapi tidak valid: ❌ ${data.activity.validationNote}`);
        }
        setShowActivityModal(false);
        setActivityData({ name: '', distance: 0, movingTime: 0, startDate: dayjs() });
        await fetchLeaderboard();
      } else {
        message.error(data.error || 'Gagal menambahkan aktivitas');
      }
    } catch (e) {
      console.error('Failed to add activity:', e);
      message.error('Gagal menambahkan aktivitas');
    } finally {
      setAddingActivity(false);
    }
  };

  // Get current user's rank
  const myEntry = leaderboard.find(e => e.participantId === participantId);

  return (
    <div className="container-app bg-slate-100 px-4 py-6 overflow-y-auto">
      {/* Header */}
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
        <p className="text-slate-500 text-sm">Daftar & Input Aktivitas Manual</p>
      </div>

      {/* Event Info */}
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

      {/* Registration / User Card */}
      <div className="bg-white rounded-2xl p-5 shadow-md mb-6">
        {!isRegistered ? (
          <>
            <h3 className="font-semibold text-slate-800 mb-3">📝 Daftar Sekarang</h3>
            <Input
              placeholder="Masukkan nama lengkap Anda"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="!rounded-xl !h-11 mb-3"
              prefix={<UserAddOutlined className="text-slate-400" />}
            />
            <Button
              className="w-full !bg-orange-500 hover:!bg-orange-600 !text-white !font-semibold !h-11 !rounded-xl !border-none"
              onClick={handleRegister}
              loading={registering}
              icon={<UserAddOutlined />}
            >
              Daftar Event
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-800">{name}</h3>
                <p className="text-sm text-green-600">✓ Terdaftar</p>
                {myEntry && (
                  <p className="text-sm text-slate-500">
                    Rank #{myEntry.rank} • {(myEntry.totalDistance / 1000).toFixed(2)} km
                  </p>
                )}
              </div>
              <TrophyOutlined className="text-3xl text-orange-500" />
            </div>
            <Button
              className="w-full !bg-blue-500 hover:!bg-blue-600 !text-white !font-semibold !h-11 !rounded-xl !border-none"
              onClick={() => setShowActivityModal(true)}
              icon={<PlusOutlined />}
            >
              Tambah Aktivitas Lari
            </Button>
          </>
        )}
      </div>

      {/* Leaderboard */}
      <Spin spinning={loading}>
        <Leaderboard 
          entries={leaderboard} 
          currentAthleteId={myEntry?.athleteId}
          event={event}
        />
      </Spin>

      {/* Add Activity Modal */}
      <Modal
        title="Tambah Aktivitas Lari"
        open={showActivityModal}
        onCancel={() => setShowActivityModal(false)}
        footer={null}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Nama Aktivitas (opsional)</label>
            <Input
              placeholder="Morning Run"
              value={activityData.name}
              onChange={(e) => setActivityData({ ...activityData, name: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-600 mb-1">Jarak (km) *</label>
            <InputNumber
              min={0}
              step={0.1}
              className="!w-full"
              placeholder="5.5"
              value={activityData.distance}
              onChange={(v) => setActivityData({ ...activityData, distance: v || 0 })}
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-600 mb-1">Waktu (menit) *</label>
            <InputNumber
              min={0}
              className="!w-full"
              placeholder="30"
              value={activityData.movingTime}
              onChange={(v) => setActivityData({ ...activityData, movingTime: v || 0 })}
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-600 mb-1">Tanggal *</label>
            <DatePicker
              className="!w-full"
              value={activityData.startDate}
              onChange={(d) => setActivityData({ ...activityData, startDate: d || dayjs() })}
              disabledDate={(d) => {
                if (!event) return false;
                return d.isBefore(event.startDate) || d.isAfter(event.endDate);
              }}
            />
          </div>
          
          <Button
            className="w-full !bg-orange-500 hover:!bg-orange-600 !text-white !font-semibold !h-11 !rounded-xl !border-none"
            onClick={handleAddActivity}
            loading={addingActivity}
          >
            Simpan Aktivitas
          </Button>
        </div>
      </Modal>

      {/* Footer */}
      <div className="mt-8 py-4 text-center">
        <p className="text-slate-400 text-sm">© 2025 Blusukan Virtual Run</p>
        <a href="/" className="text-orange-500 text-sm hover:underline">
          ← Kembali ke Homepage
        </a>
      </div>
    </div>
  );
}
