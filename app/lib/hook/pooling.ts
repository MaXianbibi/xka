// hooks/useWorkflowPolling.ts
import useSWR from 'swr';
import { getWorflow } from '@/app/lib/Workflow/workflow';
import { SaveWorkflowResult } from '../types/types';

interface WorkflowStatus {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  result?: any;
  error?: string;
}

export function useWorkflowPolling(workflowId: string | null, shouldPoll: boolean = false) {
  const { data, error, isLoading, mutate } = useSWR<WorkflowStatus>(
    // 🎯 Key - null désactive SWR
    shouldPoll && workflowId ? `workflow-${workflowId}` : null,
    
    // 🎯 Fetcher function
    async () => {


      const result : SaveWorkflowResult = await getWorflow(workflowId!);

      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    
    // 🎯 Configuration SWR
    {
      refreshInterval: shouldPoll ? 2000 : 0, // Poll toutes les 2 secondes
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 1000,
      
      // 🎯 Condition pour arrêter le polling
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      
      // 🎯 Arrêter le polling quand terminé
      onSuccess: (data) => {
        if (data.status === 'completed' || data.status === 'failed') {
          console.log('🎯 Workflow finished:', data.status);
          // Le polling s'arrêtera automatiquement via shouldPoll
        }
      },
      
      // 🎯 Gestion des erreurs
      onError: (error) => {
        console.error('❌ Polling error:', error);
      }
    }
  );

  return {
    workflowStatus: data,
    isLoading,
    error,
    mutate, // Pour forcer un refresh
    
    // 🎯 États dérivés
    isRunning: data?.status === 'running',
    isCompleted: data?.status === 'completed',
    isFailed: data?.status === 'failed',
    progress: data?.progress || 0
  };
}
