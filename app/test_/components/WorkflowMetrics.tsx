import { memo } from 'react';
import { WorkflowExecutionResult } from '@/app/lib/types/types';
import { formatTime } from '@/app/lib/utils/workflow-utils';

interface WorkflowMetricsProps {
  workflowStatus: WorkflowExecutionResult;
}

export const WorkflowMetrics = memo<WorkflowMetricsProps>(({ workflowStatus }) => (
  <div className="grid grid-cols-2 gap-3 text-xs">
    <div className="bg-zinc-800 rounded p-2">
      <div className="text-zinc-500">Total Nodes</div>
      <div className="text-zinc-300 font-mono">{workflowStatus.numberOfNodes || workflowStatus.nodes?.length || 0}</div>
    </div>
    <div className="bg-zinc-800 rounded p-2">
      <div className="text-zinc-500">Started At</div>
      <div className="text-zinc-300 font-mono">
        {workflowStatus.startedAt ? formatTime(workflowStatus.startedAt) : 'N/A'}
      </div>
    </div>
    <div className="bg-zinc-800 rounded p-2">
      <div className="text-zinc-500">Ended At</div>
      <div className="text-zinc-300 font-mono">
        {workflowStatus.endedAt ? formatTime(workflowStatus.endedAt) : 'N/A'}
      </div>
    </div>
    <div className="bg-zinc-800 rounded p-2">
      <div className="text-zinc-500">Status</div>
      <div className={`font-mono text-xs ${workflowStatus.status === 'success' ? 'text-green-400' : 
                                           workflowStatus.status === 'error' ? 'text-red-400' : 
                                           workflowStatus.status === 'running' ? 'text-yellow-400' : 'text-zinc-400'}`}>
        {workflowStatus.status?.toUpperCase() || 'PENDING'}
      </div>
    </div>
  </div>
));

WorkflowMetrics.displayName = 'WorkflowMetrics';