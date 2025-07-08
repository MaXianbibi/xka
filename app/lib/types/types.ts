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

