"use client"

import React, { useCallback, useState, useEffect } from 'react';
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

export default function WorkflowPage() {
    // State management
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

    const { workflowStatus, isLoading, error, mutate, isRunning, isCompleted, isFailed, progress } = useWorkflowPolling(workflowId, shouldPoll);
    const { filteredLogs, availableNodes } = useWorkflowLogs(workflowStatus ?? null, logFilter);

    // Event handlers
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

    const handleRunWorkflow = useCallback(() => {
        executeWorkflow(rfInstance);
    }, [executeWorkflow, rfInstance]);

    const handleRefresh = useCallback(() => mutate(), [mutate]);

    // Effects
    useEffect(() => {
        if (isCompleted || isFailed) {
            setShouldPoll(false);
        }
    }, [isCompleted, isFailed, setShouldPoll]);

    useEffect(() => {
        if (workflowStatus) {
            setNodes(currentNodes =>
                currentNodes.map(node => {
                    const executionData = workflowStatus.nodes?.find(n => n.nodeId === node.id);

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
                <WorkflowControls
                    onRunWorkflow={handleRunWorkflow}
                    onStopPolling={handleStopPolling}
                    onRefresh={handleRefresh}
                    onClearWorkflow={handleClearWorkflow}
                    isRunning={isRunning}
                    isLoading={isLoading}
                    shouldPoll={shouldPoll}
                    workflowId={workflowId}
                />

                <WorkflowStatusPanel
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