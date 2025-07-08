"use client"

import React, { useCallback, useState } from 'react';
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

import { MdScience, MdStop, MdRefresh } from "react-icons/md";
import '@xyflow/react/dist/style.css';

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

export default function Page() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
    
    const [workflowId, setWorkflowId] = useState<string | null>(null);
    const [shouldPoll, setShouldPoll] = useState(false);

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
    const handleRunWorkflow = async () => {
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
    };

    // Actions de contrôle
    const handleStopPolling = () => setShouldPoll(false);
    const handleClearWorkflow = () => {
        setShouldPoll(false);
        setWorkflowId(null);
    };
    const handleRefresh = () => mutate();

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
                    const executionData = workflowStatus.nodes.find(n => n.nodeId === node.id);
                    
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            executionStatus: executionData?.status || 'pending',
                            executionDuration: executionData?.durationMs,
                        } as BaseNodeData
                    };
                })
            );
        }
    }, [workflowStatus, setNodes]);

    return (
        <div style={{ width: '100%', height: '100vh' }}>
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
                <Panel position="bottom-center">
                    <div className="flex items-center gap-4 bg-gray-800 p-4 rounded-lg shadow-lg">
                        <button
                            onClick={handleRunWorkflow}
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
                                onClick={handleStopPolling}
                                className="bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-4 rounded-lg shadow transition duration-200 flex items-center gap-2"
                            >
                                Stop Polling
                                <MdStop size={20} />
                            </button>
                        )}

                        {workflowId && (
                            <button
                                onClick={handleRefresh}
                                className="bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-lg shadow transition duration-200 flex items-center gap-2"
                            >
                                <MdRefresh size={20} />
                            </button>
                        )}

                        {workflowId && !shouldPoll && (
                            <button
                                onClick={handleClearWorkflow}
                                className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg shadow transition duration-200"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </Panel>

                {/* Panel de statut */}
                <Panel position="top-right">
                    {workflowStatus && (
                        <div className="bg-gray-800 p-4 rounded-lg shadow-lg min-w-[250px]">
                            <h3 className="text-white font-semibold mb-2">Workflow Status</h3>

                            <div className="text-sm text-gray-300 mb-2">
                                <span className="font-medium">ID:</span> {workflowStatus.workflowId}
                            </div>

                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-white">Status:</span>
                                <span className={`
                                    px-2 py-1 rounded text-xs font-medium
                                    ${workflowStatus.status === 'running' ? 'bg-yellow-100 text-yellow-800' : ''}
                                    ${workflowStatus.status === 'success' ? 'bg-green-100 text-green-800' : ''}
                                    ${workflowStatus.status === 'error' ? 'bg-red-100 text-red-800' : ''}
                                `}>
                                    {workflowStatus.status.toUpperCase()}
                                </span>
                            </div>

                            <div className="text-sm text-gray-300 mb-2">
                                <span className="font-medium">Duration:</span> {workflowStatus.durationMs}ms
                            </div>

                            {progress > 0 && (
                                <div className="mb-2">
                                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                                        <span>Progress</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {workflowStatus.error && (
                                <div className="text-red-400 text-sm mt-2">
                                    <span className="font-medium">Error:</span> {workflowStatus.error}
                                </div>
                            )}

                            {shouldPoll && (
                                <div className="text-green-400 text-xs mt-2 flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    Polling active
                                </div>
                            )}

                            {!shouldPoll && (isCompleted || isFailed) && (
                                <div className="text-gray-400 text-xs mt-2 flex items-center gap-1">
                                    <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                    <span className={isCompleted ? 'text-green-400' : 'text-red-400'}>
                                        Workflow {isCompleted ? 'completed' : 'failed'}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-800 text-white p-3 rounded-lg mt-2">
                            <span className="font-medium">Polling Error:</span> {error.message}
                        </div>
                    )}
                </Panel>

                <Controls />
                <MiniMap nodeStrokeWidth={3} zoomable pannable />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </div>
    );
}
