package types

type NodeResponse struct {
	NodeID     string `json:"nodeId"`
	NodeType   string `json:"nodeType"`
	Status     string `json:"status"`     // "success", "error", "skipped"
	Timestamp  int64  `json:"timestamp"`  // Heure de début d'exécution (Unix)
	DurationMs int64  `json:"durationMs"` // Durée en millisecondes

	Result interface{} `json:"result"` // Résultat brut
	Error  *string     `json:"error,omitempty"`
	Logs   []string    `json:"logs,omitempty"`
	Meta   interface{} `json:"meta,omitempty"`
}

// WorkflowExecutionResult structure pour capturer le résultat global du workflow
type WorkflowExecutionResult struct {
	WorkflowID string                 `json:"workflowId"`
	Status     string                 `json:"status"` // "success", "error", "running", "skipped"
	StartedAt  int64                  `json:"startedAt"`
	EndedAt    int64                  `json:"endedAt"`
	DurationMs int64                  `json:"durationMs"`
	Nodes      []NodeResponse         `json:"nodes"`
	GlobalLogs []string               `json:"logs"`
	Error      *string                `json:"error,omitempty"`
	Meta       map[string]interface{} `json:"meta,omitempty"`
}