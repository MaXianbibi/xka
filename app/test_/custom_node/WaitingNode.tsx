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

  return (
    <WorkflowNodeWrapper data={data}>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{ background: '#6c63ff' }}
      />

      <div className="flex items-center gap-3 mb-3">
        <MdAccessTime className="w-5 h-5 text-indigo-400" />
        <label className="text-zinc-300 font-medium">ATTENDRE:</label>
      </div>

      <div className="nodrag flex items-center w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md focus-within:ring-2 focus-within:ring-indigo-500">
        <input
          type="number"
          value={typeof data.duration === 'string' ? data.duration : ''}
          onChange={(e) => updateData('duration', e.target.value)}
          placeholder="1000"
          min="0"
          className="w-full bg-transparent focus:outline-none text-white"
        />
        <span className="text-zinc-400 ml-2 text-xs">ms</span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{ background: '#6c63ff' }}
      />
    </WorkflowNodeWrapper>
  );
}

export default memo(WaitingNode);
