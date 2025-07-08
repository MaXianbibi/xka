package runner

import (
	"XKA/internal/shared/builder"
	"XKA/pkg/RedisClient"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"
)

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
	NumbreOfNodes int                 `json:"numberOfNodes"` 
}

// NodeExecutor interface pour les exécuteurs de nodes
type NodeExecutor interface {
	Execute(node *builder.Node) (*NodeResponse, error)
}

// ExecuteFunc représente la fonction métier d'un exécuteur
type ExecuteFunc func(node *builder.Node, resp *NodeResponse) error

// BaseExecutor est un wrapper qui gère toutes les tâches communes
type BaseExecutor struct {
	executeFunc ExecuteFunc
}

// NewBaseExecutor crée un nouveau BaseExecutor avec la fonction métier
func NewBaseExecutor(executeFunc ExecuteFunc) *BaseExecutor {
	return &BaseExecutor{
		executeFunc: executeFunc,
	}
}

// Execute implémente NodeExecutor et gère toute la logique commune
func (be *BaseExecutor) Execute(node *builder.Node) (*NodeResponse, error) {
	if node == nil {
		return nil, fmt.Errorf("node is nil")
	}

	start := time.Now()

	// Initialisation de la réponse avec les valeurs communes
	resp := &NodeResponse{
		NodeID:    node.ID,
		NodeType:  node.Type,
		Status:    "running",
		Timestamp: start.Unix(),
		Logs:      []string{fmt.Sprintf("Executing %s node: %s", node.Type, node.ID)},
		Meta:      make(map[string]interface{}),
		Result:    make(map[string]interface{}),
	}

	// Exécution de la logique métier
	err := be.executeFunc(node, resp)

	// Gestion automatique des erreurs
	if err != nil {
		fullMsg := fmt.Sprintf("Node %s: %s", resp.NodeID, err.Error())
		resp.Status = "error"
		resp.Error = &fullMsg
		resp.DurationMs = time.Since(start).Milliseconds()
		resp.Logs = append(resp.Logs, "ERROR: "+err.Error())
		return resp, fmt.Errorf("%s", fullMsg)
	}

	// Finalisation automatique en cas de succès
	if resp.Status == "running" {
		resp.Status = "success"
	}
	resp.DurationMs = time.Since(start).Milliseconds()

	return resp, nil
}

// Fonction helper pour ajouter des logs facilement
func (resp *NodeResponse) AddLog(format string, args ...interface{}) {
	resp.Logs = append(resp.Logs, fmt.Sprintf(format, args...))
}

// Fonction helper pour définir le résultat
func (resp *NodeResponse) SetResult(key string, value interface{}) {
	if resp.Result == nil {
		resp.Result = make(map[string]interface{})
	}
	if resultMap, ok := resp.Result.(map[string]interface{}); ok {
		resultMap[key] = value
	} else {
		// Si Result n'est pas une map, on la remplace
		resp.Result = map[string]interface{}{key: value}
	}
}

// Fonction helper pour définir les métadonnées
func (resp *NodeResponse) SetMeta(key string, value interface{}) {
	if resp.Meta == nil {
		resp.Meta = make(map[string]interface{})
	}
	if metaMap, ok := resp.Meta.(map[string]interface{}); ok {
		metaMap[key] = value
	} else {
		// Si Meta n'est pas une map, on la remplace
		resp.Meta = map[string]interface{}{key: value}
	}
}

// WorkflowRunner gère l'exécution des workflows
type WorkflowRunner struct {
	executors map[string]NodeExecutor
}

// NewWorkflowRunner crée une nouvelle instance du runner
func NewWorkflowRunner() *WorkflowRunner {
	runner := &WorkflowRunner{
		executors: make(map[string]NodeExecutor),
	}

	// Enregistrer les exécuteurs simplifiés
	runner.RegisterExecutor("manualStartNode", NewBaseExecutor(executeManualStart))
	runner.RegisterExecutor("httpRequestNode", NewBaseExecutor(executeHttpRequest))
	runner.RegisterExecutor("waitingNode", NewBaseExecutor(executeWaiting))

	return runner
}

// RegisterExecutor enregistre un exécuteur pour un type de node
func (wr *WorkflowRunner) RegisterExecutor(nodeType string, executor NodeExecutor) {
	wr.executors[nodeType] = executor
}

// executeManualStart - logique métier simplifiée pour le démarrage manuel
func executeManualStart(node *builder.Node, resp *NodeResponse) error {
	resp.AddLog("Starting workflow from node: %s", node.ID)
	resp.SetResult("message", "Workflow started successfully")
	return nil
}

// executeHttpRequest - logique métier simplifiée pour les requêtes HTTP
func executeHttpRequest(node *builder.Node, resp *NodeResponse) error {
	// Validation des paramètres
	url, urlOk := node.Data["url"].(string)
	method, methodOk := node.Data["method"].(string)
	if !urlOk || !methodOk || url == "" || method == "" {
		return fmt.Errorf("missing URL or method")
	}

	// Configuration du client HTTP
	client := &http.Client{Timeout: 30 * time.Second}

	// Création de la requête
	req, err := http.NewRequest(method, url, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %v", err)
	}

	// Exécution de la requête
	httpResp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("HTTP request failed: %v", err)
	}
	defer httpResp.Body.Close()

	// Lecture de la réponse
	body, err := io.ReadAll(httpResp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response: %v", err)
	}

	// Vérification du status code
	if httpResp.StatusCode >= 400 {
		return fmt.Errorf("HTTP %d: %s", httpResp.StatusCode, string(body))
	}

	// Configuration des résultats
	resp.SetResult("statusCode", httpResp.StatusCode)
	resp.SetResult("body", string(body))
	resp.SetResult("headers", httpResp.Header)
	resp.SetResult("url", url)
	resp.SetResult("method", method)

	resp.SetMeta("contentLength", len(body))
	resp.SetMeta("contentType", httpResp.Header.Get("Content-Type"))

	resp.AddLog("HTTP request completed (status: %d)", httpResp.StatusCode)

	return nil
}

// executeWaiting - logique métier simplifiée pour l'attente
func executeWaiting(node *builder.Node, resp *NodeResponse) error {
	// Extraction et validation de la durée
	durationVal, ok := node.Data["duration"]
	if !ok {
		return fmt.Errorf("missing 'duration' parameter")
	}

	durationStr, ok := durationVal.(string)
	if !ok {
		return fmt.Errorf("duration must be a string")
	}

	waitMs, err := strconv.ParseInt(durationStr, 10, 64)
	if err != nil || waitMs <= 0 {
		return fmt.Errorf("invalid duration value")
	}

	// Attente
	resp.AddLog("Waiting %dms...", waitMs)
	time.Sleep(time.Duration(waitMs) * time.Millisecond)

	// Configuration des résultats
	resp.SetResult("waitedMs", waitMs)
	resp.SetResult("message", fmt.Sprintf("Waited %dms", waitMs))
	resp.AddLog("Wait completed")

	return nil
}

func buildWorkflowExecutionResult(wf *builder.Workflow, runID string, status string, errorMsg string) *WorkflowExecutionResult {
	result := &WorkflowExecutionResult{
		WorkflowID: wf.ID,
		Status:     status,
		StartedAt:  time.Now().Unix(),
		Nodes:      []NodeResponse{},
		GlobalLogs: []string{},
		Meta:       make(map[string]interface{}),
		NumbreOfNodes: len(wf.NodeMap),
	}
	if errorMsg != "" {
		result.Error = &errorMsg
		result.Status = "error"
		result.EndedAt = time.Now().Unix()
		result.DurationMs = time.Since(time.Unix(result.StartedAt, 0)).Milliseconds()
	} else {
		result.EndedAt = time.Now().Unix()
		result.DurationMs = time.Since(time.Unix(result.StartedAt, 0)).Milliseconds()
	}
	return result
}

// Run exécute un workflow avec une seule node de départ et retourne les résultats
func (wr *WorkflowRunner) Run(wf *builder.Workflow, runID string) (*WorkflowExecutionResult, error) {
	startTime := time.Now()

	if wf == nil {
		errorMsg := "workflow is nil"
		result := buildWorkflowExecutionResult(wf, runID, "error", errorMsg)
		return result, fmt.Errorf("%s", errorMsg)
	}
	if len(wf.StartNodeIDs) == 0 {
		errorMsg := "workflow has no start nodes"
		result := buildWorkflowExecutionResult(wf, runID, "error", errorMsg)
		return result, fmt.Errorf("%s", errorMsg)
	}

	result := buildWorkflowExecutionResult(wf, runID, "running", "")

	firstNodeID := wf.StartNodeIDs[0]
	result.GlobalLogs = append(result.GlobalLogs, fmt.Sprintf("Starting workflow execution with node: %s", firstNodeID))

	// Créer une queue avec la première node
	queue := []string{firstNodeID}

	// Traiter la queue une node à la fois
	for len(queue) > 0 {
		// Prendre la première node de la queue
		currentNodeID := queue[0]
		queue = queue[1:] // Retirer la première node

		node := wf.NodeMap[currentNodeID]
		if node == nil {
			errorMsg := fmt.Sprintf("node with ID %s not found", currentNodeID)
			result.Status = "error"
			result.Error = &errorMsg
			result.EndedAt = time.Now().Unix()
			result.DurationMs = time.Since(startTime).Milliseconds()
			return result, fmt.Errorf("%s", errorMsg)
		}

		nodeResponse, err := wr.executeNode(node)
		if err != nil {
			// Ajouter la réponse de la node même en cas d'erreur
			if nodeResponse != nil {
				result.Nodes = append(result.Nodes, *nodeResponse)
			}

			errorMsg := fmt.Sprintf("node %s execution failed: %v", currentNodeID, err)
			result.Status = "error"
			result.Error = &errorMsg
			result.EndedAt = time.Now().Unix()
			result.DurationMs = time.Since(startTime).Milliseconds()
			result.GlobalLogs = append(result.GlobalLogs, errorMsg)
			return result, fmt.Errorf("%s", errorMsg)
		}

		// Ajouter la réponse de la node aux résultats
		if nodeResponse != nil {
			result.Nodes = append(result.Nodes, *nodeResponse)
		}

		result.publishResult()

		// Ajouter les nodes suivantes à la queue
		queue = append(queue, node.NextIDs...)
	}
	// Finaliser les résultats
	result.Status = "success"
	result.EndedAt = time.Now().Unix()
	result.DurationMs = time.Since(startTime).Milliseconds()
	result.GlobalLogs = append(result.GlobalLogs, fmt.Sprintf("Workflow execution completed successfully in %dms", result.DurationMs))

	return result, nil
}


func (wr *WorkflowExecutionResult) publishResult() error {
	client := RedisClient.GetClient()
	if client == nil {
		return fmt.Errorf("redis client not initialized")
	}
	wrJson, err := json.Marshal(wr)

	if err != nil {
		return fmt.Errorf("failed to marshal workflow result: %v", err)
	}
	
	list_name := fmt.Sprintf("workflow:%s:results", wr.WorkflowID)
	_, err = client.LPush(list_name, string(wrJson))
	
	if err != nil {
		return fmt.Errorf("failed to publish workflow result to Redis: %v", err)
	}
	err = client.SetExpire(list_name, 30*time.Minute)
	
	if err != nil {
		return fmt.Errorf("failed to set expiration for Redis list: %v", err)
	}
	// client.LTrim(list_name, 0, 49)
	// client.Expire(list_name, 24*time.Hour)
	
	return nil
}



// executeNode exécute une node individuelle et retourne sa réponse
func (wr *WorkflowRunner) executeNode(node *builder.Node) (*NodeResponse, error) {
	if node == nil {
		return nil, fmt.Errorf("node is nil")
	}
	
	executor, exists := wr.executors[node.Type]
	if !exists {
		return nil, fmt.Errorf("no executor found for node type: %s", node.Type)
	}

	return executor.Execute(node)
}

// Fonction helper pour utilisation simple - mise à jour pour retourner les résultats
func Run(wf *builder.Workflow, runID string) (*WorkflowExecutionResult, error) {
	runner := NewWorkflowRunner()
	result, err := runner.Run(wf, runID)
	result.publishResult()
	return result, err
}
