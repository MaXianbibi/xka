import { useCallback, useState, useEffect } from 'react';
import { ReactFlowInstance } from '@xyflow/react';
import { saveWorkflow } from '@/app/lib/Workflow/workflow';

export function useWorkflowExecution() {
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [shouldPoll, setShouldPoll] = useState(false);

  const handleRunWorkflow = useCallback(async (rfInstance: ReactFlowInstance | null) => {
    if (!rfInstance) {
      console.error("React Flow instance is not initialized");
      return;
    }

    try {
      const workflowData = rfInstance.toObject();
      const formData = new FormData();
      formData.append('flowData', JSON.stringify(workflowData));

      const result = await saveWorkflow(formData);

      if (!result.success) {
        console.error(`Error saving workflow: ${result.error}`);
        return;
      }

      setWorkflowId(result.id!);
      setShouldPoll(true);
      console.log('✅ Workflow saved with ID:', result.id);
    } catch (error) {
      console.error('Error running workflow:', error);
    }
  }, []);

  const handleStopPolling = useCallback(() => setShouldPoll(false), []);
  
  const handleClearWorkflow = useCallback(() => {
    setShouldPoll(false);
    setWorkflowId(null);
  }, []);

  return {
    workflowId,
    shouldPoll,
    setShouldPoll,
    handleRunWorkflow,
    handleStopPolling,
    handleClearWorkflow
  };
}