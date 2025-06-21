// Package workflow provides workflow graph processing and execution capabilities.
package builder

import (
	"XKA/internal/worker-manager/parser"
	"encoding/json"
	"fmt"
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
	ID           string           `json:"id"`           // Unique workflow identifier
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

// ParseWorkflowFromJSON deserializes a JSON string into a Workflow struct.
// This function is the reverse operation of serializing a Workflow to JSON.
func ParseWorkflowFromJSON(jsonData string) (*Workflow, error) {
	if jsonData == "" {
		return nil, &WorkflowError{
			Field:   "jsonData",
			Message: "JSON data cannot be empty",
		}
	}

	var workflow Workflow
	if err := json.Unmarshal([]byte(jsonData), &workflow); err != nil {
		return nil, &WorkflowError{
			Field:   "jsonData",
			Message: fmt.Sprintf("failed to parse JSON: %v", err),
		}
	}

	// Validate the deserialized workflow
	if err := validateDeserializedWorkflow(&workflow); err != nil {
		return nil, err
	}

	return &workflow, nil
}

// ParseWorkflowFromBytes deserializes JSON bytes into a Workflow struct.
// Alternative function for when you already have byte data.
func ParseWorkflowFromBytes(jsonBytes []byte) (*Workflow, error) {
	if len(jsonBytes) == 0 {
		return nil, &WorkflowError{
			Field:   "jsonBytes",
			Message: "JSON bytes cannot be empty",
		}
	}

	var workflow Workflow
	if err := json.Unmarshal(jsonBytes, &workflow); err != nil {
		return nil, &WorkflowError{
			Field:   "jsonBytes",
			Message: fmt.Sprintf("failed to parse JSON: %v", err),
		}
	}

	// Validate the deserialized workflow
	if err := validateDeserializedWorkflow(&workflow); err != nil {
		return nil, err
	}

	return &workflow, nil
}

// validateDeserializedWorkflow validates the structure and integrity of a deserialized workflow.
func validateDeserializedWorkflow(workflow *Workflow) error {
	if workflow == nil {
		return &WorkflowError{
			Field:   "workflow",
			Message: "workflow cannot be nil",
		}
	}

	// Validate NodeMap exists
	if workflow.NodeMap == nil {
		return &WorkflowError{
			Field:   "nodeMap",
			Message: "nodeMap cannot be nil",
		}
	}

	// Validate each node in the NodeMap
	for nodeID, node := range workflow.NodeMap {
		if node == nil {
			return &WorkflowError{
				Field:   "nodeMap",
				Message: fmt.Sprintf("node with ID %s is nil", nodeID),
			}
		}

		// Validate node ID matches map key
		if node.ID != nodeID {
			return &WorkflowError{
				Field:   "nodeMap",
				Message: fmt.Sprintf("node ID %s does not match map key %s", node.ID, nodeID),
			}
		}

		// Validate node has required fields
		if node.ID == "" {
			return &WorkflowError{
				Field:   "node.ID",
				Message: "node ID cannot be empty",
			}
		}

		if node.Type == "" {
			return &WorkflowError{
				Field:   "node.Type",
				Message: fmt.Sprintf("node %s type cannot be empty", node.ID),
			}
		}

		// Initialize slices if they are nil to prevent runtime panics
		if node.NextIDs == nil {
			node.NextIDs = make([]string, 0)
		}
		if node.PreviousIDs == nil {
			node.PreviousIDs = make([]string, 0)
		}
		if node.Data == nil {
			node.Data = make(map[string]interface{})
		}

		// Validate that referenced nodes exist
		for _, nextID := range node.NextIDs {
			if _, exists := workflow.NodeMap[nextID]; !exists {
				return &WorkflowError{
					Field:   "node.NextIDs",
					Message: fmt.Sprintf("node %s references non-existent next node %s", node.ID, nextID),
				}
			}
		}

		for _, prevID := range node.PreviousIDs {
			if _, exists := workflow.NodeMap[prevID]; !exists {
				return &WorkflowError{
					Field:   "node.PreviousIDs",
					Message: fmt.Sprintf("node %s references non-existent previous node %s", node.ID, prevID),
				}
			}
		}

		// Validate InitialInputs matches PreviousIDs count
		if node.InitialInputs != len(node.PreviousIDs) {
			return &WorkflowError{
				Field: "node.InitialInputs",
				Message: fmt.Sprintf("node %s InitialInputs (%d) does not match PreviousIDs count (%d)",
					node.ID, node.InitialInputs, len(node.PreviousIDs)),
			}
		}
	}

	// Validate StartNodeIDs
	if workflow.StartNodeIDs == nil {
		workflow.StartNodeIDs = make([]string, 0)
	}

	for _, startID := range workflow.StartNodeIDs {
		if _, exists := workflow.NodeMap[startID]; !exists {
			return &WorkflowError{
				Field:   "startNodeIds",
				Message: fmt.Sprintf("start node ID %s does not exist in nodeMap", startID),
			}
		}
	}

	// Validate that we have at least one start node
	if len(workflow.StartNodeIDs) == 0 {
		return &WorkflowError{
			Field:   "startNodeIds",
			Message: "workflow must have at least one start node",
		}
	}

	// Validate that start nodes are actually manual start nodes (if following the original logic)
	for _, startID := range workflow.StartNodeIDs {
		startNode := workflow.NodeMap[startID]
		if startNode.Type == "manualStartNode" {
			// Ensure manual start nodes have no previous nodes and initialInputs is 0
			if len(startNode.PreviousIDs) != 0 {
				return &WorkflowError{
					Field:   "startNode.PreviousIDs",
					Message: fmt.Sprintf("manual start node %s should not have previous nodes", startID),
				}
			}
			if startNode.InitialInputs != 0 {
				return &WorkflowError{
					Field:   "startNode.InitialInputs",
					Message: fmt.Sprintf("manual start node %s should have InitialInputs = 0", startID),
				}
			}
		}
	}

	return nil
}
