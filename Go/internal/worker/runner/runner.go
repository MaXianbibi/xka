package runner

import (
	"context"
	"fmt"
	"sync"

	"XKA/internal/shared/builder"
)

// NodeExecutor defines the interface for node execution
type NodeExecutor interface {
	Execute(ctx context.Context, node *builder.Node) error
	CanHandle(nodeType string) bool
}

// ExecutionContext holds runtime state and data for workflow execution
type ExecutionContext struct {
	RunID     string
	Variables map[string]interface{}
	mu        sync.RWMutex
}

func (ec *ExecutionContext) SetVariable(key string, value interface{}) {
	ec.mu.Lock()
	defer ec.mu.Unlock()
	if ec.Variables == nil {
		ec.Variables = make(map[string]interface{})
	}
	ec.Variables[key] = value
}

func (ec *ExecutionContext) GetVariable(key string) (interface{}, bool) {
	ec.mu.RLock()
	defer ec.mu.RUnlock()
	val, exists := ec.Variables[key]
	return val, exists
}

// Runner manages workflow execution with pluggable node executors
type Runner struct {
	executors []NodeExecutor
}

func NewRunner() *Runner {
	return &Runner{
		executors: make([]NodeExecutor, 0),
	}
}

func (r *Runner) RegisterExecutor(executor NodeExecutor) {
	r.executors = append(r.executors, executor)
}

func (r *Runner) Run(ctx context.Context, wf *builder.Workflow, runID string) error {
	if len(wf.StartNodeIDs) == 0 {
		return fmt.Errorf("no start nodes found")
	}

	execCtx := &ExecutionContext{
		RunID:     runID,
		Variables: make(map[string]interface{}),
	}

	visited := make(map[string]bool)
	inputCounts := make(map[string]int)

	// Initialize input counts
	for _, node := range wf.NodeMap {
		inputCounts[node.ID] = node.InitialInputs
	}

	// Process start nodes
	queue := make([]string, 0, len(wf.StartNodeIDs))
	for _, startID := range wf.StartNodeIDs {
		if wf.NodeMap[startID] != nil {
			queue = append(queue, startID)
		}
	}

	return r.processQueue(ctx, wf, execCtx, queue, visited, inputCounts)
}

func (r *Runner) processQueue(ctx context.Context, wf *builder.Workflow, execCtx *ExecutionContext, 
	queue []string, visited map[string]bool, inputCounts map[string]int) error {
	
	for len(queue) > 0 {
		nodeID := queue[0]
		queue = queue[1:]

		if visited[nodeID] {
			continue
		}

		node := wf.NodeMap[nodeID]
		if node == nil {
			continue
		}

		// Check if all inputs are satisfied
		if inputCounts[nodeID] > 0 {
			// Node not ready, skip for now
			continue
		}

		// Execute node
		if err := r.executeNode(ctx, node, execCtx); err != nil {
			return fmt.Errorf("failed to execute node %s: %w", nodeID, err)
		}

		visited[nodeID] = true

		// Process next nodes
		for _, nextID := range node.NextIDs {
			if nextNode := wf.NodeMap[nextID]; nextNode != nil {
				// Decrement input count for next node
				inputCounts[nextID]--
				
				// Add to queue if ready to execute
				if inputCounts[nextID] <= 0 && !visited[nextID] {
					queue = append(queue, nextID)
				}
			}
		}
	}

	return nil
}

func (r *Runner) executeNode(ctx context.Context, node *builder.Node, execCtx *ExecutionContext) error {
	for _, executor := range r.executors {
		if executor.CanHandle(node.Type) {
			return executor.Execute(ctx, node)
		}
	}
	
	// Default: skip unknown node types
	return nil
}

// Built-in executors

type ManualStartExecutor struct{}

func (e *ManualStartExecutor) CanHandle(nodeType string) bool {
	return nodeType == "manualStartNode"
}

func (e *ManualStartExecutor) Execute(ctx context.Context, node *builder.Node) error {
	// Manual start nodes don't need execution logic
	return nil
}

type HTTPExecutor struct{}

func (e *HTTPExecutor) CanHandle(nodeType string) bool {
	return nodeType == "HttpNode"
}

func (e *HTTPExecutor) Execute(ctx context.Context, node *builder.Node) error {
	// TODO: Implement HTTP execution logic
	fmt.Printf("Executing HTTP node: %s\n", node.ID)
	return nil
}
