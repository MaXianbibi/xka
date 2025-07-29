import { memo, useCallback, useMemo } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { MdAccessTime } from 'react-icons/md';
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
const INPUT_CONTAINER_CLASSES = "nodrag w-full bg-zinc-800/50 border border-zinc-600/50 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all";
const STATUS_BADGE_CLASSES = "absolute -top-2 -right-2 flex items-center gap-1 bg-zinc-800 border border-zinc-600 rounded-full px-2 py-1 text-xs font-medium shadow-lg";
const UNIT_LABEL_CLASSES = "absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium";

// Composant pour l'input de durée
const DurationInput = memo(({ 
  duration, 
  onDurationChange 
}: { 
  duration: string; 
  onDurationChange: (duration: string) => void; 
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onDurationChange(e.target.value);
  }, [onDurationChange]);

  return (
    <div className="space-y-2">
      <label className="text-zinc-300 text-xs font-medium uppercase tracking-wide">
        Duration
      </label>
      <div className="relative">
        <input
          type="number"
          value={duration}
          onChange={handleChange}
          placeholder="1000"
          min="0"
          className={INPUT_CONTAINER_CLASSES}
        />
        <div className={UNIT_LABEL_CLASSES}>
          ms
        </div>
      </div>
    </div>
  );
});

// Composant pour le badge de statut
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
  <div className="flex items-center gap-2 mb-4">
    <div className="p-2 bg-indigo-500/20 rounded-lg">
      <MdAccessTime className="w-5 h-5 text-indigo-400" />
    </div>
    <div>
      <h3 className="text-white font-semibold text-sm">Wait Node</h3>
      <p className="text-zinc-400 text-xs">Pause execution</p>
    </div>
  </div>
));

// Composant principal optimisé
function WaitingNode({ id, data, isConnectable }: NodeProps) {
  const { setNodes } = useReactFlow();

  // Extraction et validation des données avec valeurs par défaut
  const nodeData = useMemo(() => ({
    duration: data?.duration ? String(data.duration) : '',
    executionStatus: data?.executionStatus ? String(data.executionStatus) : '',
    executionDuration: data?.executionDuration ? String(data.executionDuration) : ''
  }), [data]);

  // Fonction de mise à jour optimisée avec useCallback
  const updateData = useCallback((key: string, value: string) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id 
          ? { ...node, data: { ...node.data, [key]: value } } 
          : node
      )
    );
  }, [id, setNodes]);

  // Handler mémoïsé pour éviter les re-rendus inutiles
  const handleDurationChange = useCallback((duration: string) => {
    updateData('duration', duration);
  }, [updateData]);

  return (
    <WorkflowNodeWrapper data={data || {}}>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className={HANDLE_CLASSES}
      />

      <NodeHeader />

      <DurationInput 
        duration={nodeData.duration} 
        onDurationChange={handleDurationChange} 
      />

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

export default memo(WaitingNode);