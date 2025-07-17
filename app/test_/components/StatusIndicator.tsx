import { memo } from 'react';

interface StatusIndicatorProps {
  status: string;
}

export const StatusIndicator = memo<StatusIndicatorProps>(({ status }) => {
  const colorClass = status === 'running' ? 'bg-yellow-400 animate-pulse' :
                    status === 'success' ? 'bg-green-400' :
                    status === 'error' ? 'bg-red-400' : 'bg-zinc-500';
  
  return <div className={`w-3 h-3 rounded-full ${colorClass}`} />;
});

StatusIndicator.displayName = 'StatusIndicator';