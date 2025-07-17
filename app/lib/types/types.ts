import { ReactNode } from "react";

export interface WorkflowNode {
  id: string;
  type: string | null;
  data: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type: string | null;
}

export interface SaveWorkflowResult {
  success: boolean;
  data?: any;
  error?: string;
  id?: string; // 🎯 ID optionnel mais présent si success = true
}


export interface NodeResponse {
  nodeId: string;
  nodeType: string;
  status: 'success' | 'error' | 'skipped';  
  timestamp: number;     // Unix timestamp
  durationMs: number;    // Durée en millisecondes
  result?: any;          // Résultat brut (interface{} → any)
  error?: string;        // *string → string optionnel
  logs?: string[];       // []string optionnel
  meta?: any;            // interface{} → any optionnel
}

// 🎯 Interface pour le résultat global du workflow
export interface WorkflowExecutionResult {
  workflowId: string;
  status: 'success' | 'error' | 'running' | 'skipped';  // 🎯 Union type
  startedAt: number;     // Unix timestamp
  endedAt: number;       // Unix timestamp
  durationMs: number;    // Durée en millisecondes
  nodes: NodeResponse[]; // []NodeResponse → NodeResponse[]
  logs: string[];        // GlobalLogs → logs (renommé)
  error?: string;        // *string → string optionnel
  meta?: Record<string, any>;  // map[string]interface{} → Record<string, any>
  numberOfNodes: number; // Nombre total de nodes dans le workflow
}



export interface BaseNodeData {
  executionStatus?: 'pending' | 'running' | 'success' | 'error';
  executionDuration?: number;
  [key: string]: any;
}

export interface LogItem {
  type: 'workflow' | 'node';
  nodeId?: string;
  log: string;
  index: number;
}

export interface WorkflowNodeResult {
  nodeId: string;
  logs?: string[];
  status?: string;
  durationMs?: number;
}

export interface ControlPanelProps {
  onRunWorkflow: () => void;
  onStopPolling: () => void;
  onRefresh: () => void;
  onClearWorkflow: () => void;
  isRunning: boolean;
  isLoading: boolean;
  shouldPoll: boolean;
  workflowId: string | null;
}

export interface StatusPanelProps {
  workflowStatus: WorkflowExecutionResult | null | undefined;
  error: Error | null;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  activeTab: 'status' | 'logs';
  setActiveTab: (tab: 'status' | 'logs') => void;
  logFilter: string;
  setLogFilter: (filter: string) => void;
  shouldPoll: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  progress: number;
  filteredLogs: LogItem[];
  availableNodes: WorkflowNodeResult[];
  isNodePaletteOpen?: boolean;
}

export interface WorkflowControlsProps {
  onRunWorkflow: () => void;
  onStopPolling: () => void;
  onClearWorkflow: () => void;
  isRunning: boolean;
  isLoading: boolean;
  shouldPoll: boolean;
  workflowId: string | null;
}



export interface WorkflowNodeWrapperProps {
  data: any;
  children: ReactNode;
}

export interface ExecutionData {
  nodeId?: string;
  nodeType?: string;
  status?: 'success' | 'error' | 'running' | 'pending';
  timestamp?: number;
  durationMs?: number;
  result?: any;
  logs?: string[];
  meta?: any;
}