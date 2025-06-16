import React, { useEffect, useState } from 'react';
import { Activity, Clock, Target, TrendingUp } from 'lucide-react';

interface ProgressTrackerProps {
  getProgress: () => {
    status: string;
    score: number;
    maxScore: number;
    percentage: number;
    location: string;
    sessionTime: string;
    totalTime: string;
  };
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ getProgress }) => {
  const [progress, setProgress] = useState(() => getProgress());

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(getProgress());
    }, 1000);

    return () => clearInterval(interval);
  }, [getProgress]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'passed':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'incomplete':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatStatus = (status: string) => {
    return status.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <Activity className="h-5 w-5 mr-2 text-blue-600" />
        Progress Tracking
      </h2>
      
      <div className="space-y-6">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Status</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(progress.status)}`}>
            {formatStatus(progress.status)}
          </span>
        </div>

        {/* Score Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 flex items-center">
              <Target className="h-4 w-4 mr-1" />
              Score
            </span>
            <span className="text-sm font-bold text-gray-800">
              {progress.score} / {progress.maxScore}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          
          <div className="text-right">
            <span className="text-lg font-bold text-gray-800">{progress.percentage}%</span>
          </div>
        </div>

        {/* Progress Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div className="space-y-1">
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              Session Time
            </div>
            <div className="text-lg font-semibold text-gray-800">
              {progress.sessionTime}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center text-sm text-gray-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              Total Time
            </div>
            <div className="text-lg font-semibold text-gray-800">
              {progress.totalTime}
            </div>
          </div>
        </div>

        {/* Location */}
        {progress.location && (
          <div className="pt-2 border-t border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Current Location</div>
            <div className="text-sm font-medium text-gray-800 bg-gray-50 px-3 py-2 rounded">
              {progress.location}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};