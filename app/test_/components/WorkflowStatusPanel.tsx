import { memo } from 'react';
import { Panel } from '@xyflow/react';
import { MdExpandMore, MdExpandLess } from "react-icons/md";
import { StatusPanelProps } from '@/app/lib/types/types';
import { getBorderColor, formatDuration } from '@/app/lib/utils/workflow-utils';
import { StatusIndicator } from './StatusIndicator';
import { ProgressBar } from './ProgressBar';
import { WorkflowMetrics } from './WorkflowMetrics';
import { LogsFilter } from './LogsFilter';
import { LogsList } from './LogsList';

export const WorkflowStatusPanel = memo<StatusPanelProps>(({ 
  workflowStatus, 
  error, 
  isExpanded, 
  setIsExpanded, 
  activeTab, 
  setActiveTab, 
  logFilter, 
  setLogFilter, 
  shouldPoll, 
  isCompleted, 
  isFailed, 
  progress,
  filteredLogs,
  availableNodes 
}) => (
  <Panel position="top-right">
    {workflowStatus && (
      <div className={`
        bg-gradient-to-br from-zinc-900 to-zinc-800 
        rounded-xl border-2 ${getBorderColor(workflowStatus.status)}
        text-white shadow-xl transition-all duration-300 
        hover:shadow-2xl hover:brightness-110
        ${isExpanded ? 'w-[700px]' : 'w-80'}
      `}>
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg">Workflow Status</h3>
            <div className="flex items-center gap-3">
              <StatusIndicator status={workflowStatus.status} />
              {workflowStatus.logs && workflowStatus.logs.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">
                    {workflowStatus.logs.length + (workflowStatus.nodes?.reduce((acc, node) => acc + (node.logs?.length || 0), 0) || 0)} logs
                  </span>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-zinc-700/50 text-xs"
                    title={isExpanded ? 'Collapse details' : 'View execution logs and details'}
                  >
                    {isExpanded ? (
                      <>
                        <MdExpandLess size={14} />
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <MdExpandMore size={14} />
                        <span>Details</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Workflow ID */}
          <div className="mb-4 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
            <div className="text-xs text-zinc-400 uppercase tracking-wide mb-1">Workflow ID</div>
            <div className="text-sm text-zinc-300 font-mono break-all">
              {workflowStatus.workflowId.slice(0, 8)}...{workflowStatus.workflowId.slice(-8)}
            </div>
          </div>

          {/* Progress Bar */}
          <ProgressBar progress={progress} />

          {/* Duration */}
          <div className="mb-4 p-3 bg-zinc-800/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Duration</span>
              <span className="text-sm text-zinc-300 font-mono">
                {formatDuration(workflowStatus.durationMs)}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {workflowStatus.error && (
            <div className="mb-4 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="text-xs text-red-400 uppercase tracking-wide">Error Details</div>
              </div>
              <div className="text-sm text-zinc-300 break-words">{workflowStatus.error}</div>
            </div>
          )}

          {/* Status Footer */}
          <div className="pt-3 border-t border-zinc-700">
            {shouldPoll && (
              <div className="flex items-center gap-2 text-sm">
                <div className="relative">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75"></div>
                </div>
                <span className="text-zinc-300">Live monitoring active</span>
              </div>
            )}

            {!shouldPoll && (isCompleted || isFailed) && (
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className={`${isCompleted ? 'text-green-400' : 'text-red-400'}`}>
                  {isCompleted ? 'Workflow completed successfully' : 'Workflow execution failed'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && workflowStatus.logs && workflowStatus.logs.length > 0 && (
          <div className="border-t border-zinc-700 bg-zinc-900/50">
            {/* Tab Navigation */}
            <div className="flex border-b border-zinc-700">
              <button
                onClick={() => setActiveTab('status')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'status'
                  ? 'text-white border-b-2 border-blue-400 bg-zinc-800/50'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
                  }`}
              >
                Summary
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'logs'
                  ? 'text-white border-b-2 border-blue-400 bg-zinc-800/50'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
                  }`}
              >
                Logs ({workflowStatus.logs.length + (workflowStatus.nodes?.reduce((acc, node) => acc + (node.logs?.length || 0), 0) || 0)})
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-4 max-h-96 overflow-y-auto tab-content-container">
              {activeTab === 'status' && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-zinc-300 mb-2">Execution Summary</h4>
                  <WorkflowMetrics workflowStatus={workflowStatus} />
                </div>
              )}

              {activeTab === 'logs' && (
                <div className="space-y-3">
                  <LogsFilter
                    logFilter={logFilter}
                    setLogFilter={setLogFilter}
                    filteredLogs={filteredLogs}
                    workflowStatus={workflowStatus}
                    availableNodes={availableNodes}
                  />
                  <LogsList filteredLogs={filteredLogs} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )}

    {error && (
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl border-2 border-red-400 shadow-red-400/20 text-white shadow-xl mt-3 w-80">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span className="font-medium text-sm text-zinc-300">Connection Error</span>
          </div>
          <div className="text-sm text-zinc-300 break-words">{error.message}</div>
        </div>
      </div>
    )}
  </Panel>
));

WorkflowStatusPanel.displayName = 'WorkflowStatusPanel';