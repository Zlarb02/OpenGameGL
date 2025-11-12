import React from 'react';

interface LoadingScreenProps {
  progress: number;
  message?: string;
}

export function LoadingScreen({ progress, message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="text-center">
        <div className="mb-4">
          <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <p className="text-white text-sm">{message}</p>
        <p className="text-gray-400 text-xs mt-2">{Math.round(progress)}%</p>
      </div>
    </div>
  );
}
