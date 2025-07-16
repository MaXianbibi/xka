import React, { ReactNode, useState, memo, useMemo, useCallback } from 'react';
import { MdExpandMore, MdExpandLess, MdKeyboardArrowRight, MdKeyboardArrowDown } from 'react-icons/md';

// Custom scrollbar styles pour cohérence avec le workflow panel
const scrollbarStyles = `
  .custom-scrollbar-node {
    scrollbar-width: thin;
    scrollbar-color: rgba(113, 113, 122, 0.5) rgba(39, 39, 42, 0.3);
  }
  .custom-scrollbar-node::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar-node::-webkit-scrollbar-track {
    background: rgba(39, 39, 42, 0.3);
    border-radius: 3px;
  }
  .custom-scrollbar-node::-webkit-scrollbar-thumb {
    background: rgba(113, 113, 122, 0.5);
    border-radius: 3px;
    transition: background 0.2s ease;
  }
  .custom-scrollbar-node::-webkit-scrollbar-thumb:hover {
    background: rgba(113, 113, 122, 0.8);
  }
`;

interface WorkflowNodeWrapperProps {
    data: any;
    children: ReactNode;
}

interface ExecutionData {
    nodeId?: string;
    nodeType?: string;
    status?: 'success' | 'error' | 'running' | 'pending';
    timestamp?: number;
    durationMs?: number;
    result?: any;
    logs?: string[];
    meta?: any;
}

const WorkflowNodeWrapper = memo(function WorkflowNodeWrapper({ data, children }: WorkflowNodeWrapperProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState<'result' | 'logs' | 'meta'>('result');

    // Memoized execution data extraction
    const executionData: ExecutionData = useMemo(() => data?.data || {}, [data?.data]);
    const status = useMemo(() => data?.executionStatus || executionData?.status, [data?.executionStatus, executionData?.status]);

    // Memoized status calculations
    const statusColor = useMemo(() => {
        switch (status) {
            case 'running': return 'border-yellow-400 shadow-yellow-400/20';
            case 'success': return 'border-green-400 shadow-green-400/20';
            case 'error': return 'border-red-400 shadow-red-400/20';
            default: return 'border-zinc-600/50 shadow-lg';
        }
    }, [status]);

    const statusIcon = useMemo(() => {
        switch (status) {
            case 'running': return <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />;
            case 'success': return <div className="w-3 h-3 bg-green-400 rounded-full" />;
            case 'error': return <div className="w-3 h-3 bg-red-400 rounded-full" />;
            default: return <div className="w-3 h-3 bg-zinc-500 rounded-full" />;
        }
    }, [status]);

    // Memoized utility functions
    const formatTimestamp = useCallback((timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleString();
    }, []);

    const formatDuration = useCallback((ms: number) => {
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    }, []);

    const hasExecutionData = useMemo(() => 
        executionData.result || executionData.logs || executionData.meta, 
        [executionData.result, executionData.logs, executionData.meta]
    );

    // Memoized JsonViewer component for better performance
    const JsonViewer = memo(({ data, level = 0 }: { data: any; level?: number }) => {
        const [collapsed, setCollapsed] = useState(level > 1);

        if (data === null) return <span className="text-zinc-400">null</span>;
        if (data === undefined) return <span className="text-zinc-400">undefined</span>;
        if (typeof data === 'string') {
            // Truncate very long strings
            const displayStr = data.length > 100 ? data.substring(0, 100) + '...' : data;
            return <span className="text-green-300">"{displayStr}"</span>;
        }
        if (typeof data === 'number') return <span className="text-blue-300">{data}</span>;
        if (typeof data === 'boolean') return <span className="text-purple-300">{data.toString()}</span>;

        if (Array.isArray(data)) {
            if (data.length === 0) return <span className="text-zinc-400">[]</span>;
            return (
                <div className="ml-2">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="text-zinc-400 hover:text-white transition-colors text-sm flex items-center gap-1"
                    >
                        {collapsed ? <MdKeyboardArrowRight size={14} /> : <MdKeyboardArrowDown size={14} />}
                        Array[{data.length}]
                    </button>
                    {!collapsed && (
                        <div className="ml-4 border-l border-zinc-700 pl-2 mt-1">
                            {data.slice(0, 10).map((item, index) => (
                                <div key={index} className="py-1">
                                    <span className="text-zinc-500 text-xs">[{index}]: </span>
                                    <JsonViewer data={item} level={level + 1} />
                                </div>
                            ))}
                            {data.length > 10 && (
                                <div className="text-zinc-500 text-xs py-1">
                                    ... and {data.length - 10} more items
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        }

        if (typeof data === 'object') {
            const keys = Object.keys(data);
            if (keys.length === 0) return <span className="text-zinc-400">{'{}'}</span>;
            return (
                <div className="ml-2">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
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
                                    <JsonViewer data={data[key]} level={level + 1} />
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

        return <span className="text-zinc-300">{String(data)}</span>;
    });

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
            <div className={`
            relative 
            bg-gradient-to-br from-zinc-900 to-zinc-800 
            rounded-xl 
            border-2 
            ${statusColor}
            ${isExpanded ? 'w-[500px]' : 'w-80'}
            text-white 
            shadow-xl
            transition-all 
            duration-300 
            hover:shadow-2xl
            hover:brightness-110
        `}>
                {/* Main Node Content */}
                <div className="p-4">
                    {children}

                    {/* Execution Status Bar */}
                    {hasExecutionData && (
                        <div className="mt-3 pt-3 border-t border-zinc-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm">
                                    {statusIcon}
                                    <span className="text-zinc-300 capitalize">
                                        {status || 'pending'}
                                    </span>
                                    {executionData.durationMs && (
                                        <span className="text-zinc-500">
                                            • {formatDuration(executionData.durationMs)}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="text-zinc-400 hover:text-white transition-colors p-1 rounded hover:bg-zinc-700"
                                    title={isExpanded ? 'Collapse details' : 'Expand details'}
                                >
                                    {isExpanded ? <MdExpandLess size={16} /> : <MdExpandMore size={16} />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Expanded Execution Details */}
                {isExpanded && hasExecutionData && (
                    <div className="border-t border-zinc-700 bg-zinc-900/50">
                        {/* Tab Navigation */}
                        <div className="flex border-b border-zinc-700">
                            {executionData.result && (
                                <button
                                    onClick={() => setActiveTab('result')}
                                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'result'
                                            ? 'text-white border-b-2 border-blue-400 bg-zinc-800/50'
                                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
                                        }`}
                                >
                                    Result
                                </button>
                            )}
                            {executionData.logs && executionData.logs.length > 0 && (
                                <button
                                    onClick={() => setActiveTab('logs')}
                                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'logs'
                                            ? 'text-white border-b-2 border-blue-400 bg-zinc-800/50'
                                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
                                        }`}
                                >
                                    Logs ({executionData.logs.length})
                                </button>
                            )}
                            {executionData.meta && Object.keys(executionData.meta).length > 0 && (
                                <button
                                    onClick={() => setActiveTab('meta')}
                                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'meta'
                                            ? 'text-white border-b-2 border-blue-400 bg-zinc-800/50'
                                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
                                        }`}
                                >
                                    Meta
                                </button>
                            )}
                        </div>

                        {/* Tab Content */}
                        <div className="p-4 max-h-96 overflow-y-auto custom-scrollbar-node">
                            {activeTab === 'result' && executionData.result && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-zinc-300 mb-2">Execution Result</h4>
                                    <div className="bg-zinc-800 rounded-lg p-3 font-mono text-xs overflow-x-auto">
                                        <JsonViewer data={executionData.result} />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'logs' && executionData.logs && (
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
                            )}

                            {activeTab === 'meta' && executionData.meta && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-zinc-300 mb-2">Metadata</h4>
                                    <div className="bg-zinc-800 rounded-lg p-3 font-mono text-xs overflow-x-auto">
                                        <JsonViewer data={executionData.meta} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Execution Info Footer */}
                        <div className="border-t border-zinc-700 px-4 py-3 text-xs text-zinc-400 bg-zinc-900/30">
                            <div className="grid grid-cols-2 gap-2">
                                {executionData.nodeId && (
                                    <div>
                                        <span className="text-zinc-500">Node ID:</span>
                                        <span className="font-mono ml-1 text-zinc-300">{executionData.nodeId}</span>
                                    </div>
                                )}
                                {executionData.nodeType && (
                                    <div>
                                        <span className="text-zinc-500">Type:</span>
                                        <span className="font-mono ml-1 text-zinc-300">{executionData.nodeType}</span>
                                    </div>
                                )}
                                {executionData.timestamp && (
                                    <div className="col-span-2">
                                        <span className="text-zinc-500">Executed:</span>
                                        <span className="ml-1 text-zinc-300">{formatTimestamp(executionData.timestamp)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
});

export default WorkflowNodeWrapper;
