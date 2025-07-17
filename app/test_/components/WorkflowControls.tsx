import { memo } from 'react';
import { Panel } from '@xyflow/react';
import { MdScience, MdStop, MdRefresh } from "react-icons/md";
import { WorkflowControlsProps } from '@/app/lib/types/types';

export const WorkflowControls = memo<WorkflowControlsProps>(({ 
  onRunWorkflow, 
  onStopPolling, 
  onRefresh, 
  onClearWorkflow, 
  isRunning, 
  isLoading, 
  shouldPoll, 
  workflowId 
}) => (
  <Panel position="bottom-center">
    <div className="flex items-center gap-4 bg-gray-800 p-4 rounded-lg shadow-lg">
      <button
        onClick={onRunWorkflow}
        disabled={isRunning || isLoading}
        className={`
          font-medium py-2 px-4 rounded-lg shadow transition duration-200 
          flex items-center justify-center gap-2
          ${isRunning || isLoading
            ? 'bg-gray-500 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }
        `}
      >
        {isLoading ? 'Running...' : 'Run Workflow'}
        <MdScience size={20} />
      </button>

      {shouldPoll && (
        <button
          onClick={onStopPolling}
          className="bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-4 rounded-lg shadow transition duration-200 flex items-center gap-2"
        >
          Stop Polling
          <MdStop size={20} />
        </button>
      )}

      {workflowId && (
        <button
          onClick={onRefresh}
          className="bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-lg shadow transition duration-200 flex items-center gap-2"
        >
          <MdRefresh size={20} />
        </button>
      )}

      {workflowId && !shouldPoll && (
        <button
          onClick={onClearWorkflow}
          className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg shadow transition duration-200"
        >
          Clear
        </button>
      )}
    </div>
  </Panel>
));

WorkflowControls.displayName = 'WorkflowControls';