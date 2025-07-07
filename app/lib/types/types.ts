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
