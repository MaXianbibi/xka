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

import TextUpdaterNode from './custom_node/input_node'
import CustomEdge from './custom_edges/canDeleteEdge';

const initialNodes = [
    { id: 'a', position: { x: 0, y: 0 }, data: { label: '1' } },
    { id: 'b', position: { x: 0, y: 100 }, data: { label: '2' } },
    { id: 'c', position: { x: 0, y: 200 }, type: 'textUpdater', data: { label: '3' } },
    { id: 'd', position: { x: 0, y: 300 }, data: { label: 'd' } },

];

const nodeTypes = { textUpdater: TextUpdaterNode };
const edgeTypes = {
    'custom-edge': CustomEdge,
};

const initialEdges: Edge[] = [
    {
        id: 'a->b',
        source: 'a',
        target: 'b',
        type: 'custom-edge',
        markerEnd: {
            type: MarkerType.ArrowClosed,
            color: 'white',
        },
    },
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
                    type: 'custom-edge',
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
                edgeTypes={edgeTypes}
                onInit={setRfInstance}
            >
                <Panel position="bottom-center" className="w-fit">
                    <button
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-4 rounded-lg shadow hover:shadow-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 flex items-center justify-center gap-2"
                    >
                        Run Workflow
                        <MdScience className="" size={25}/>
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