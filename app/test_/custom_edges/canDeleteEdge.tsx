import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  
} from '@xyflow/react';
 

type CustomEdgeProps = {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  [key: string]: any;
};

export default function CustomEdge({ id, sourceX, sourceY, targetX, targetY, ...props }: CustomEdgeProps) {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });
 
  const { markerEnd } = props;


  return (
    <>
      <BaseEdge id={id} path={edgePath}
      markerEnd={markerEnd}
      
    />
      <EdgeLabelRenderer>
        <button
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
          onClick={() => {
            setEdges((es) => es.filter((e) => e.id !== id));
          }}
        >
          delete
        </button>
      </EdgeLabelRenderer>
    </>
  );
}