package nodeStruct

import (
	"encoding/json"
	"fmt"
	"strings"
	"worker-managers/logger"
	"go.uber.org/zap"
)

// Payload represents the complete JSON structure received from the client.
// It contains the raw workflow definition with nodes and their connections.
type Payload struct {
	Nodes []RawNode `json:"nodes"`
	Edges []RawEdge `json:"edges"`
}

// RawNode represents a node as received from JSON input.
// Contains the basic node information before processing into execution-ready format.
type RawNode struct {
	ID   string                 `json:"id"`   // Unique identifier for the node
	Type string                 `json:"type"` // Node type (e.g., "start", "process", "end")
	Data map[string]interface{} `json:"data"` // Node-specific configuration and parameters
}

// RawEdge represents a connection between two nodes as received from JSON.
// Defines the flow direction and relationship between workflow nodes.
type RawEdge struct {
	ID     string      `json:"id"`     // Unique identifier for the edge
	Source string      `json:"source"` // ID of the source node
	Target string      `json:"target"` // ID of the target node
	Type   interface{} `json:"type"`   // Edge type (can be null/optional)
}

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

// ParseWorkflow converts raw payload map into structured Payload object.
// Performs JSON marshaling/unmarshaling to ensure proper type conversion.
func ParseWorkflow(rawPayload map[string]interface{}) (*Payload, error) {
	var payload Payload

	// Convert map to JSON bytes for proper type handling
	jsonBytes, err := json.Marshal(rawPayload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal raw payload: %w", err)
	}

	// Unmarshal into structured payload
	if err := json.Unmarshal(jsonBytes, &payload); err != nil {
		return nil, fmt.Errorf("failed to unmarshal into Payload struct: %w", err)
	}

	// Log the parsed workflow for debugging
	logWorkflow(&payload)

	return &payload, nil
}

// logWorkflow outputs detailed workflow information to logs.
// Provides comprehensive debugging information about nodes and edges.
func logWorkflow(payload *Payload) {
	logger.Log.Info("Parsed workflow summary",
		zap.Int("nodeCount", len(payload.Nodes)),
		zap.Int("edgeCount", len(payload.Edges)),
	)

	// Log detailed node information
	if len(payload.Nodes) > 0 {
		nodeDetails := buildNodeLogDetails(payload.Nodes)
		logger.Log.Info("Workflow nodes:\n" + nodeDetails)
	}

	// Log detailed edge information
	if len(payload.Edges) > 0 {
		edgeDetails := buildEdgeLogDetails(payload.Edges)
		logger.Log.Info("Workflow edges:\n" + edgeDetails)
	}
}

// buildNodeLogDetails creates formatted string representation of all nodes.
// Returns multi-line string with indented JSON data for readability.
func buildNodeLogDetails(nodes []RawNode) string {
	var nodeLines []string

	for _, node := range nodes {
		dataStr := formatJSON(node.Data)
		nodeLines = append(nodeLines,
			fmt.Sprintf("- ID: %s", node.ID),
			fmt.Sprintf("  Type: %s", node.Type),
			"  Data:",
			indentString(dataStr, "    "),
			"", // Empty line for separation
		)
	}

	return strings.Join(nodeLines, "\n")
}

// buildEdgeLogDetails creates formatted string representation of all edges.
// Returns multi-line string with edge connection information.
func buildEdgeLogDetails(edges []RawEdge) string {
	var edgeLines []string

	for _, edge := range edges {
		edgeLines = append(edgeLines,
			fmt.Sprintf("- ID: %s", edge.ID),
			fmt.Sprintf("  Source: %s", edge.Source),
			fmt.Sprintf("  Target: %s", edge.Target),
			fmt.Sprintf("  Type: %v", edge.Type),
			"", // Empty line for separation
		)
	}

	return strings.Join(edgeLines, "\n")
}

// formatJSON converts interface{} to pretty-printed JSON string.
// Handles marshaling errors gracefully by returning error message.
func formatJSON(v interface{}) string {
	bytes, err := json.MarshalIndent(v, "  ", "  ")
	if err != nil {
		return "<error formatting json>"
	}
	return string(bytes)
}

// indentString adds prefix to every line of the input string.
// Useful for creating nested, readable log output.
func indentString(s, prefix string) string {
	lines := strings.Split(s, "\n")
	for i, line := range lines {
		lines[i] = prefix + line
	}
	return strings.Join(lines, "\n")
}