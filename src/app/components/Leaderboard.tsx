'use client';

import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { CheckCircle, XCircle } from 'lucide-react';

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
      
      {entries.length === 0 ? (
        <div className="p-8 text-center text-slate-500">
          No participants yet. Be the first to join!
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="w-[60px] text-center">#</TableHead>
              <TableHead>Athlete</TableHead>
              <TableHead className="text-right w-[100px]">Distance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => {
              const isCurrentUser = entry.athleteId === currentAthleteId;
              return (
                <TableRow 
                  key={entry.participantId}
                  className={isCurrentUser ? 'bg-orange-50' : ''}
                >
                  <TableCell className="text-center">
                    {getRankBadge(entry.rank)}
                  </TableCell>
                  <TableCell>
                    <div className={isCurrentUser ? 'text-orange-600' : ''}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{entry.athleteName}</span>
                        {isCurrentUser && (
                          <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-600">
                            You
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {entry.validActivities}
                        </span>
                        {entry.invalidActivities > 0 && (
                          <span className="flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-red-400" />
                            {entry.invalidActivities}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-bold text-blue-600">
                      {(entry.totalDistance / 1000).toFixed(2)} km
                    </div>
                    <div className="text-xs text-slate-400">
                      {formatPace(entry.pace)}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Leaderboard;
