'use client';

import { Table, TableProps } from 'antd';
import { useMemo } from 'react';

type Activity = {
  athlete: {
    firstname: string;
    lastname: string;
  };
  distance: number;
  [key: string]: any;
};

type Props = {
  activities?: any;
};

const ClubActivitiesListTest = ({ activities = [] }: Props) => {
  // Transform the entries data to match our expected format
  const transformedActivities = useMemo(() => {
    return activities.map((entry: any) => ({
      athlete: {
        firstname: entry.activity.athlete.firstName,
        lastname:
          entry.activity.athlete.lastname ||
          entry.activity.athlete.athleteName.split(' ').slice(1).join(' ') ||
          '',
        athleteId: entry.activity.athlete.athleteId,
        athleteName: entry.activity.athlete.athleteName,
        avatarUrl: entry.activity.athlete.avatarUrl,
      },
      distance:
        parseFloat(
          entry.activity.stats
            .find((stat: any) => stat.key === 'stat_one')
            ?.value.match(/\d+\.?\d*/)?.[0] || '0'
        ) * 1000,
      ...entry.activity,
    }));
  }, [activities]);

  // Calculate total distance per athlete
  const leaderboardData = useMemo(() => {
    const grouped: Record<string, { athlete: any; totalDistance: number }> = {};

    transformedActivities.forEach((activity: any) => {
      const key = activity.athlete.athleteId;

      if (!grouped[key]) {
        grouped[key] = {
          athlete: activity.athlete,
          totalDistance: 0,
        };
      }

      grouped[key].totalDistance += activity.distance;
    });

    return Object.values(grouped).sort(
      (a, b) => b.totalDistance - a.totalDistance
    );
  }, [transformedActivities]);

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
        <div className="flex gap-3 items-center py-1">
          <img
            src={record?.athlete.avatarUrl || '/default-avatar.png'}
            alt=""
            className="w-10 h-10 rounded-full object-cover border-2 border-slate-200"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/default-avatar.png';
            }}
          />
          <div className="font-medium text-slate-800">
            {record?.athlete.athleteName || ''}
          </div>
        </div>
      ),
    },
    {
      align: 'right',
      title: 'Distance',
      key: 'totalDistance',
      width: 100,
      render: (record: any) => (
        <div className="font-bold text-blue-600">
          {(record.totalDistance / 1000).toFixed(2)} km
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          🏆 Leaderboard
        </h2>
        <p className="text-slate-300 text-sm">July 1 - 30, 2025</p>
      </div>
      <Table
        columns={columns}
        dataSource={leaderboardData}
        rowKey={(record) =>
          record.athlete.athleteId
            ? record.athlete.athleteId
            : record.athlete.id
        }
        pagination={false}
        className="leaderboard-table"
        locale={{ emptyText: 'No activities yet.' }}
      />
    </div>
  );
};

export default ClubActivitiesListTest;
