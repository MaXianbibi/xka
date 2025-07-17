import { memo, useCallback, useMemo } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { MdHttp } from 'react-icons/md';
import WorkflowNodeWrapper from './WrapperNode';

// Constantes pour éviter les recalculs
const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;

const METHOD_COLORS = {
  GET: 'text-blue-400 bg-blue-500/20',
  POST: 'text-green-400 bg-green-500/20',
  PUT: 'text-yellow-400 bg-yellow-500/20',
  DELETE: 'text-red-400 bg-red-500/20',
  PATCH: 'text-purple-400 bg-purple-500/20',
  default: 'text-gray-400 bg-gray-500/20'
} as const;

const STATUS_INDICATORS = {
  running: 'bg-yellow-400 animate-pulse',
  success: 'bg-green-400',
  error: 'bg-red-400',
  default: 'bg-gray-400'
} as const;

// Constantes pour les classes CSS réutilisables
const HANDLE_CLASSES = "!w-3 !h-3 !border-2 !border-white !bg-indigo-500 hover:!bg-indigo-400 transition-colors";
const INPUT_CONTAINER_CLASSES = "nodrag flex items-center w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 transition-all";
const STATUS_BADGE_CLASSES = "absolute -top-2 -right-2 flex items-center gap-1 bg-zinc-800 border border-zinc-600 rounded-full px-2 py-1 text-xs font-medium shadow-lg";

// Composant pour les options de méthode HTTP
const MethodOptions = memo(() => (
  <>
    {HTTP_METHODS.map(method => (
      <option key={method} className="bg-zinc-800 text-white">
        {method}
      </option>
    ))}
  </>
));

// Composant pour le sélecteur de méthode HTTP
const MethodSelector = memo(({ 
  method, 
  onMethodChange 
}: { 
  method: string; 
  onMethodChange: (method: string) => void; 
}) => {
  const methodColor = useMemo(() => 
    METHOD_COLORS[method as keyof typeof METHOD_COLORS] || METHOD_COLORS.default,
    [method]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onMethodChange(e.target.value);
  }, [onMethodChange]);

  return (
    <select
      value={method}
      onChange={handleChange}
      className={`bg-transparent appearance-none focus:outline-none pr-2 rounded px-1 py-0.5 text-xs font-medium ${methodColor}`}
    >
      <MethodOptions />
    </select>
  );
});

// Composant pour le champ URL
const UrlInput = memo(({ 
  url, 
  onUrlChange 
}: { 
  url: string; 
  onUrlChange: (url: string) => void; 
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUrlChange(e.target.value);
  }, [onUrlChange]);

  return (
    <input
      type="text"
      value={url}
      onChange={handleChange}
      placeholder="https://api.exemple.com"
      className="w-full bg-transparent focus:outline-none text-white text-sm placeholder-zinc-500"
    />
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
  <div className="flex items-center gap-3 mb-3">
    <div className="p-2 bg-indigo-500/20 rounded-lg">
      <MdHttp className="w-5 h-5 text-indigo-400" />
    </div>
    <div>
      <h3 className="text-white font-semibold text-sm">HTTP Request</h3>
      <p className="text-zinc-400 text-xs">API call</p>
    </div>
  </div>
));

// Composant principal optimisé
function HttpRequestNode({ id, data, isConnectable }: NodeProps) {
  const { setNodes } = useReactFlow();

  // Extraction et validation des données avec valeurs par défaut
  const nodeData = useMemo(() => ({
    method: data?.method ? String(data.method) : 'GET',
    url: data?.url ? String(data.url) : '',
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

  // Handlers mémoïsés pour éviter les re-rendus inutiles
  const handleMethodChange = useCallback((method: string) => {
    updateData('method', method);
  }, [updateData]);

  const handleUrlChange = useCallback((url: string) => {
    updateData('url', url);
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

      <div className="space-y-2">
        <div className={INPUT_CONTAINER_CLASSES}>
          <MethodSelector 
            method={nodeData.method} 
            onMethodChange={handleMethodChange} 
          />
          
          <div className="h-4 w-px bg-zinc-600 mx-2" />
          
          <UrlInput 
            url={nodeData.url} 
            onUrlChange={handleUrlChange} 
          />
        </div>
      </div>

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

export default memo(HttpRequestNode);