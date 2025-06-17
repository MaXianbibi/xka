// Package workflow provides workflow graph processing and execution capabilities.
package workflow

import (
	"fmt"
	"worker-managers/workflow/parser"
)

// Node represents a processed, execution-ready workflow node.
// Contains navigation pointers and execution state for workflow processing.
type Node struct {
	ID            string                 // Unique node identifier
	Type          string                 // Node type for execution logic
	Data          map[string]interface{} // Node configuration and parameters
	Next          []*Node                // Outgoing connections to subsequent nodes
	Previous      []*Node                // Incoming connections from previous nodes
	InitialInputs int                    // Number of expected inputs for execution
}

// Workflow represents the complete processed workflow graph.
// Provides efficient access to nodes and execution entry points.
type Workflow struct {
	NodeMap    map[string]*Node // Fast lookup table for nodes by ID
	StartNodes []*Node          // Entry points for workflow execution
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
		NodeMap:    make(map[string]*Node, len(payload.Nodes)), // Pre-allocate for efficiency
		StartNodes: make([]*Node, 0, 1),                        // Typically one start node
	}

	// Build nodes from raw payload data
	for _, rawNode := range payload.Nodes {
		
		// The verification of rawNode.ID and rawNode are already done in the parser.

		node := &Node{
			ID:       rawNode.ID,
			Type:     rawNode.Type,
			Data:     rawNode.Data,
			Next:     make([]*Node, 0),     // Initialize to avoid nil slices
			Previous: make([]*Node, 0),     // Initialize to avoid nil slices
		}
		workflow.NodeMap[node.ID] = node
	}

	// TODO: Build node connections from payload.Edges
	// TODO: Calculate InitialInputs for each node based on incoming connections
	// TODO: Validate graph structure (cycles, unreachable nodes, etc.)

	// Validate manual start node requirements
	startNodes := workflow.FindNodesByType("manualStartNode")
	switch len(startNodes) {
	case 0:
		return nil, &WorkflowError{
			Field:   "workflow",
			Message: "no manual start node found",
		}
	case 1:
		workflow.StartNodes = startNodes
	default:
		return nil, &WorkflowError{
			Field:   "workflow",
			Message: "multiple manual start nodes found",
		}
	}

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