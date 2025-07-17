import { memo, useMemo, useCallback } from 'react';
import { Panel } from '@xyflow/react';
import { MdExpandMore, MdExpandLess } from "react-icons/md";
import { StatusPanelProps, WorkflowExecutionResult, LogItem, WorkflowNodeResult } from '@/app/lib/types/types';
import { getBorderColor, formatDuration } from '@/app/lib/utils/workflow-utils';
import { StatusIndicator } from './StatusIndicator';
import { ProgressBar } from './ProgressBar';
import { WorkflowMetrics } from './WorkflowMetrics';
import { LogsFilter } from './LogsFilter';
import { LogsList } from './LogsList';

// Interface pour ExpandedDetails
interface ExpandedDetailsProps {
  activeTab: 'status' | 'logs';
  setActiveTab: (tab: 'status' | 'logs') => void;
  logFilter: string;
  setLogFilter: (filter: string) => void;
  workflowStatus: WorkflowExecutionResult;
  filteredLogs: LogItem[];
  availableNodes: WorkflowNodeResult[];
}

// Constantes de style
const PANEL_STYLE = "bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:brightness-110";
const HEADER_STYLE = "flex items-center justify-between mb-4";
const TITLE_STYLE = "text-white font-semibold text-lg";
const STATUS_INDICATOR_STYLE = "flex items-center gap-3";
const LOG_COUNT_STYLE = "flex items-center gap-2";
const LOG_COUNT_TEXT = "text-xs text-zinc-500";
const TOGGLE_BUTTON_STYLE = "flex items-center gap-1 text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-zinc-700/50 text-xs";
const WORKFLOW_ID_STYLE = "mb-4 p-3 bg-zinc-800 rounded-lg border border-zinc-700";
const WORKFLOW_ID_LABEL = "text-xs text-zinc-400 uppercase tracking-wide mb-1";
const WORKFLOW_ID_VALUE = "text-sm text-zinc-300 font-mono break-all";
const DURATION_STYLE = "mb-4 p-3 bg-zinc-800/50 rounded-lg";
const DURATION_LABEL = "text-sm text-zinc-400";
const DURATION_VALUE = "text-sm text-zinc-300 font-mono";
const ERROR_STYLE = "mb-4 p-3 bg-zinc-800 rounded-lg border border-zinc-700";
const ERROR_HEADER = "flex items-center gap-2 mb-2";
const ERROR_INDICATOR = "w-3 h-3 bg-red-400 rounded-full";
const ERROR_TITLE = "text-xs text-red-400 uppercase tracking-wide";
const ERROR_MESSAGE = "text-sm text-zinc-300 break-words";
const STATUS_FOOTER = "pt-3 border-t border-zinc-700";
const LIVE_INDICATOR = "relative";
const LIVE_DOT = "w-2 h-2 bg-green-400 rounded-full animate-pulse";
const LIVE_PULSE = "absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75";
const TAB_NAV = "flex border-b border-zinc-700";
const TAB_BUTTON = "px-4 py-2 text-sm font-medium transition-colors";
const ACTIVE_TAB = "text-white border-b-2 border-blue-400 bg-zinc-800/50";
const INACTIVE_TAB = "text-zinc-400 hover:text-white hover:bg-zinc-800/30";
const TAB_CONTENT = "p-4 max-h-96 overflow-y-auto tab-content-container";
const ERROR_PANEL_STYLE = "bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl border-2 border-red-400 shadow-red-400/20 text-white shadow-xl mt-3 w-80";
const ERROR_PANEL_HEADER = "flex items-center gap-2 mb-2";
const ERROR_PANEL_TITLE = "font-medium text-sm text-zinc-300";

// Composant optimisé
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
  availableNodes,
  isNodePaletteOpen = true
}) => {
  // Calculs mémoisés avec vérifications null
  const totalLogs = useMemo(() => {
    if (!workflowStatus) return 0;
    const workflowLogs = workflowStatus.logs?.length || 0;
    const nodeLogs = workflowStatus.nodes?.reduce((acc, node) => acc + (node.logs?.length || 0), 0) || 0;
    return workflowLogs + nodeLogs;
  }, [workflowStatus?.logs, workflowStatus?.nodes]);

  const workflowId = useMemo(() => {
    if (!workflowStatus?.workflowId) return '';
    return `${workflowStatus.workflowId.slice(0, 8)}...${workflowStatus.workflowId.slice(-8)}`;
  }, [workflowStatus?.workflowId]);

  const borderColor = useMemo(() => {
    if (!workflowStatus?.status) return 'border-zinc-600/50';
    return getBorderColor(workflowStatus.status);
  }, [workflowStatus?.status]);

  const duration = useMemo(() => {
    if (!workflowStatus?.durationMs) return '0ms';
    return formatDuration(workflowStatus.durationMs);
  }, [workflowStatus?.durationMs]);

  const statusText = useMemo(() => {
    if (isCompleted) return 'Workflow completed successfully';
    if (isFailed) return 'Workflow execution failed';
    return shouldPoll ? 'Live monitoring active' : '';
  }, [isCompleted, isFailed, shouldPoll]);

  const statusColor = useMemo(() => {
    if (isCompleted) return 'text-green-400';
    if (isFailed) return 'text-red-400';
    return 'text-zinc-300';
  }, [isCompleted, isFailed]);



  // Calcul de la marge selon l'état du NodePalette
  const panelMargin = useMemo(() => {
    // Si le NodePalette est ouvert : décaler de 340px (largeur du panel + marge)
    // Si le NodePalette est fermé : décaler de 80px (largeur du bouton + marge)
    return isNodePaletteOpen ? '340px' : '80px';
  }, [isNodePaletteOpen]);

  // Callbacks mémoisés
  const handleToggleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded, setIsExpanded]);

  const handleSetActiveTab = useCallback((tab: 'status' | 'logs') => {
    setActiveTab(tab);
  }, [setActiveTab]);

  return (
    <Panel position="top-right" style={{ marginRight: panelMargin }}>
      {workflowStatus && (
        <div className={`${PANEL_STYLE} border-2 ${borderColor} ${isExpanded ? 'w-[700px]' : 'w-80'}`}>
          <div className="p-4">
            {/* Header */}
            <div className={HEADER_STYLE}>
              <h3 className={TITLE_STYLE}>Workflow Status</h3>
              <div className={STATUS_INDICATOR_STYLE}>
                <StatusIndicator status={workflowStatus.status === 'skipped' ? 'default' : workflowStatus.status as 'running' | 'success' | 'error' | 'default'} />
                {workflowStatus.logs && totalLogs > 0 && (
                  <div className={LOG_COUNT_STYLE}>
                    <span className={LOG_COUNT_TEXT}>{totalLogs} logs</span>
                    <button
                      onClick={handleToggleExpand}
                      className={TOGGLE_BUTTON_STYLE}
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
            <div className={WORKFLOW_ID_STYLE}>
              <div className={WORKFLOW_ID_LABEL}>Workflow ID</div>
              <div className={WORKFLOW_ID_VALUE}>{workflowId}</div>
            </div>

            {/* Progress Bar */}
            <ProgressBar progress={progress} />

            {/* Duration */}
            <div className={DURATION_STYLE}>
              <div className="flex items-center justify-between">
                <span className={DURATION_LABEL}>Duration</span>
                <span className={DURATION_VALUE}>{duration}</span>
              </div>
            </div>

            {/* Error Message */}
            {workflowStatus.error && (
              <div className={ERROR_STYLE}>
                <div className={ERROR_HEADER}>
                  <div className={ERROR_INDICATOR}></div>
                  <div className={ERROR_TITLE}>Error Details</div>
                </div>
                <div className={ERROR_MESSAGE}>{workflowStatus.error}</div>
              </div>
            )}

            {/* Status Footer */}
            <div className={STATUS_FOOTER}>
              {(shouldPoll || isCompleted || isFailed) && (
                <div className="flex items-center gap-2 text-sm">
                  <div className={LIVE_INDICATOR}>
                    <div className={LIVE_DOT}></div>
                    {shouldPoll && <div className={LIVE_PULSE}></div>}
                  </div>
                  <span className={statusColor}>{statusText}</span>
                </div>
              )}
            </div>
          </div>

          {/* Expanded Details */}
          {isExpanded && workflowStatus.logs && totalLogs > 0 && (
            <ExpandedDetails
              activeTab={activeTab}
              setActiveTab={handleSetActiveTab}
              logFilter={logFilter}
              setLogFilter={setLogFilter}
              workflowStatus={workflowStatus}
              filteredLogs={filteredLogs}
              availableNodes={availableNodes}
            />
          )}
        </div>
      )}

      {error && (
        <div className={ERROR_PANEL_STYLE}>
          <div className="p-4">
            <div className={ERROR_PANEL_HEADER}>
              <div className={ERROR_INDICATOR}></div>
              <span className={ERROR_PANEL_TITLE}>Connection Error</span>
            </div>
            <div className={ERROR_MESSAGE}>{error.message}</div>
          </div>
        </div>
      )}
    </Panel>
  );
});

// Composant enfant extrait pour une meilleure organisation
const ExpandedDetails = memo<ExpandedDetailsProps>(({
  activeTab,
  setActiveTab,
  logFilter,
  setLogFilter,
  workflowStatus,
  filteredLogs,
  availableNodes
}) => (
  <div className="border-t border-zinc-700 bg-zinc-900/50">
    <div className={TAB_NAV}>
      <button
        onClick={() => setActiveTab('status')}
        className={`${TAB_BUTTON} ${activeTab === 'status' ? ACTIVE_TAB : INACTIVE_TAB}`}
      >
        Summary
      </button>
      <button
        onClick={() => setActiveTab('logs')}
        className={`${TAB_BUTTON} ${activeTab === 'logs' ? ACTIVE_TAB : INACTIVE_TAB}`}
      >
        Logs ({workflowStatus.logs.length + (workflowStatus.nodes?.reduce((acc, node) => acc + (node.logs?.length || 0), 0) || 0)})
      </button>
    </div>

    <div className={TAB_CONTENT}>
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
));

WorkflowStatusPanel.displayName = 'WorkflowStatusPanel';
ExpandedDetails.displayName = 'ExpandedDetails';
