import { memo, useCallback } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { MdAccessTime } from 'react-icons/md';
import WorkflowNodeWrapper from './WrapperNode';

function WaitingNode({ id, data, isConnectable }: NodeProps) {
  const { setNodes } = useReactFlow();

  const updateData = useCallback((key: string, value: string) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, [key]: value } } : node
      )
    );
  }, [id, setNodes]);

  // Conversion sécurisée des données
  const duration = data.duration ? String(data.duration) : '';
  const executionStatus = data.executionStatus ? String(data.executionStatus) : '';
  const executionDuration = data.executionDuration ? String(data.executionDuration) : '';

  return (
    <WorkflowNodeWrapper data={data}>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="!w-3 !h-3 !border-2 !border-white !bg-indigo-500 hover:!bg-indigo-400 transition-colors"
      />

      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-indigo-500/20 rounded-lg">
          <MdAccessTime className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">Wait Node</h3>
          <p className="text-zinc-400 text-xs">Pause execution</p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-zinc-300 text-xs font-medium uppercase tracking-wide">
          Duration
        </label>
        <div className="relative">
          <input
            type="number"
            value={duration}
            onChange={(e) => updateData('duration', e.target.value)}
            placeholder="1000"
            min="0"
            className="nodrag w-full bg-zinc-800/50 border border-zinc-600/50 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium">
            ms
          </div>
        </div>
      </div>

      {executionStatus && (
        <div className="absolute -top-2 -right-2 flex items-center gap-1 bg-zinc-800 border border-zinc-600 rounded-full px-2 py-1 text-xs font-medium shadow-lg">
          <div className={`w-2 h-2 rounded-full ${
            executionStatus === 'running' ? 'bg-yellow-400 animate-pulse' :
            executionStatus === 'success' ? 'bg-green-400' :
            executionStatus === 'error' ? 'bg-red-400' :
            'bg-gray-400'
          }`}></div>
          <span className="text-zinc-300 capitalize">{executionStatus}</span>
        </div>
      )}

      {executionDuration && (
        <div className="absolute -bottom-2 -left-2 bg-zinc-800 border border-zinc-600 rounded-full px-2 py-1 text-xs text-zinc-300 font-medium shadow-lg">
          {executionDuration}ms
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="!w-3 !h-3 !border-2 !border-white !bg-indigo-500 hover:!bg-indigo-400 transition-colors"
      />
    </WorkflowNodeWrapper>
  );
}

export default memo(WaitingNode);
