'use client';

import { Table, TableProps } from 'antd';
import { useMemo } from 'react';

type ClubActivity = {
  athlete: {
    firstname: string;
    lastname: string;
  };
  name: string;
  distance: number;
  moving_time: number;
  total_elevation_gain?: number;
  type: string;
};

type Props = {
  activities?: ClubActivity[];
  startDate?: Date;
  endDate?: Date;
};

const ClubActivitiesList = ({ activities = [], startDate, endDate }: Props) => {
  // Get current month date range if not provided
  const now = new Date();
  const start = startDate || new Date(now.getFullYear(), now.getMonth(), 1);
  const end = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  // Format date range for display
  const dateRangeText = `${start.getDate()} - ${end.getDate()} ${start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;

  // Filter only Run activities and calculate total distance per athlete
  const leaderboardData = useMemo(() => {
    const grouped: Record<
      string,
      { name: string; totalDistance: number; totalTime: number; activityCount: number }
    > = {};

    activities.forEach((activity) => {
      // Only count Run and VirtualRun activities
      if (activity.type !== 'Run' && activity.type !== 'VirtualRun') return;

      const key = `${activity.athlete.firstname} ${activity.athlete.lastname}`;

      if (!grouped[key]) {
        grouped[key] = {
          name: key,
          totalDistance: 0,
          totalTime: 0,
          activityCount: 0,
        };
      }

      grouped[key].totalDistance += activity.distance;
      grouped[key].totalTime += activity.moving_time;
      grouped[key].activityCount += 1;
    });

    return Object.values(grouped).sort(
      (a, b) => b.totalDistance - a.totalDistance
    );
  }, [activities]);

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

  const formatPace = (distance: number, time: number) => {
    if (distance === 0) return '-';
    const paceSeconds = (time / distance) * 1000; // per km
    const mins = Math.floor(paceSeconds / 60);
    const secs = Math.floor(paceSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}/km`;
  };

  const columns: TableProps<any>['columns'] = [
    {
      title: '#',
      key: 'rank',
      align: 'center',
      width: 50,
      render: (_: any, __: any, index: number) => getRankBadge(index + 1),
    },
    {
      title: 'Athlete',
      key: 'name',
      render: (record: any) => (
        <div className="py-1">
          <div className="font-medium text-slate-800">{record.name}</div>
          <div className="text-xs text-slate-400">
            {record.activityCount} {record.activityCount === 1 ? 'run' : 'runs'}
          </div>
        </div>
      ),
    },
    {
      align: 'right',
      title: 'Distance',
      key: 'totalDistance',
      width: 90,
      render: (record: any) => (
        <div>
          <div className="font-bold text-blue-600">
            {(record.totalDistance / 1000).toFixed(2)} km
          </div>
          <div className="text-xs text-slate-400">
            {formatPace(record.totalDistance, record.totalTime)}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          🏆 Club Leaderboard
        </h2>
        <p className="text-slate-300 text-sm">
          {dateRangeText} • {leaderboardData.length} athletes
        </p>
      </div>
      <Table
        columns={columns}
        dataSource={leaderboardData}
        rowKey={(record) => record.name}
        pagination={false}
        locale={{ emptyText: 'No run activities yet.' }}
      />
    </div>
  );
};

export default ClubActivitiesList;
