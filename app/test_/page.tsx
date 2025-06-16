"use client"

import React, { useCallback } from 'react';
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

import { MdScience } from "react-icons/md";


import '@xyflow/react/dist/style.css';

import HttpRequestNode from './custom_node/HttpRequestNode'
import ManualStartNode from './custom_node/ManuelStartNode';
import CustomEdge from './custom_edges/canDeleteEdge';
import { saveWorkflow } from '@/app/lib/Workflow/workflow';

const initialNodes = [
    { id: 'c', position: { x: 0, y: 200 }, type: 'httpRequestNode', data: { "method": "GET", "url": "https://catfact.ninja/fact" } },
    { id: 'b', position: { x: 0, y: 100 }, type: 'manualStartNode', data: { label: '2' } },
    
];

const nodeTypes = { 
    httpRequestNode: HttpRequestNode,
    manualStartNode: ManualStartNode
};



const initialEdges: Edge[] = [
 
];

export default function Page() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [rfInstance, setRfInstance] = React.useState<any>(null);

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


    return (
        <div style={{ width: '100%', height: '100vh' }} className=" ">
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
                <Panel position="bottom-center" className="w-fit">
                    <button
                        onClick={async () => {
                            if (rfInstance) {
                                const workflowData = rfInstance.toObject();
                                const formData = new FormData();
                                formData.append('flowData', JSON.stringify(workflowData));

                                const result = await saveWorkflow(formData); // 👈 await ici
                                console.log('Result from server action:', result);
                            }
                            else {
                                console.error("React Flow instance is not initialized.");
                                alert("React Flow instance is not initialized. Please try again.");
                            }
                        } 
                    }
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-4 rounded-lg shadow hover:shadow-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 flex items-center justify-center gap-2"
                    >
                        Run Workflow
                        <MdScience size={25} />
                    </button>
                </Panel>


                <Controls >
                </Controls>
                <MiniMap nodeStrokeWidth={3} zoomable pannable />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </div>
    );
}