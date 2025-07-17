import React, { ReactNode, useState, memo, useMemo, useCallback } from 'react';
import { MdExpandMore, MdExpandLess, MdKeyboardArrowRight, MdKeyboardArrowDown } from 'react-icons/md';
import { WorkflowNodeWrapperProps, ExecutionData } from "@/app/lib/types/types";

// Constantes optimisées
const STATUS_CONFIG = {
  running: {
    border: 'border-yellow-400',
    shadow: 'shadow-yellow-400/20',
    icon: <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />,
    color: 'text-yellow-400'
  },
  success: {
    border: 'border-green-400',
    shadow: 'shadow-green-400/20',
    icon: <div className="w-3 h-3 bg-green-400 rounded-full" />,
    color: 'text-green-400'
  },
  error: {
    border: 'border-red-400',
    shadow: 'shadow-red-400/20',
    icon: <div className="w-3 h-3 bg-red-400 rounded-full" />,
    color: 'text-red-400'
  },
  default: {
    border: 'border-zinc-600/50',
    shadow: 'shadow-lg',
    icon: <div className="w-3 h-3 bg-zinc-500 rounded-full" />,
    color: 'text-zinc-500'
  }
} as const;

const PRIMITIVE_STYLES = {
  string: { className: 'text-green-300', format: (value: string) => `"${value.length > 100 ? `${value.substring(0, 100)}...` : value}"` },
  number: { className: 'text-blue-300', format: (value: number) => value.toString() },
  boolean: { className: 'text-purple-300', format: (value: boolean) => value.toString() },
  null: { className: 'text-zinc-400', format: () => 'null' },
  undefined: { className: 'text-zinc-400', format: () => 'undefined' }
} as const;

const SCROLLBAR_STYLES = `
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(113, 113, 122, 0.5) rgba(39, 39, 42, 0.3);
  }
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(39, 39, 42, 0.3);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(113, 113, 122, 0.5);
    border-radius: 3px;
    transition: background 0.2s ease;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(113, 113, 122, 0.8);
  }
`;

// Composants optimisés
const JsonValue = memo(({ value, level = 0 }: { value: any; level?: number }) => {
  const [collapsed, setCollapsed] = useState(level > 1);

  const toggleCollapsed = useCallback(() => setCollapsed(!collapsed), [collapsed]);

  if (value === null) return <span className={PRIMITIVE_STYLES.null.className}>{PRIMITIVE_STYLES.null.format()}</span>;
  if (value === undefined) return <span className={PRIMITIVE_STYLES.undefined.className}>{PRIMITIVE_STYLES.undefined.format()}</span>;

  const type = typeof value;

  if (type === 'string') return <span className={PRIMITIVE_STYLES.string.className}>{PRIMITIVE_STYLES.string.format(value)}</span>;
  if (type === 'number') return <span className={PRIMITIVE_STYLES.number.className}>{PRIMITIVE_STYLES.number.format(value)}</span>;
  if (type === 'boolean') return <span className={PRIMITIVE_STYLES.boolean.className}>{PRIMITIVE_STYLES.boolean.format(value)}</span>;

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-zinc-400">[]</span>;

    return (
      <div className="ml-2">
        <button
          onClick={toggleCollapsed}
          className="text-zinc-400 hover:text-white transition-colors text-sm flex items-center gap-1"
        >
          {collapsed ? <MdKeyboardArrowRight size={14} /> : <MdKeyboardArrowDown size={14} />}
          Array[{value.length}]
        </button>
        {!collapsed && (
          <div className="ml-4 border-l border-zinc-700 pl-2 mt-1">
            {value.slice(0, 10).map((item, index) => (
              <div key={index} className="py-1">
                <span className="text-zinc-500 text-xs">[{index}]: </span>
                <JsonValue value={item} level={level + 1} />
              </div>
            ))}
            {value.length > 10 && (
              <div className="text-zinc-500 text-xs py-1">
                ... and {value.length - 10} more items
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (type === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) return <span className="text-zinc-400">{'{}'}</span>;

    return (
      <div className="ml-2">
        <button
          onClick={toggleCollapsed}
          className="text-zinc-400 hover:text-white transition-colors text-sm flex items-center gap-1"
        >
          {collapsed ? <MdKeyboardArrowRight size={14} /> : <MdKeyboardArrowDown size={14} />}
          Object{'{'}...{'}'}
        </button>
        {!collapsed && (
          <div className="ml-4 border-l border-zinc-700 pl-2 mt-1">
            {keys.slice(0, 20).map(key => (
              <div key={key} className="py-1">
                <span className="text-orange-300 text-sm">"{key}"</span>
                <span className="text-zinc-500">: </span>
                <JsonValue value={value[key]} level={level + 1} />
              </div>
            ))}
            {keys.length > 20 && (
              <div className="text-zinc-500 text-xs py-1">
                ... and {keys.length - 20} more properties
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return <span className="text-zinc-300">{String(value)}</span>;
});

const TabNavigation = memo(({
  executionData,
  activeTab,
  setActiveTab
}: {
  executionData: ExecutionData;
  activeTab: 'result' | 'logs' | 'meta';
  setActiveTab: (tab: 'result' | 'logs' | 'meta') => void;
}) => {
  const tabs = useMemo(() => {
    const availableTabs = [];

    if (executionData.result) {
      availableTabs.push({ id: 'result', label: 'Result' });
    }
    if (executionData.logs?.length) {
      availableTabs.push({ id: 'logs', label: `Logs (${executionData.logs.length})` });
    }
    if (executionData.meta && Object.keys(executionData.meta).length > 0) {
      availableTabs.push({ id: 'meta', label: 'Meta' });
    }

    return availableTabs;
  }, [executionData]);

  return (
    <div className="flex border-b border-zinc-700">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as 'result' | 'logs' | 'meta')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? 'text-white border-b-2 border-blue-400 bg-zinc-800/50'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
});

const TabContent = memo(({
  activeTab,
  executionData
}: {
  activeTab: 'result' | 'logs' | 'meta';
  executionData: ExecutionData;
}) => {
  const renderContent = useMemo(() => {
    switch (activeTab) {
      case 'result':
        return executionData.result ? (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-zinc-300 mb-2">Execution Result</h4>
            <div className="bg-zinc-800 rounded-lg p-3 font-mono text-xs overflow-x-auto">
              <JsonValue value={executionData.result} />
            </div>
          </div>
        ) : null;

      case 'logs':
        return executionData.logs?.length ? (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-zinc-300 mb-2">Execution Logs</h4>
            <div className="space-y-2">
              {executionData.logs.map((log, index) => (
                <div key={index} className="bg-zinc-800 rounded px-3 py-2 font-mono text-xs text-zinc-300 border-l-2 border-zinc-600">
                  <span className="text-zinc-500 mr-2">[{index + 1}]</span>
                  {log}
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'meta':
        return executionData.meta && Object.keys(executionData.meta).length ? (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-zinc-300 mb-2">Metadata</h4>
            <div className="bg-zinc-800 rounded-lg p-3 font-mono text-xs overflow-x-auto">
              <JsonValue value={executionData.meta} />
            </div>
          </div>
        ) : null;

      default:
        return null;
    }
  }, [activeTab, executionData]);

  return (
    <div className="p-4 max-h-96 overflow-y-auto custom-scrollbar">
      {renderContent}
    </div>
  );
});

const ExecutionStatus = memo(({
  status,
  durationMs,
  onToggle,
  isExpanded
}: {
  status: string;
  durationMs?: number;
  onToggle: () => void;
  isExpanded: boolean;
}) => {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.default;
  const duration = durationMs ? (durationMs < 1000 ? `${durationMs}ms` : `${(durationMs / 1000).toFixed(2)}s`) : null;

  return (
    <div className="mt-3 pt-3 border-t border-zinc-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          {config.icon}
          <span className={`capitalize ${config.color}`}>{status}</span>
          {duration && (
            <span className="text-zinc-500">
              • {duration}
            </span>
          )}
        </div>
        <button
          onClick={onToggle}
          className="text-zinc-400 hover:text-white transition-colors p-1 rounded hover:bg-zinc-700"
          title="Toggle details"
        >
          {isExpanded ? <MdExpandLess size={16} /> : <MdExpandMore size={16} />}
        </button>
      </div>
    </div>
  );
});

const ExecutionFooter = memo(({
  nodeId,
  nodeType,
  timestamp
}: {
  nodeId?: string;
  nodeType?: string;
  timestamp?: number;
}) => {
  const formattedTimestamp = useMemo(() => {
    return timestamp ? new Date(timestamp * 1000).toLocaleString() : null;
  }, [timestamp]);

  return (
    <div className="border-t border-zinc-700 px-4 py-3 text-xs text-zinc-400 bg-zinc-900/30">
      <div className="grid grid-cols-2 gap-2">
        {nodeId && (
          <div>
            <span className="text-zinc-500">Node ID:</span>
            <span className="font-mono ml-1 text-zinc-300">{nodeId}</span>
          </div>
        )}
        {nodeType && (
          <div>
            <span className="text-zinc-500">Type:</span>
            <span className="font-mono ml-1 text-zinc-300">{nodeType}</span>
          </div>
        )}
        {formattedTimestamp && (
          <div className="col-span-2">
            <span className="text-zinc-500">Executed:</span>
            <span className="ml-1 text-zinc-300">{formattedTimestamp}</span>
          </div>
        )}
      </div>
    </div>
  );
});

const WorkflowNodeWrapper = memo(function WorkflowNodeWrapper({
  data,
  children
}: WorkflowNodeWrapperProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'result' | 'logs' | 'meta'>('result');

  const executionData = useMemo(() => data?.data || {}, [data?.data]);
  const status = useMemo(() => data?.executionStatus || executionData?.status || 'pending', [data, executionData]);

  const statusConfig = useMemo(() => STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.default, [status]);

  const hasExecutionData = useMemo(() => (
    Boolean(executionData.result || executionData.logs?.length ||
      (executionData.meta && Object.keys(executionData.meta).length > 0))
  ), [executionData]);

  const containerClasses = useMemo(() => `
    relative
    bg-gradient-to-br from-zinc-900 to-zinc-800
    rounded-xl
    border-2 ${statusConfig.border}
    ${statusConfig.shadow}
    ${isExpanded ? 'w-[500px]' : 'w-80'}
    text-white
    shadow-xl
    transition-all
    duration-300
    hover:shadow-2xl
    hover:brightness-110
  `, [statusConfig, isExpanded]);

  const toggleExpansion = useCallback(() => setIsExpanded(!isExpanded), [isExpanded]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SCROLLBAR_STYLES }} />
      <div className={containerClasses}>
        <div className="p-4">
          {children}
          {hasExecutionData && (
            <ExecutionStatus
              status={status}
              durationMs={executionData.durationMs}
              onToggle={toggleExpansion}
              isExpanded={isExpanded}
            />
          )}
        </div>

        {isExpanded && hasExecutionData && (
          <div className="border-t border-zinc-700 bg-zinc-900/50">
            <TabNavigation
              executionData={executionData}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <TabContent
              activeTab={activeTab}
              executionData={executionData}
            />
            <ExecutionFooter
              nodeId={executionData.nodeId}
              nodeType={executionData.nodeType}
              timestamp={executionData.timestamp}
            />
          </div>
        )}
      </div>
    </>
  );
});

export default WorkflowNodeWrapper;
