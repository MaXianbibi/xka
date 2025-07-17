import { useMemo } from 'react';
import { LogItem, WorkflowExecutionResult, WorkflowNodeResult } from '../types/types';

export function useWorkflowLogs(workflowStatus: WorkflowExecutionResult | null | undefined, logFilter: string) {
  const filteredLogs = useMemo((): LogItem[] => {
    if (!workflowStatus) return [];

    const allLogs: LogItem[] = [];

    if (workflowStatus.logs) {
      workflowStatus.logs.forEach((log: string, index: number) => {
        allLogs.push({ type: 'workflow', log, index });
      });
    }

    if (workflowStatus.nodes) {
      workflowStatus.nodes.forEach((node: WorkflowNodeResult) => {
        if (node.logs) {
          node.logs.forEach((log: string, logIndex: number) => {
            allLogs.push({ type: 'node', nodeId: node.nodeId, log, index: logIndex });
          });
        }
      });
    }

    if (logFilter === 'all') return allLogs;
    if (logFilter === 'workflow') return allLogs.filter(item => item.type === 'workflow');
    return allLogs.filter(item => item.nodeId === logFilter);
  }, [workflowStatus, logFilter]);

  const availableNodes = useMemo((): WorkflowNodeResult[] => {
    if (!workflowStatus?.nodes) return [];
    return workflowStatus.nodes.filter((node: WorkflowNodeResult) => node.logs && node.logs.length > 0);
  }, [workflowStatus?.nodes]);

  return { filteredLogs, availableNodes };
}