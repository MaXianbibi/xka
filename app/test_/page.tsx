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
    ControlButton,
    Edge,
    MarkerType,
    Connection,
    ReactFlowInstance,
    Panel,
} from '@xyflow/react';

import { MdScience, MdStop, MdRefresh } from "react-icons/md";

import '@xyflow/react/dist/style.css';

import HttpRequestNode from './custom_node/HttpRequestNode'
import ManualStartNode from './custom_node/ManuelStartNode';
import WaitingNode from './custom_node/WaitingNode';
import CustomEdge from './custom_edges/canDeleteEdge';
import { saveWorkflow } from '@/app/lib/Workflow/workflow';

// 🎯 Import du hook de polling
import { useWorkflowPolling } from '@/app/lib/hook/pooling';

const initialNodes = [
    { id: 'c', position: { x: 0, y: 200 }, type: 'httpRequestNode', data: { "method": "GET", "url": "https://catfact.ninja/fact" } },
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
    const [rfInstance, setRfInstance] = React.useState<any>(null);

    // 🎯 États pour le polling
    const [workflowId, setWorkflowId] = useState<string | null>(null);
    const [shouldPoll, setShouldPoll] = useState(false);

    // 🎯 Hook de polling SWR
    const { 
        workflowStatus, 
        isLoading, 
        error, 
        mutate,
        isRunning,
        isCompleted,
        isFailed,
        progress 
    } = useWorkflowPolling(workflowId, shouldPoll);

    const onConnect = useCallback((connection: Connection) => {
        console.log(rfInstance.toObject());
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
    }, [setEdges, rfInstance]);

    // 🎯 Fonction pour lancer le workflow
    const handleRunWorkflow = async () => {
        if (!rfInstance) {
            console.error("React Flow instance is not initialized.");
            alert("React Flow instance is not initialized. Please try again.");
            return;
        }

        const workflowData = rfInstance.toObject();
        const formData = new FormData();
        formData.append('flowData', JSON.stringify(workflowData));

        const result = await saveWorkflow(formData);

        if (!result.success) {
            console.error("Error saving workflow:", result.error);
            alert(`Error saving workflow: ${result.error}`);
            return;
        }

        const id = result.id!;
        setWorkflowId(id);
        setShouldPoll(true); // 🎯 Démarrer le polling
        console.log('✅ Workflow saved with ID:', id);
    };

    // 🎯 Fonction pour arrêter le polling MANUELLEMENT
    const handleStopPolling = () => {
        setShouldPoll(false);
        console.log('🛑 Polling stopped manually');
    };

    // 🎯 Fonction pour nettoyer complètement (nouveau workflow)
    const handleClearWorkflow = () => {
        setShouldPoll(false);
        setWorkflowId(null);
        console.log('🗑️ Workflow cleared');
    };

    // 🎯 Fonction pour refresh manuel
    const handleRefresh = () => {
        mutate(); // Force un refresh
    };

    // 🎯 Effet pour arrêter SEULEMENT le polling quand terminé (garde l'état visible)
    React.useEffect(() => {
        if (isCompleted || isFailed) {
            console.log('🎯 Workflow finished:', workflowStatus?.status);
            setShouldPoll(false); // ⚠️ Arrête le polling MAIS garde workflowStatus et workflowId
        }
    }, [isCompleted, isFailed, workflowStatus]);

    return (
        <div style={{ width: '100%', height: '100vh' }} className="">
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
                {/* 🎯 Panel principal avec boutons */}
                <Panel position="bottom-center" className="w-fit">
                    <div className="flex items-center gap-4 bg-gray-800 p-4 rounded-lg shadow-lg">
                        
                        {/* 🎯 Bouton Run Workflow */}
                        <button
                            onClick={handleRunWorkflow}
                            disabled={isRunning || isLoading}
                            className={`
                                font-medium py-2 px-4 rounded-lg shadow hover:shadow-lg transition duration-200 
                                focus:outline-none focus:ring-2 focus:ring-opacity-50 
                                flex items-center justify-center gap-2
                                ${isRunning || isLoading 
                                    ? 'bg-gray-500 cursor-not-allowed' 
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white focus:ring-indigo-500'
                                }
                            `}
                        >
                            {isLoading ? 'Running...' : 'Run Workflow'}
                            <MdScience size={20} />
                        </button>

                        {/* 🎯 Bouton Stop (si en cours de polling) */}
                        {shouldPoll && (
                            <button
                                onClick={handleStopPolling}
                                className="bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-4 rounded-lg shadow hover:shadow-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center justify-center gap-2"
                            >
                                Stop Polling
                                <MdStop size={20} />
                            </button>
                        )}

                        {/* 🎯 Bouton Refresh */}
                        {workflowId && (
                            <button
                                onClick={handleRefresh}
                                className="bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-lg shadow hover:shadow-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 flex items-center justify-center gap-2"
                            >
                                <MdRefresh size={20} />
                            </button>
                        )}

                        {/* 🎯 Bouton Clear (pour nettoyer l'état) */}
                        {workflowId && !shouldPoll && (
                            <button
                                onClick={handleClearWorkflow}
                                className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg shadow hover:shadow-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </Panel>

                {/* 🎯 Panel de status */}
                <Panel position="top-right" className="w-fit">
                    {workflowStatus && (
                        <div className="bg-gray-800 p-4 rounded-lg shadow-lg min-w-[250px]">
                            <h3 className="text-white font-semibold mb-2">Workflow Status</h3>
                            
                            {/* 🎯 ID du workflow */}
                            <div className="text-sm text-gray-300 mb-2">
                                <span className="font-medium">ID:</span> {workflowStatus.workflowId}
                            </div>

                            {/* 🎯 Statut avec couleur */}
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

                            {/* 🎯 Durée d'exécution */}
                            <div className="text-sm text-gray-300 mb-2">
                                <span className="font-medium">Duration:</span> {workflowStatus.durationMs}ms
                            </div>

                            {/* 🎯 Barre de progression */}
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

                            {/* 🎯 Erreur */}
                            {workflowStatus.error && (
                                <div className="text-red-400 text-sm mt-2">
                                    <span className="font-medium">Error:</span> {workflowStatus.error}
                                </div>
                            )}
                            
                            {/* 🎯 Indicateur de polling */}
                            {shouldPoll && (
                                <div className="text-green-400 text-xs mt-2 flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    Polling active
                                </div>
                            )}

                            {/* 🎯 Indicateur statique quand terminé */}
                            {!shouldPoll && (isCompleted || isFailed) && (
                                <div className="text-gray-400 text-xs mt-2 flex items-center gap-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                    Workflow finished
                                </div>
                            )}
                        </div>
                    )}

                    {/* 🎯 Erreur de polling */}
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
