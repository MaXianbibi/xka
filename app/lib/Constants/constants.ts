import { Edge, Node } from "@xyflow/react";
import HttpRequestNode from "../../test_/custom_node/HttpRequestNode";
import ManualStartNode from "../../test_/custom_node/ManuelStartNode";
import WaitingNode from "../../test_/custom_node/WaitingNode";



export const initialNodes: Node[] = [
    { id: 'c', position: { x: 0, y: 200 }, type: 'httpRequestNode', data: { method: "GET", url: "https://catfact.ninja/fact" } },
    { id: 'b', position: { x: 0, y: 100 }, type: 'manualStartNode', data: { label: '2' } },
    { id: 'a', position: { x: 0, y: 0 }, type: 'waitingNode', data: { duration: 1000 } },
];

export const nodeTypes = {
    httpRequestNode: HttpRequestNode,
    manualStartNode: ManualStartNode,
    waitingNode: WaitingNode,
};

export const initialEdges: Edge[] = [];

// ==================== STYLES ====================
export const scrollbarStyles = `
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
  
  .tab-content-container {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .tab-content-container::-webkit-scrollbar {
    display: none;
  }
`;
