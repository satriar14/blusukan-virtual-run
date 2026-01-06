'use client';

import { Progress } from '@/components/ui/progress';

type Props = {
  totalDistance: number;
  totalTime: number;
  validActivities: number;
  invalidActivities: number;
  targetDistance: number;
  endDate?: string;
};

const ResultActivities = ({
  totalDistance,
  totalTime,
  validActivities,
  invalidActivities,
  targetDistance,
  endDate,
}: Props) => {
  const distanceKm = totalDistance / 1000;
  const progressPercent = Math.min((distanceKm / targetDistance) * 100, 100);
  
  const now = new Date();
  const end = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysRemaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPace = (distance: number, time: number) => {
    if (distance === 0) return '-';
    const paceSeconds = (time / distance) * 1000;
    const mins = Math.floor(paceSeconds / 60);
    const secs = Math.floor(paceSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}/km`;
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-5 shadow-lg text-white">
        <h3 className="text-sm font-medium text-blue-200 mb-4">Your Stats</h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center">
            <div className="text-xl font-bold">{distanceKm.toFixed(1)}</div>
            <div className="text-xs text-blue-200">km</div>
          </div>
          <div className="text-center border-x border-blue-500/50">
            <div className="text-xl font-bold">{formatTime(totalTime)}</div>
            <div className="text-xs text-blue-200">Time</div>
          </div>
          <div className="text-center border-r border-blue-500/50">
            <div className="text-xl font-bold">{formatPace(totalDistance, totalTime)}</div>
            <div className="text-xs text-blue-200">Pace</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">
              <span className="text-green-400">{validActivities}</span>
              {invalidActivities > 0 && (
                <span className="text-red-400 text-sm">/{invalidActivities}</span>
              )}
            </div>
            <div className="text-xs text-blue-200">Runs</div>
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-white rounded-2xl p-5 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-slate-800">Your Progress</h4>
          <span className="text-sm text-orange-600 font-medium">
            {daysRemaining > 0 ? `${daysRemaining} days left` : 'Challenge ended'}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
          <span>{distanceKm.toFixed(2)} km</span>
          <span>{targetDistance} km</span>
        </div>
        <Progress value={progressPercent} className="h-3" />
        <div className="text-center mt-2">
          <span className="text-lg font-bold text-orange-600">
            {progressPercent.toFixed(1)}%
          </span>
          <span className="text-slate-500 text-sm ml-1">completed</span>
        </div>
      </div>
    </div>
  );
};

export default ResultActivities;
