// Package workflow provides workflow graph processing and execution capabilities.
package workflow

import (
	"fmt"
	"worker-managers/workflow/parser"
)

// Node represents a processed, execution-ready workflow node.
// Contains navigation IDs and execution state for workflow processing.
type Node struct {
	ID            string                 `json:"id"`            // Unique node identifier
	Type          string                 `json:"type"`          // Node type for execution logic
	Data          map[string]interface{} `json:"data"`          // Node configuration and parameters
	NextIDs       []string               `json:"nextIds"`       // IDs of subsequent nodes
	PreviousIDs   []string               `json:"previousIds"`   // IDs of previous nodes
	InitialInputs int                    `json:"initialInputs"` // Number of expected inputs for execution
}

// Workflow represents the complete processed workflow graph.
// Provides efficient access to nodes and execution entry points.
type Workflow struct {
	NodeMap      map[string]*Node `json:"nodeMap"`      // Fast lookup table for nodes by ID
	StartNodeIDs []string         `json:"startNodeIds"` // IDs of entry points for workflow execution
}

// WorkflowError represents workflow validation and processing errors.
type WorkflowError struct {
	Field   string
	Message string
}

// Error implements the error interface with formatted output.
func (e *WorkflowError) Error() string {
	return fmt.Sprintf("%s: %s", e.Field, e.Message)
}

// GetNextNodes returns the actual Node objects for the next nodes.
// Helper method to navigate the workflow graph.
func (n *Node) GetNextNodes(workflow *Workflow) []*Node {
	nodes := make([]*Node, 0, len(n.NextIDs))
	for _, id := range n.NextIDs {
		if node := workflow.FindNodeByID(id); node != nil {
			nodes = append(nodes, node)
		}
	}
	return nodes
}

// GetPreviousNodes returns the actual Node objects for the previous nodes.
// Helper method to navigate the workflow graph.
func (n *Node) GetPreviousNodes(workflow *Workflow) []*Node {
	nodes := make([]*Node, 0, len(n.PreviousIDs))
	for _, id := range n.PreviousIDs {
		if node := workflow.FindNodeByID(id); node != nil {
			nodes = append(nodes, node)
		}
	}
	return nodes
}

// GetStartNodes returns the actual Node objects for the start nodes.
// Helper method to get workflow entry points.
func (w *Workflow) GetStartNodes() []*Node {
	nodes := make([]*Node, 0, len(w.StartNodeIDs))
	for _, id := range w.StartNodeIDs {
		if node := w.FindNodeByID(id); node != nil {
			nodes = append(nodes, node)
		}
	}
	return nodes
}

// InitWorkflow transforms raw parsed payload into optimized workflow graph.
// Validates structure and builds node relationships for execution.
func InitWorkflow(payload *parser.Payload) (*Workflow, error) {
	if payload == nil {
		return nil, &WorkflowError{
			Field:   "payload",
			Message: "payload cannot be nil",
		}
	}

	workflow := &Workflow{
		NodeMap:      make(map[string]*Node, len(payload.Nodes)), // Pre-allocate for efficiency
		StartNodeIDs: make([]string, 0, 1),                       // Typically one start node
	}

	// Build nodes from raw payload data
	for _, rawNode := range payload.Nodes {
		// The verification of rawNode.ID and rawNode are already done in the parser.

		node := &Node{
			ID:            rawNode.ID,
			Type:          rawNode.Type,
			Data:          rawNode.Data,
			NextIDs:       make([]string, 0), // Initialize to avoid nil slices
			PreviousIDs:   make([]string, 0), // Initialize to avoid nil slices
			InitialInputs: 0,                 // Will be calculated from edges
		}
		workflow.NodeMap[node.ID] = node
	}

	// Build node connections from payload.Edges
	for _, edge := range payload.Edges {
		sourceNode := workflow.FindNodeByID(edge.Source)
		targetNode := workflow.FindNodeByID(edge.Target)

		if sourceNode == nil || targetNode == nil {
			return nil, &WorkflowError{
				Field:   "edges",
				Message: fmt.Sprintf("invalid edge from %s to %s", edge.Source, edge.Target),
			}
		}

		// Establish connections using IDs
		sourceNode.NextIDs = append(sourceNode.NextIDs, targetNode.ID)
		targetNode.PreviousIDs = append(targetNode.PreviousIDs, sourceNode.ID)
	}

	for _, node := range workflow.NodeMap {
		node.InitialInputs = len(node.PreviousIDs)
	}

	// Validate manual start node requirements
	startNodes := workflow.FindNodesByType("manualStartNode")
	switch len(startNodes) {
	case 0:
		return nil, &WorkflowError{
			Field:   "workflow",
			Message: "no manual start node found",
		}
	case 1:
		startNodes[0].InitialInputs = 0        // Manual start nodes do not require inputs
		startNodes[0].PreviousIDs = []string{} // No previous nodes for manual start
		workflow.StartNodeIDs = []string{startNodes[0].ID}
	default:
		return nil, &WorkflowError{
			Field:   "workflow",
			Message: "multiple manual start nodes found",
		}
	}

	// TODO: Validate graph structure (cycles, unreachable nodes, etc.)

	return workflow, nil
}

// FindNodeByID performs O(1) lookup of node by unique identifier.
// Returns nil if node doesn't exist.
func (w *Workflow) FindNodeByID(id string) *Node {
	return w.NodeMap[id] // Map returns nil for missing keys
}

// FindNodesByType returns all nodes matching the specified type.
// Performance: O(n) - consider caching if called frequently.
func (w *Workflow) FindNodesByType(nodeType string) []*Node {
	// Pre-allocate with estimated capacity to reduce allocations
	nodes := make([]*Node, 0, len(w.NodeMap)/10)

	for _, node := range w.NodeMap {
		if node.Type == nodeType {
			nodes = append(nodes, node)
		}
	}

	return nodes
}
