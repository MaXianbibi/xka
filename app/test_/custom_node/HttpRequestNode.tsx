import { memo, useCallback } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { MdHttp } from 'react-icons/md';
import WorkflowNodeWrapper from './WrapperNode';

function HttpRequestNode({ id, data, isConnectable }: NodeProps) {
  const { setNodes } = useReactFlow();

  // Conversion sécurisée des données
  const method = data?.method ? String(data.method) : 'GET';
  const url = data?.url ? String(data.url) : '';
  const executionStatus = data?.executionStatus ? String(data.executionStatus) : '';
  const executionDuration = data?.executionDuration ? String(data.executionDuration) : '';

  const updateData = useCallback((key: string, value: string) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, [key]: value } } : node
      )
    );
  }, [id, setNodes]);

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'text-blue-400 bg-blue-500/20';
      case 'POST': return 'text-green-400 bg-green-500/20';
      case 'PUT': return 'text-yellow-400 bg-yellow-500/20';
      case 'DELETE': return 'text-red-400 bg-red-500/20';
      case 'PATCH': return 'text-purple-400 bg-purple-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <WorkflowNodeWrapper data={data || {}}>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="!w-3 !h-3 !border-2 !border-white !bg-indigo-500 hover:!bg-indigo-400 transition-colors"
      />

      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-indigo-500/20 rounded-lg">
          <MdHttp className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">HTTP Request</h3>
          <p className="text-zinc-400 text-xs">API call</p>
        </div>
      </div>

      <div className="space-y-2">
        {/* Conteneur unifié qui ressemble à un input */}
        <div className="nodrag flex items-center w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
          
          {/* Sélecteur de méthode */}
          <select
            value={method}
            onChange={(e) => updateData('method', e.target.value)}
            className={`bg-transparent appearance-none focus:outline-none pr-2 rounded px-1 py-0.5 text-xs font-medium ${getMethodColor(method)}`}
          >
            <option className="bg-zinc-800 text-white">GET</option>
            <option className="bg-zinc-800 text-white">POST</option>
            <option className="bg-zinc-800 text-white">PUT</option>
            <option className="bg-zinc-800 text-white">DELETE</option>
            <option className="bg-zinc-800 text-white">PATCH</option>
          </select>

          {/* Ligne de séparation verticale */}
          <div className="h-4 w-px bg-zinc-600 mx-2"></div>

          {/* Champ de l'URL */}
          <input
            type="text"
            value={url}
            onChange={(e) => updateData('url', e.target.value)}
            placeholder="https://api.exemple.com"
            className="w-full bg-transparent focus:outline-none text-white text-sm placeholder-zinc-500"
          />
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

export default memo(HttpRequestNode);
