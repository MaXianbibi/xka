package runner

import (
	"fmt"
	"XKA/internal/shared/builder"
)

// NodeExecutor interface pour les exécuteurs de nodes
type NodeExecutor interface {
	Execute(node *builder.Node) error
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
	
	// Enregistrer les exécuteurs par défaut
	runner.RegisterExecutor("manualStartNode", &ManualStartExecutor{})
	runner.RegisterExecutor("httpRequestNode", &HttpExecutor{})
	
	return runner
}

// RegisterExecutor enregistre un exécuteur pour un type de node
func (wr *WorkflowRunner) RegisterExecutor(nodeType string, executor NodeExecutor) {
	wr.executors[nodeType] = executor
}

// Run exécute un workflow avec une seule node de départ
func (wr *WorkflowRunner) Run(wf *builder.Workflow, runID string) error {
	if wf == nil {
		return fmt.Errorf("workflow is nil")
	}
	
	if len(wf.StartNodeIDs) == 0 {
		return fmt.Errorf("no start nodes found")
	}
	
	// Prendre seulement la première node de départ
	firstNodeID := wf.StartNodeIDs[0]
	
	// Créer une queue avec la première node
	queue := []string{firstNodeID}
	
	// Traiter la queue une node à la fois
	for len(queue) > 0 {
		// Prendre la première node de la queue
		currentNodeID := queue[0]
		queue = queue[1:] // Retirer la première node
		
		node := wf.NodeMap[currentNodeID]
		if node == nil {
			return fmt.Errorf("node with ID %s not found", currentNodeID)
		}


		if err := wr.executeNode(node); err != nil {
			return fmt.Errorf("node %s execution failed: %w", currentNodeID, err)
		}
		
		// Ajouter les nodes suivantes à la queue
		queue = append(queue, node.NextIDs...)
	}
	
	return nil
}

// executeNode exécute une node individuelle
func (wr *WorkflowRunner) executeNode(node *builder.Node) error {
	if node == nil {
		return fmt.Errorf("node is nil")
	}
	
	executor, exists := wr.executors[node.Type]

	if !exists {
		return fmt.Errorf("no executor found for node type: %s", node.Type)
	}
	
	return executor.Execute(node)
}

// Implémentations des exécuteurs par défaut

// ManualStartExecutor exécute les nodes de démarrage manuel
type ManualStartExecutor struct{}

func (e *ManualStartExecutor) Execute(node *builder.Node) error {
	fmt.Printf("Starting workflow from node: %s\n", node.ID)
	return nil
}

// HttpExecutor exécute les nodes HTTP
type HttpExecutor struct{}

func (e *HttpExecutor) Execute(node *builder.Node) error {
	fmt.Printf("Executing HTTP node: %s\n", node.ID)
	// TODO: Implémenter l'appel HTTP réel
	return nil
}

// Fonction helper pour utilisation simple
func Run(wf *builder.Workflow, runID string) error {
	runner := NewWorkflowRunner()
	return runner.Run(wf, runID)
}