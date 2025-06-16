import { memo, useCallback } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';

function HttpRequestNode({ id, data, isConnectable }: NodeProps) {
  const { setNodes } = useReactFlow();

  const updateData = useCallback((key: string, value: string) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, [key]: value } } : node
      )
    );
  }, [id, setNodes]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 text-white rounded-2xl p-4 w-80 text-sm font-sans transition-all duration-200 hover:shadow-[0_8px_24px_rgba(120,120,255,0.1)]">
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{ background: '#6c63ff' }}
      />

      <div>
        <label className="block mb-1 text-zinc-300">HTTP REQUETE:</label>
        
        {/* Conteneur unifié qui ressemble à un input */}
        <div className="nodrag flex items-center w-full px-3 py-1.5 bg-zinc-800 border border-zinc-600 rounded-md focus-within:ring-2 focus-within:ring-indigo-500">
          
          {/* Sélecteur de méthode (sans styles propres) */}
          <select
            value={typeof data.method === 'string' ? data.method : 'GET'}
            onChange={(e) => updateData('method', e.target.value)}
            className="bg-transparent appearance-none focus:outline-none text-white pr-2"
          >
            <option className="bg-zinc-800">GET</option>
            <option className="bg-zinc-800">POST</option>
            <option className="bg-zinc-800">PUT</option>
            <option className="bg-zinc-800">DELETE</option>
            <option className="bg-zinc-800">PATCH</option>
          </select>

          {/* Ligne de séparation verticale */}
          <div className="h-4 w-px bg-zinc-600"></div>

          {/* Champ de l'URL (sans styles propres) */}
          <input
            type="text"
            value={typeof data.url === 'string' ? data.url : ''}
            onChange={(e) => updateData('url', e.target.value)}
            placeholder="https://api.exemple.com"
            className="w-full bg-transparent focus:outline-none text-white pl-2"
          />
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{ background: '#6c63ff' }}
      />
    </div>
  );
}

export default memo(HttpRequestNode);