import { memo, useMemo } from 'react';

// Styles constants
const CONTAINER_STYLE = "mb-4";
const HEADER_STYLE = "flex justify-between items-center mb-2";
const LABEL_STYLE = "text-sm text-zinc-300 font-medium";
const VALUE_STYLE = "text-sm text-zinc-300 font-mono";
const BAR_CONTAINER_STYLE = "w-full bg-zinc-700 rounded-full h-2 overflow-hidden";
const BAR_STYLE = "bg-blue-400 h-full rounded-full transition-all duration-500 ease-out";

// Seuil minimal pour afficher la barre (évite les micro-rendus inutiles)
const MIN_PROGRESS = 0.1;

export const ProgressBar = memo<{ progress: number }>(({ progress }) => {
  // Early return si pas de progression ou valeur trop faible
  if (progress <= MIN_PROGRESS) return null;

  // Memoization du style de la barre pour éviter les recalculs
  const barWidthStyle = useMemo(() => ({
    width: `${Math.min(progress, 100)}%`
  }), [progress]);

  return (
    <div className={CONTAINER_STYLE}>
      <div className={HEADER_STYLE}>
        <span className={LABEL_STYLE}>Progress</span>
        <span className={VALUE_STYLE}>
          {Math.round(progress)}%
        </span>
      </div>
      <div className={BAR_CONTAINER_STYLE}>
        <div
          className={BAR_STYLE}
          style={barWidthStyle}
        />
      </div>
    </div>
  );
});

ProgressBar.displayName = 'ProgressBar';
