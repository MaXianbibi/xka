"use client"

import React, { useCallback, useState, useMemo, memo } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    BackgroundVariant,
    Edge,
    MarkerType,
    Connection,
    ReactFlowInstance,
    Panel,
    Node,
} from '@xyflow/react';

import { MdScience, MdStop, MdRefresh, MdExpandMore, MdExpandLess } from "react-icons/md";
import '@xyflow/react/dist/style.css';

// Custom scrollbar styles
const scrollbarStyles = `
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(113, 113, 122, 0.5) rgba(39, 39, 42, 0.3);
  }
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
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
  
  /* Hide default scrollbar for the tab content container */
  .tab-content-container {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .tab-content-container::-webkit-scrollbar {
    display: none;
  }
`;

import HttpRequestNode from './custom_node/HttpRequestNode'
import ManualStartNode from './custom_node/ManuelStartNode';
import WaitingNode from './custom_node/WaitingNode';
import { saveWorkflow } from '@/app/lib/Workflow/workflow';
import { useWorkflowPolling } from '@/app/lib/hook/pooling';

// Types
interface BaseNodeData {
    executionStatus?: 'pending' | 'running' | 'success' | 'error';
    executionDuration?: number;
    [key: string]: any;
}

interface LogItem {
    type: 'workflow' | 'node';
    nodeId?: string;
    log: string;
    index: number;
}

interface WorkflowNode {
    nodeId: string;
    logs?: string[];
    status?: string;
    durationMs?: number;
}

// Configuration initiale
const initialNodes: Node[] = [
    { id: 'c', position: { x: 0, y: 200 }, type: 'httpRequestNode', data: { method: "GET", url: "https://catfact.ninja/fact" } },
    { id: 'b', position: { x: 0, y: 100 }, type: 'manualStartNode', data: { label: '2' } },
    { id: 'a', position: { x: 0, y: 0 }, type: 'waitingNode', data: { duration: 1000 } },
];

const nodeTypes = {
    httpRequestNode: HttpRequestNode,
    manualStartNode: ManualStartNode,
    waitingNode: WaitingNode,
};

const initialEdges: Edge[] = [];

// Memoized Control Panel Component
const ControlPanel = memo(({ 
    onRunWorkflow, 
    onStopPolling, 
    onRefresh, 
    onClearWorkflow, 
    isRunning, 
    isLoading, 
    shouldPoll, 
    workflowId 
}: {
    onRunWorkflow: () => void;
    onStopPolling: () => void;
    onRefresh: () => void;
    onClearWorkflow: () => void;
    isRunning: boolean;
    isLoading: boolean;
    shouldPoll: boolean;
    workflowId: string | null;
}) => (
    <Panel position="bottom-center">
        <div className="flex items-center gap-4 bg-gray-800 p-4 rounded-lg shadow-lg">
            <button
                onClick={onRunWorkflow}
                disabled={isRunning || isLoading}
                className={`
                    font-medium py-2 px-4 rounded-lg shadow transition duration-200 
                    flex items-center justify-center gap-2
                    ${isRunning || isLoading
                        ? 'bg-gray-500 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }
                `}
            >
                {isLoading ? 'Running...' : 'Run Workflow'}
                <MdScience size={20} />
            </button>

            {shouldPoll && (
                <button
                    onClick={onStopPolling}
                    className="bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-4 rounded-lg shadow transition duration-200 flex items-center gap-2"
                >
                    Stop Polling
                    <MdStop size={20} />
                </button>
            )}

            {workflowId && (
                <button
                    onClick={onRefresh}
                    className="bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-lg shadow transition duration-200 flex items-center gap-2"
                >
                    <MdRefresh size={20} />
                </button>
            )}

            {workflowId && !shouldPoll && (
                <button
                    onClick={onClearWorkflow}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg shadow transition duration-200"
                >
                    Clear
                </button>
            )}
        </div>
    </Panel>
));

// Memoized Status Panel Component
const StatusPanel = memo(({ 
    workflowStatus, 
    error, 
    isExpanded, 
    setIsExpanded, 
    activeTab, 
    setActiveTab, 
    logFilter, 
    setLogFilter, 
    shouldPoll, 
    isCompleted, 
    isFailed, 
    progress,
    filteredLogs,
    availableNodes 
}: {
    workflowStatus: any;
    error: any;
    isExpanded: boolean;
    setIsExpanded: (expanded: boolean) => void;
    activeTab: 'status' | 'logs';
    setActiveTab: (tab: 'status' | 'logs') => void;
    logFilter: string;
    setLogFilter: (filter: string) => void;
    shouldPoll: boolean;
    isCompleted: boolean;
    isFailed: boolean;
    progress: number;
    filteredLogs: LogItem[];
    availableNodes: WorkflowNode[];
}) => (
    <Panel position="top-right">
        {workflowStatus && (
            <div className={`
                bg-gradient-to-br from-zinc-900 to-zinc-800 
                rounded-xl 
                border-2 
                ${workflowStatus.status === 'running' ? 'border-yellow-400 shadow-yellow-400/20' : ''}
                ${workflowStatus.status === 'success' ? 'border-green-400 shadow-green-400/20' : ''}
                ${workflowStatus.status === 'error' ? 'border-red-400 shadow-red-400/20' : 'border-zinc-600/50'}
                text-white 
                shadow-xl
                transition-all 
                duration-300 
                hover:shadow-2xl
                hover:brightness-110
                ${isExpanded ? 'w-[700px]' : 'w-80'}
            `}>
                <div className="p-4">
                    {/* Header avec status et expand button */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-semibold text-lg">Workflow Status</h3>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                {workflowStatus.status === 'running' && <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />}
                                {workflowStatus.status === 'success' && <div className="w-3 h-3 bg-green-400 rounded-full" />}
                                {workflowStatus.status === 'error' && <div className="w-3 h-3 bg-red-400 rounded-full" />}
                                {!workflowStatus.status && <div className="w-3 h-3 bg-zinc-500 rounded-full" />}
                            </div>
                            {(workflowStatus.logs && workflowStatus.logs.length > 0) && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-zinc-500">
                                        {workflowStatus.logs.length + (workflowStatus.nodes?.reduce((acc: number, node: WorkflowNode) => acc + (node.logs?.length || 0), 0) || 0)} logs
                                    </span>
                                    <button
                                        onClick={() => setIsExpanded(!isExpanded)}
                                        className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-zinc-700/50 text-xs"
                                        title={isExpanded ? 'Collapse details' : 'View execution logs and details'}
                                    >
                                        {isExpanded ? (
                                            <>
                                                <MdExpandLess size={14} />
                                                <span>Hide</span>
                                            </>
                                        ) : (
                                            <>
                                                <MdExpandMore size={14} />
                                                <span>Details</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Workflow ID */}
                    <div className="mb-4 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                        <div className="text-xs text-zinc-400 uppercase tracking-wide mb-1">Workflow ID</div>
                        <div className="text-sm text-zinc-300 font-mono break-all">
                            {workflowStatus.workflowId.slice(0, 8)}...{workflowStatus.workflowId.slice(-8)}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {progress > 0 && (
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-zinc-300 font-medium">Progress</span>
                                <span className="text-sm text-zinc-300 font-mono">{progress}%</span>
                            </div>
                            <div className="w-full bg-zinc-700 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-blue-400 h-full rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Duration */}
                    <div className="mb-4 p-3 bg-zinc-800/50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-zinc-400">Duration</span>
                            <span className="text-sm text-zinc-300 font-mono">
                                {workflowStatus.durationMs < 1000
                                    ? `${workflowStatus.durationMs}ms`
                                    : `${(workflowStatus.durationMs / 1000).toFixed(2)}s`
                                }
                            </span>
                        </div>
                    </div>

                    {/* Error Message */}
                    {workflowStatus.error && (
                        <div className="mb-4 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                <div className="text-xs text-red-400 uppercase tracking-wide">Error Details</div>
                            </div>
                            <div className="text-sm text-zinc-300 break-words">{workflowStatus.error}</div>
                        </div>
                    )}

                    {/* Status Footer */}
                    <div className="pt-3 border-t border-zinc-700">
                        {shouldPoll && (
                            <div className="flex items-center gap-2 text-sm">
                                <div className="relative">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75"></div>
                                </div>
                                <span className="text-zinc-300">Live monitoring active</span>
                            </div>
                        )}

                        {!shouldPoll && (isCompleted || isFailed) && (
                            <div className="flex items-center gap-2 text-sm">
                                <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                <span className={`${isCompleted ? 'text-green-400' : 'text-red-400'}`}>
                                    {isCompleted ? 'Workflow completed successfully' : 'Workflow execution failed'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Expanded Details avec Tabs */}
                {isExpanded && workflowStatus.logs && workflowStatus.logs.length > 0 && (
                    <div className="border-t border-zinc-700 bg-zinc-900/50">
                        {/* Tab Navigation */}
                        <div className="flex border-b border-zinc-700">
                            <button
                                onClick={() => setActiveTab('status')}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'status'
                                    ? 'text-white border-b-2 border-blue-400 bg-zinc-800/50'
                                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
                                    }`}
                            >
                                Summary
                            </button>
                            <button
                                onClick={() => setActiveTab('logs')}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'logs'
                                    ? 'text-white border-b-2 border-blue-400 bg-zinc-800/50'
                                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
                                    }`}
                            >
                                Logs ({workflowStatus.logs.length + (workflowStatus.nodes?.reduce((acc: number, node: WorkflowNode) => acc + (node.logs?.length || 0), 0) || 0)})
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="p-4 max-h-96 overflow-y-auto tab-content-container">
                            {activeTab === 'status' && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-zinc-300 mb-2">Execution Summary</h4>
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div className="bg-zinc-800 rounded p-2">
                                            <div className="text-zinc-500">Total Nodes</div>
                                            <div className="text-zinc-300 font-mono">{workflowStatus.numberOfNodes || workflowStatus.nodes?.length || 0}</div>
                                        </div>
                                        <div className="bg-zinc-800 rounded p-2">
                                            <div className="text-zinc-500">Started At</div>
                                            <div className="text-zinc-300 font-mono">
                                                {workflowStatus.startedAt ? new Date(workflowStatus.startedAt * 1000).toLocaleTimeString() : 'N/A'}
                                            </div>
                                        </div>
                                        <div className="bg-zinc-800 rounded p-2">
                                            <div className="text-zinc-500">Ended At</div>
                                            <div className="text-zinc-300 font-mono">
                                                {workflowStatus.endedAt ? new Date(workflowStatus.endedAt * 1000).toLocaleTimeString() : 'N/A'}
                                            </div>
                                        </div>
                                        <div className="bg-zinc-800 rounded p-2">
                                            <div className="text-zinc-500">Status</div>
                                            <div className={`font-mono text-xs ${workflowStatus.status === 'success' ? 'text-green-400' :
                                                workflowStatus.status === 'error' ? 'text-red-400' :
                                                    workflowStatus.status === 'running' ? 'text-yellow-400' : 'text-zinc-400'
                                                }`}>
                                                {workflowStatus.status?.toUpperCase() || 'PENDING'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'logs' && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-semibold text-zinc-300">Execution Logs</h4>
                                        <select
                                            value={logFilter}
                                            onChange={(e) => setLogFilter(e.target.value)}
                                            className="bg-zinc-800 border border-zinc-600 text-zinc-300 text-xs rounded px-2 py-1 focus:outline-none focus:border-blue-400 transition-colors"
                                        >
                                            <option value="all">All Sources ({filteredLogs.length})</option>
                                            <option value="workflow">Workflow ({workflowStatus.logs?.length || 0})</option>
                                            {availableNodes.map((node) => (
                                                <option key={node.nodeId} value={node.nodeId}>
                                                    Node {node.nodeId} ({node.logs?.length || 0})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2 custom-scrollbar max-h-80 overflow-y-auto pr-2">
                                        {filteredLogs.length === 0 ? (
                                            <div className="text-center text-zinc-500 text-xs py-4">
                                                No logs available for the selected filter
                                            </div>
                                        ) : (
                                            filteredLogs.map((logItem, index) => (
                                                <div
                                                    key={`${logItem.type}-${logItem.nodeId || 'workflow'}-${logItem.index}`}
                                                    className={`bg-zinc-800 rounded px-3 py-2 font-mono text-xs text-zinc-300 border-l-2 ${logItem.type === 'workflow'
                                                        ? 'border-blue-400'
                                                        : 'border-zinc-600'
                                                        }`}
                                                >
                                                    <span className={`mr-2 ${logItem.type === 'workflow'
                                                        ? 'text-blue-400'
                                                        : 'text-zinc-500'
                                                        }`}>
                                                        [{logItem.type === 'workflow' ? 'WORKFLOW' : logItem.nodeId}]
                                                    </span>
                                                    {logItem.log}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        )}

        {error && (
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl border-2 border-red-400 shadow-red-400/20 text-white shadow-xl mt-3 w-80">
                <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <span className="font-medium text-sm text-zinc-300">Connection Error</span>
                    </div>
                    <div className="text-sm text-zinc-300 break-words">{error.message}</div>
                </div>
            </div>
        )}
    </Panel>
));

export default function Page() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

    const [workflowId, setWorkflowId] = useState<string | null>(null);
    const [shouldPoll, setShouldPoll] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState<'status' | 'logs'>('status');
    const [logFilter, setLogFilter] = useState<'all' | 'workflow' | string>('all');

    const { workflowStatus, isLoading, error, mutate, isRunning, isCompleted, isFailed, progress } = useWorkflowPolling(workflowId, shouldPoll);

    // Connexion des edges
    const onConnect = useCallback((connection: Connection) => {
        setEdges((eds) =>
            addEdge(
                {
                    ...connection,
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: 'white',
                        strokeWidth: 1.5,
                    },
                },
                eds
            )
        );
    }, [setEdges]);

    // Lancer le workflow
    const handleRunWorkflow = useCallback(async () => {
        if (!rfInstance) {
            alert("React Flow instance is not initialized. Please try again.");
            return;
        }

        const workflowData = rfInstance.toObject();
        const formData = new FormData();
        formData.append('flowData', JSON.stringify(workflowData));

        const result = await saveWorkflow(formData);

        if (!result.success) {
            alert(`Error saving workflow: ${result.error}`);
            return;
        }

        setWorkflowId(result.id!);
        setShouldPoll(true);
        console.log('✅ Workflow saved with ID:', result.id);
    }, [rfInstance]);

    // Actions de contrôle
    const handleStopPolling = useCallback(() => setShouldPoll(false), []);
    const handleClearWorkflow = useCallback(() => {
        setShouldPoll(false);
        setWorkflowId(null);
    }, []);
    const handleRefresh = useCallback(() => mutate(), [mutate]);

    // Arrêter le polling quand terminé
    React.useEffect(() => {
        if (isCompleted || isFailed) {
            setShouldPoll(false);
        }
    }, [isCompleted, isFailed]);

    // Mettre à jour les nodes avec les statuts d'exécution
    React.useEffect(() => {
        if (workflowStatus) {
            setNodes(currentNodes =>
                currentNodes.map(node => {
                    const executionData = workflowStatus.nodes?.find((n: WorkflowNode) => n.nodeId === node.id);
                    
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            data: executionData,
                            executionStatus: executionData?.status || 'pending',
                            executionDuration: executionData?.durationMs,
                        } as BaseNodeData
                    };
                })
            );
        }
    }, [workflowStatus, setNodes]);

    // Memoized functions for better performance
    const filteredLogs = useMemo((): LogItem[] => {
        if (!workflowStatus) return [];

        const allLogs: LogItem[] = [];

        // Ajouter les logs du workflow
        if (workflowStatus.logs) {
            workflowStatus.logs.forEach((log: string, index: number) => {
                allLogs.push({ type: 'workflow', log, index });
            });
        }

        // Ajouter les logs des nodes
        if (workflowStatus.nodes) {
            workflowStatus.nodes.forEach((node: WorkflowNode) => {
                if (node.logs) {
                    node.logs.forEach((log: string, logIndex: number) => {
                        allLogs.push({ type: 'node', nodeId: node.nodeId, log, index: logIndex });
                    });
                }
            });
        }

        // Filtrer selon la sélection
        if (logFilter === 'all') return allLogs;
        if (logFilter === 'workflow') return allLogs.filter(item => item.type === 'workflow');
        return allLogs.filter(item => item.nodeId === logFilter);
    }, [workflowStatus, logFilter]);

    const availableNodes = useMemo((): WorkflowNode[] => {
        if (!workflowStatus?.nodes) return [];
        return workflowStatus.nodes.filter((node: WorkflowNode) => node.logs && node.logs.length > 0);
    }, [workflowStatus?.nodes]);

    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                colorMode='dark'
                fitView
                nodeTypes={nodeTypes}
                onInit={setRfInstance}
            >
                {/* Panel de contrôle */}
                <ControlPanel
                    onRunWorkflow={handleRunWorkflow}
                    onStopPolling={handleStopPolling}
                    onRefresh={handleRefresh}
                    onClearWorkflow={handleClearWorkflow}
                    isRunning={isRunning}
                    isLoading={isLoading}
                    shouldPoll={shouldPoll}
                    workflowId={workflowId}
                />

                {/* Panel de statut */}
                <StatusPanel
                    workflowStatus={workflowStatus}
                    error={error}
                    isExpanded={isExpanded}
                    setIsExpanded={setIsExpanded}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    logFilter={logFilter}
                    setLogFilter={setLogFilter}
                    shouldPoll={shouldPoll}
                    isCompleted={isCompleted}
                    isFailed={isFailed}
                    progress={progress}
                    filteredLogs={filteredLogs}
                    availableNodes={availableNodes}
                />

                <Controls />
                <MiniMap nodeStrokeWidth={3} zoomable pannable />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </div>
    );
}