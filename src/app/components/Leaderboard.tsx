'use client';

import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Table, TableProps } from 'antd';

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

type Event = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  targetDistance: number;
  status: string;
};

type Props = {
  entries: LeaderboardEntry[];
  currentAthleteId?: number;
  event?: Event | null;
};

const Leaderboard = ({ entries, currentAthleteId, event }: Props) => {
  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-sm shadow-md">
            🥇
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center text-sm shadow-md">
            🥈
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-sm shadow-md">
            🥉
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-sm font-semibold text-slate-600">
            {rank}
          </div>
        );
    }
  };

  const formatPace = (pace: number) => {
    if (pace === 0) return '-';
    const mins = Math.floor(pace / 60);
    const secs = Math.floor(pace % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}/km`;
  };

  const columns: TableProps<LeaderboardEntry>['columns'] = [
    {
      title: '#',
      key: 'rank',
      align: 'center',
      width: 50,
      render: (_, record) => getRankBadge(record.rank),
    },
    {
      title: 'Athlete',
      key: 'name',
      render: (_, record) => {
        const isCurrentUser = record.athleteId === currentAthleteId;
        return (
          <div className={`py-1 ${isCurrentUser ? 'bg-orange-50 -mx-4 px-4 rounded' : ''}`}>
            <div className="flex items-center gap-2">
              <span className={`font-medium ${isCurrentUser ? 'text-orange-600' : 'text-slate-800'}`}>
                {record.athleteName}
              </span>
              {isCurrentUser && <span className="text-xs text-orange-500">(You)</span>}
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="flex items-center gap-1">
                <CheckCircleOutlined className="text-green-500" />
                {record.validActivities}
              </span>
              {record.invalidActivities > 0 && (
                <span className="flex items-center gap-1">
                  <CloseCircleOutlined className="text-red-400" />
                  {record.invalidActivities}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      align: 'right',
      title: 'Distance',
      key: 'totalDistance',
      width: 90,
      render: (_, record) => (
        <div>
          <div className="font-bold text-blue-600">
            {(record.totalDistance / 1000).toFixed(2)} km
          </div>
          <div className="text-xs text-slate-400">
            {formatPace(record.pace)}
          </div>
        </div>
      ),
    },
  ];

  // Format date range
  const dateRangeText = event
    ? `${new Date(event.startDate).getDate()} - ${new Date(event.endDate).getDate()} ${new Date(event.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
    : '';

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          🏆 Leaderboard
        </h2>
        <p className="text-slate-300 text-sm">
          {dateRangeText} • {entries.length} participants
        </p>
      </div>
      <Table
        columns={columns}
        dataSource={entries}
        rowKey={(record) => record.participantId}
        pagination={false}
        locale={{ emptyText: 'No participants yet. Be the first to join!' }}
        rowClassName={(record) => 
          record.athleteId === currentAthleteId ? 'bg-orange-50' : ''
        }
      />
    </div>
  );
};

export default Leaderboard;
