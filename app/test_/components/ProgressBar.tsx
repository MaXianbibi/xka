import { memo } from 'react';

interface ProgressBarProps {
  progress: number;
}

export const ProgressBar = memo<ProgressBarProps>(({ progress }) => {
  if (progress <= 0) return null;
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-zinc-300 font-medium">Progress</span>
        <span className="text-sm text-zinc-300 font-mono">{progress}%</span>
      </div>
      <div className="w-full bg-zinc-700 rounded-full h-2 overflow-hidden">
        <div
          className="bg-blue-400 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
});

ProgressBar.displayName = 'ProgressBar';