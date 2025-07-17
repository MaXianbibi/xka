import { memo } from 'react';
import { WorkflowExecutionResult } from '@/app/lib/types/types';
import { formatTime } from '@/app/lib/utils/workflow-utils';

// Constantes de style
const GRID_STYLE = "grid grid-cols-2 gap-3 text-xs";
const CARD_STYLE = "bg-zinc-800 rounded p-2";
const LABEL_STYLE = "text-zinc-500";
const VALUE_STYLE = "text-zinc-300 font-mono";
const STATUS_STYLE = {
  success: 'text-green-400',
  error: 'text-red-400',
  running: 'text-yellow-400',
  default: 'text-zinc-400'
};

// Composant optimisé
export const WorkflowMetrics = memo<{ workflowStatus: WorkflowExecutionResult }>(({ workflowStatus }) => {
  // Calcul des valeurs une seule fois
  const totalNodes = workflowStatus.numberOfNodes || workflowStatus.nodes?.length || 0;
  const startedAt = workflowStatus.startedAt ? formatTime(workflowStatus.startedAt) : 'N/A';
  const endedAt = workflowStatus.endedAt ? formatTime(workflowStatus.endedAt) : 'N/A';
  const status = workflowStatus.status?.toUpperCase() || 'PENDING';
  const statusColor = STATUS_STYLE[workflowStatus.status as keyof typeof STATUS_STYLE] || STATUS_STYLE.default;

  return (
    <div className={GRID_STYLE}>
      <MetricCard label="Total Nodes" value={totalNodes} />
      <MetricCard label="Started At" value={startedAt} />
      <MetricCard label="Ended At" value={endedAt} />
      <MetricCard label="Status" value={status} valueClassName={statusColor} />
    </div>
  );
});

// Composant enfant extrait pour éviter la duplication
const MetricCard = memo<{
  label: string;
  value: string | number;
  valueClassName?: string;
}>(({ label, value, valueClassName = VALUE_STYLE }) => (
  <div className={CARD_STYLE}>
    <div className={LABEL_STYLE}>{label}</div>
    <div className={valueClassName}>{value}</div>
  </div>
));

WorkflowMetrics.displayName = 'WorkflowMetrics';
MetricCard.displayName = 'MetricCard';
