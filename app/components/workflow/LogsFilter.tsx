import { memo, useCallback } from 'react';
import { LogItem, WorkflowNodeResult, WorkflowExecutionResult } from '@/app/lib/types/types';

// Styles constants
const CONTAINER_STYLE = "flex items-center justify-between mb-3";
const TITLE_STYLE = "text-sm font-semibold text-zinc-300";
const SELECT_STYLE = "bg-zinc-800 border border-zinc-600 text-zinc-300 text-xs rounded px-2 py-1 focus:outline-none focus:border-blue-400 transition-colors";

// Composant optimisé
export const LogsFilter = memo<{
  logFilter: string;
  setLogFilter: (filter: string) => void;
  filteredLogs: LogItem[];
  workflowStatus: WorkflowExecutionResult;
  availableNodes: WorkflowNodeResult[];
}>(({
  logFilter,
  setLogFilter,
  filteredLogs,
  workflowStatus,
  availableNodes
}) => {
  // Callback optimisé pour le changement de filtre
  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setLogFilter(e.target.value);
  }, [setLogFilter]);

  // Calcul des comptes de logs une seule fois
  const workflowLogCount = workflowStatus.logs?.length || 0;
  const nodeLogCounts = useCallback(() => (
    availableNodes.map((node) => ({
      nodeId: node.nodeId,
      count: node.logs?.length || 0
    }))
  ), [availableNodes]);

  return (
    <div className={CONTAINER_STYLE}>
      <h4 className={TITLE_STYLE}>Execution Logs</h4>
      <select
        value={logFilter}
        onChange={handleFilterChange}
        className={SELECT_STYLE}
      >
        <option value="all">All Sources ({filteredLogs.length})</option>
        <option value="workflow">Workflow ({workflowLogCount})</option>
        {nodeLogCounts().map(({ nodeId, count }) => (
          <option key={nodeId} value={nodeId}>
            Node {nodeId} ({count})
          </option>
        ))}
      </select>
    </div>
  );
});

LogsFilter.displayName = 'LogsFilter';
