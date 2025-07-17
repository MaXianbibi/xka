"use client"

import React, { useCallback, useState, useEffect, useMemo } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    BackgroundVariant,
    MarkerType,
    Connection,
    ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Hooks
import { useWorkflowPolling } from '@/app/lib/hook/pooling';
import { useWorkflowExecution } from '@/app/lib/hook/useWorkflowExecution';
import { useWorkflowLogs } from '@/app/lib/hook/useWorkflowLogs';

// Components
import { WorkflowControls } from './components/WorkflowControls';
import { WorkflowStatusPanel } from './components/WorkflowStatusPanel';

// Types and Constants
import { BaseNodeData } from "@/app/lib/types/types";
import { initialEdges, initialNodes, scrollbarStyles, nodeTypes } from "@/app/lib/Constants/constants";

// Constantes pour éviter les recréations
const ARROW_MARKER = {
    type: MarkerType.ArrowClosed,
    color: 'white',
    strokeWidth: 1.5,
};

const containerStyle = {
    width: '100%',
    height: '100vh',
};

export default function WorkflowPage() {
    // État initial
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState<'status' | 'logs'>('status');
    const [logFilter, setLogFilter] = useState<'all' | 'workflow' | string>('all');

    // Custom hooks
    const {
        workflowId,
        shouldPoll,
        setShouldPoll,
        handleRunWorkflow: executeWorkflow,
        handleStopPolling,
        handleClearWorkflow
    } = useWorkflowExecution();

    const { workflowStatus, isLoading, error, mutate, isRunning, isCompleted, isFailed, progress } = useWorkflowPolling(
        workflowId,
        shouldPoll
    );

    const { filteredLogs, availableNodes } = useWorkflowLogs(workflowStatus, logFilter);

    // Memoization des valeurs dérivées
    const workflowStatusMemo = useMemo(() => workflowStatus, [workflowStatus]);
    const logsMemo = useMemo(() => ({ filteredLogs, availableNodes }), [filteredLogs, availableNodes]);

    // Gestion des connexions
    const onConnect = useCallback((connection: Connection) => {
        setEdges((eds) => addEdge({ ...connection, markerEnd: ARROW_MARKER }, eds));
    }, [setEdges]);

    // Gestion de l'exécution
    const handleRunWorkflow = useCallback(() => {
        executeWorkflow(rfInstance);
    }, [executeWorkflow, rfInstance]);

    const handleRefresh = useCallback(() => mutate(), [mutate]);

    // Effets
    useEffect(() => {
        if (isCompleted || isFailed) {
            setShouldPoll(false);
        }
    }, [isCompleted, isFailed, setShouldPoll]);

    useEffect(() => {
        if (!workflowStatusMemo) return;

        setNodes(currentNodes =>
            currentNodes.map(node => {
                const executionData = workflowStatusMemo.nodes?.find(n => n.nodeId === node.id);
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
    }, [workflowStatusMemo, setNodes]);

    return (
        <div style={containerStyle}>
            <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                colorMode="dark"
                fitView
                nodeTypes={nodeTypes}
                onInit={setRfInstance}
            >
                <WorkflowControls
                    onRunWorkflow={handleRunWorkflow}
                    onStopPolling={handleStopPolling}
                    onClearWorkflow={handleClearWorkflow}
                    isRunning={isRunning}
                    isLoading={isLoading}
                    shouldPoll={shouldPoll}
                    workflowId={workflowId}
                />

                <WorkflowStatusPanel
                    workflowStatus={workflowStatusMemo}
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
                    {...logsMemo}
                />

                <Controls />
                <MiniMap nodeStrokeWidth={3} zoomable pannable />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </div>
    );
}
