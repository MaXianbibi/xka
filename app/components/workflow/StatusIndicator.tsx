import { memo, useMemo } from 'react';

// Styles constants
const BASE_STYLE = "w-3 h-3 rounded-full";
const STATUS_CLASSES = {
  running: 'bg-yellow-400 animate-pulse',
  success: 'bg-green-400',
  error: 'bg-red-400',
  default: 'bg-zinc-500'
} as const;

// Types pour les statuts possibles
type StatusType = keyof typeof STATUS_CLASSES;

interface StatusIndicatorProps {
  status: StatusType;
}

export const StatusIndicator = memo<StatusIndicatorProps>(({ status }) => {
  // Utilisation de useMemo pour éviter les recalculs inutiles
  const colorClass = useMemo(() => {
    return STATUS_CLASSES[status] || STATUS_CLASSES.default;
  }, [status]);

  return <div className={`${BASE_STYLE} ${colorClass}`} />;
});

StatusIndicator.displayName = 'StatusIndicator';
