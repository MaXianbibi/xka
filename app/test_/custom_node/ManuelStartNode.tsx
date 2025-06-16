import { memo } from 'react';
import { MdPlayArrow } from 'react-icons/md';
import { Handle, Position, NodeProps } from '@xyflow/react';

function ManualStartNode({ isConnectable }: NodeProps) {
  return (
    <div
      className="bg-zinc-900 border border-zinc-800 text-white rounded-2xl p-4 w-40 flex items-center space-x-3 cursor-pointer select-none
        hover:shadow-[0_8px_24px_rgba(120,120,255,0.2)] transition-shadow duration-200"
    >
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{ right: -14, background: '#6c63ff' }}
      />

      <MdPlayArrow size={28} className="text-indigo-400" />

      <span className="font-semibold text-sm">Start Manuel</span>
    </div>
  );
}

export default memo(ManualStartNode);
