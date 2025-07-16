// hooks/useWorkflowPolling.ts
import useSWR from 'swr';
import { getWorflow } from '@/app/lib/Workflow/workflow';
import { SaveWorkflowResult, WorkflowExecutionResult } from '../types/types';

function calculateProgress(workflow: WorkflowExecutionResult): number {
  if (workflow.status === 'success') return 100;
  if (workflow.status === 'error') return 0;

  const totalNodes = workflow.numberOfNodes;
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
      console.log('🔄 Polling workflow:', workflowId, new Date().toLocaleTimeString());
      
      const result: SaveWorkflowResult = await getWorflow(workflowId!);

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch workflow');
      }

      try {
        const workflowData = JSON.parse(result.data) as WorkflowExecutionResult;
        console.log('📊 Status:', workflowData.status, 'Progress:', calculateProgress(workflowData) + '%');

        console.log("DATA : ", workflowData);
        return workflowData;
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        throw new Error('Invalid workflow data format');
      }
    },

    {
      // 🎯 Fonction qui reçoit data en paramètre (pas de conflit de scope)
      refreshInterval: (currentData: WorkflowExecutionResult | undefined) => {
        return shouldPoll && (!currentData || currentData.status === 'running') ? 250 : 0;
      },
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 0,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  );

  const isRunning = data?.status === 'running';
  const isCompleted = data?.status === 'success';
  const isFailed = data?.status === 'error';
  const isFinished = isCompleted || isFailed;

  return {
    workflowStatus: data,
    isLoading,
    error,
    mutate,
    isRunning,
    isCompleted,
    isFailed,
    isFinished,
    progress: data ? calculateProgress(data) : 0,
    stopPolling: () => mutate(data, false)
  };
}
