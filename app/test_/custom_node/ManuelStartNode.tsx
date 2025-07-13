import { memo } from 'react';
import { MdPlayArrow } from 'react-icons/md';
import { Handle, Position, NodeProps } from '@xyflow/react';
import WorkflowNodeWrapper from './WrapperNode';

function ManualStartNode({  data, isConnectable }: NodeProps) {
  // Conversion sécurisée des données

  const executionStatus = data?.executionStatus ? String(data.executionStatus) : '';
  const executionDuration = data?.executionDuration ? String(data.executionDuration) : '';

  return (
    <WorkflowNodeWrapper data={data || {}}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-500/20 rounded-lg hover:bg-indigo-500/30 transition-colors">
          <MdPlayArrow className="w-5 h-5 text-indigo-400 hover:text-indigo-300 transition-colors" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">Manual Start</h3>
          <p className="text-zinc-400 text-xs">Workflow trigger</p>
        </div>
      </div>

      {/* Badge de statut qui dépasse */}
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

      {/* Durée d'exécution qui dépasse */}
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

export default memo(ManualStartNode);
