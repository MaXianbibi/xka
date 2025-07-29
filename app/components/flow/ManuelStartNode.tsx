import { memo, useMemo } from 'react';
import { MdPlayArrow } from 'react-icons/md';
import { Handle, Position, NodeProps } from '@xyflow/react';
import WorkflowNodeWrapper from './WrapperNode';

// Constantes pour éviter les recalculs
const STATUS_INDICATORS = {
  running: 'bg-yellow-400 animate-pulse',
  success: 'bg-green-400',
  error: 'bg-red-400',
  default: 'bg-gray-400'
} as const;

// Constantes pour les classes CSS réutilisables
const HANDLE_CLASSES = "!w-3 !h-3 !border-2 !border-white !bg-indigo-500 hover:!bg-indigo-400 transition-colors";
const STATUS_BADGE_CLASSES = "absolute -top-2 -right-2 flex items-center gap-1 bg-zinc-800 border border-zinc-600 rounded-full px-2 py-1 text-xs font-medium shadow-lg";
const ICON_CONTAINER_CLASSES = "p-2 bg-indigo-500/20 rounded-lg hover:bg-indigo-500/30 transition-colors";
const ICON_CLASSES = "w-5 h-5 text-indigo-400 hover:text-indigo-300 transition-colors";

// Composant pour le badge de statut réutilisable
const StatusBadge = memo(({ 
  status, 
  duration 
}: { 
  status: string; 
  duration?: string; 
}) => {
  const indicatorClass = useMemo(() => 
    STATUS_INDICATORS[status as keyof typeof STATUS_INDICATORS] || STATUS_INDICATORS.default,
    [status]
  );

  return (
    <div className={STATUS_BADGE_CLASSES}>
      <div className={`w-2 h-2 rounded-full ${indicatorClass}`} />
      <span className="text-zinc-300 capitalize">{status}</span>
      {duration && (
        <span className="text-zinc-400 text-xs ml-1">({duration})</span>
      )}
    </div>
  );
});

// Composant pour l'en-tête du node
const NodeHeader = memo(() => (
  <div className="flex items-center gap-3">
    <div className={ICON_CONTAINER_CLASSES}>
      <MdPlayArrow className={ICON_CLASSES} />
    </div>
    <div>
      <h3 className="text-white font-semibold text-sm">Manual Start</h3>
      <p className="text-zinc-400 text-xs">Workflow trigger</p>
    </div>
  </div>
));

// Composant principal optimisé
function ManualStartNode({ data, isConnectable }: NodeProps) {
  // Extraction et validation des données avec valeurs par défaut
  const nodeData = useMemo(() => ({
    executionStatus: data?.executionStatus ? String(data.executionStatus) : '',
    executionDuration: data?.executionDuration ? String(data.executionDuration) : ''
  }), [data]);

  return (
    <WorkflowNodeWrapper data={data || {}}>
      <NodeHeader />

      {nodeData.executionStatus && (
        <StatusBadge 
          status={nodeData.executionStatus} 
          duration={nodeData.executionDuration} 
        />
      )}

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className={HANDLE_CLASSES}
      />
    </WorkflowNodeWrapper>
  );
}

export default memo(ManualStartNode);