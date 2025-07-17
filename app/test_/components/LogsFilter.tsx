import { memo } from 'react';
import { LogItem, WorkflowNodeResult, WorkflowExecutionResult } from '@/app/lib/types/types';

interface LogsFilterProps {
  logFilter: string;
  setLogFilter: (filter: string) => void;
  filteredLogs: LogItem[];
  workflowStatus: WorkflowExecutionResult;
  availableNodes: WorkflowNodeResult[];
}

export const LogsFilter = memo<LogsFilterProps>(({ 
  logFilter, 
  setLogFilter, 
  filteredLogs, 
  workflowStatus, 
  availableNodes 
}) => (
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
));

LogsFilter.displayName = 'LogsFilter';