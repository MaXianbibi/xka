// hooks/useWorkflowPolling.ts
import useSWR from 'swr';
import { getWorflow } from '@/app/lib/Workflow/workflow';
import { SaveWorkflowResult, NodeResponse, WorkflowExecutionResult } from '../types/types';

function calculateProgress(workflow: WorkflowExecutionResult): number {
  if (workflow.status === 'success') return 100;
  if (workflow.status === 'error') return 0;

  const totalNodes = workflow.nodes.length;
  if (totalNodes === 0) return 0;

  const completedNodes = workflow.nodes.filter(
    node => node.status === 'success' || node.status === 'error'
  ).length;

  return Math.round((completedNodes / totalNodes) * 100);
}

export function useWorkflowPolling(workflowId: string | null, shouldPoll: boolean = false) {
  const { data, error, isLoading, mutate } = useSWR<WorkflowExecutionResult>(
    workflowId ? `workflow-${workflowId}` : null,

    async () => {
      const result: SaveWorkflowResult = await getWorflow(workflowId!);

      if (!result.success) {
        throw new Error(result.error);
      }

      const workflowData = JSON.parse(result.data) as WorkflowExecutionResult;
      return workflowData;
    },




    {
      refreshInterval: (data: WorkflowExecutionResult | undefined) => {
        return shouldPoll && data?.status === 'running' ? 500 : 0;
      },
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    workflowStatus: data,
    isLoading,
    error,
    mutate,
    isRunning: data?.status === 'running',
    isCompleted: data?.status === 'success',
    isFailed: data?.status === 'error',
    isFinished: data?.status === 'success' || data?.status === 'error',
    progress: data ? calculateProgress(data) : 0
  };
}
