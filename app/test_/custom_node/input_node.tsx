import { useCallback } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';

export default function TextUpdaterNode({ id, data, isConnectable }: NodeProps) {
  const { setNodes } = useReactFlow();

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, value } } : node
      )
    );
  }, [id, setNodes]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 text-white rounded-2xl p-4 w-56 text-sm font-sans transition-all duration-200 hover:shadow-[0_8px_24px_rgba(120,120,255,0.1)]">
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{ background: '#6c63ff' }}
      />

      <div className="mb-3">
        <label htmlFor="text" className="block mb-1 text-zinc-300">
          Text:
        </label>
        <input
          id="text"
          name="text"
          value={typeof data?.value === 'string' ? data.value : ''}
          onChange={onChange}
          className="nodrag w-full px-3 py-1.5 bg-zinc-800 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="a"
        isConnectable={isConnectable}
        style={{ top: 35, background: '#6c63ff' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="b"
        isConnectable={isConnectable}
        style={{ top: 70, background: '#6c63ff' }}
      />
    </div>
  );
}
