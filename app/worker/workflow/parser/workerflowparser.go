package parser

import (
	"encoding/json"
	"fmt"
	"strings"
	"worker-managers/logger"
	"go.uber.org/zap"
)

// Payload represents the complete JSON structure received from the client.
// It contains the raw workflow definition with nodes and their connections.
// This structure serves as the primary interface for workflow data exchange.
type Payload struct {
	Nodes []RawNode `json:"nodes" validate:"required,min=1"`
	Edges []RawEdge `json:"edges" validate:"required"`
}

// RawNode represents a node as received from JSON input.
// Contains the basic node information before processing into execution-ready format.
// Each node must have a unique ID and a valid type for proper workflow execution.
type RawNode struct {
	ID   string                 `json:"id" validate:"required"`   // Unique identifier for the node
	Type string                 `json:"type" validate:"required"` // Node type (e.g., "start", "process", "end")
	Data map[string]interface{} `json:"data"`                     // Node-specific configuration and parameters
}

// RawEdge represents a connection between two nodes as received from JSON.
// Defines the flow direction and relationship between workflow nodes.
// Source and Target must reference existing node IDs for valid connections.
type RawEdge struct {
	ID     string      `json:"id" validate:"required"`     // Unique identifier for the edge
	Source string      `json:"source" validate:"required"` // ID of the source node
	Target string      `json:"target" validate:"required"` // ID of the target node
	Type   interface{} `json:"type"`                       // Edge type (optional, can be null)
}

// WorkflowParseError represents parsing errors with contextual information
type WorkflowParseError struct {
	Field   string // The field that caused the error
	Index   int    // Index in array if applicable (-1 if not applicable)
	Message string // Error description
}

func (e *WorkflowParseError) Error() string {
	if e.Index >= 0 {
		return fmt.Sprintf("workflow parse error at %s[%d]: %s", e.Field, e.Index, e.Message)
	}
	return fmt.Sprintf("workflow parse error at %s: %s", e.Field, e.Message)
}

// ParseWorkflow converts raw payload map into structured Payload object.
// This is the main entry point for workflow parsing and validation.
// It performs comprehensive validation to ensure workflow integrity.
func ParseWorkflow(rawPayload map[string]interface{}) (*Payload, error) {
	if rawPayload == nil {
		return nil, &WorkflowParseError{
			Field:   "payload",
			Index:   -1,
			Message: "payload cannot be nil",
		}
	}

	var payload Payload

	// Method 1: Direct JSON marshaling for clean type conversion
	// This approach ensures consistent data types and proper validation
	jsonBytes, err := json.Marshal(rawPayload)
	if err != nil {
		return nil, &WorkflowParseError{
			Field:   "payload",
			Index:   -1,
			Message: fmt.Sprintf("failed to marshal raw payload: %v", err),
		}
	}

	if err := json.Unmarshal(jsonBytes, &payload); err != nil {
		return nil, &WorkflowParseError{
			Field:   "payload",
			Index:   -1,
			Message: fmt.Sprintf("failed to unmarshal into Payload struct: %v", err),
		}
	}

	// Method 2: Manual parsing for better error handling and validation
	// This provides more granular control over the parsing process
	rawNodesRaw, ok := rawPayload["nodes"].([]interface{})
	if !ok {
		return nil, &WorkflowParseError{
			Field:   "nodes",
			Index:   -1,
			Message: "field missing or not an array",
		}
	}

	rawNodes, err := parseNodes(rawNodesRaw)
	if err != nil {
		return nil, fmt.Errorf("error parsing nodes: %w", err)
	}

	rawEdgesRaw, ok := rawPayload["edges"].([]interface{})
	if !ok {
		return nil, &WorkflowParseError{
			Field:   "edges",
			Index:   -1,
			Message: "field missing or not an array",
		}
	}

	rawEdges, err := parseEdges(rawEdgesRaw)
	if err != nil {
		return nil, fmt.Errorf("error parsing edges: %w", err)
	}

	// Create validated payload with manual parsing results
	// This ensures consistency between both parsing methods
	validatedPayload := &Payload{
		Nodes: rawNodes,
		Edges: rawEdges,
	}

	// Perform structural validation to ensure workflow integrity
	if err := validateWorkflowStructure(validatedPayload); err != nil {
		return nil, err
	}

	// Log successful parsing with detailed information
	logWorkflow(validatedPayload)

	return validatedPayload, nil
}

// parseEdges processes raw edge data with comprehensive validation.
// Ensures all required fields are present and properly typed.
func parseEdges(rawEdges []interface{}) ([]RawEdge, error) {
	if rawEdges == nil {
		return []RawEdge{}, nil // Allow empty edge arrays
	}

	edges := make([]RawEdge, 0, len(rawEdges))

	for i, raw := range rawEdges {
		edgeMap, ok := raw.(map[string]interface{})
		if !ok {
			return nil, &WorkflowParseError{
				Field:   "edges",
				Index:   i,
				Message: "element is not an object",
			}
		}

		edge, err := parseEdge(edgeMap, i)
		if err != nil {
			return nil, err
		}

		edges = append(edges, *edge)
	}

	return edges, nil
}

// parseEdge processes a single edge with field validation
func parseEdge(edgeMap map[string]interface{}, index int) (*RawEdge, error) {
	// Validate required string fields
	id, ok := edgeMap["id"].(string)
	if !ok || strings.TrimSpace(id) == "" {
		return nil, &WorkflowParseError{
			Field:   "edges",
			Index:   index,
			Message: "missing or invalid 'id' field",
		}
	}

	source, ok := edgeMap["source"].(string)
	if !ok || strings.TrimSpace(source) == "" {
		return nil, &WorkflowParseError{
			Field:   "edges",
			Index:   index,
			Message: "missing or invalid 'source' field",
		}
	}

	target, ok := edgeMap["target"].(string)
	if !ok || strings.TrimSpace(target) == "" {
		return nil, &WorkflowParseError{
			Field:   "edges",
			Index:   index,
			Message: "missing or invalid 'target' field",
		}
	}

	// Type field is optional and can be any type
	var edgeType interface{}
	if t, exists := edgeMap["type"]; exists {
		edgeType = t
	}

	return &RawEdge{
		ID:     strings.TrimSpace(id),
		Source: strings.TrimSpace(source),
		Target: strings.TrimSpace(target),
		Type:   edgeType,
	}, nil
}

// parseNodes processes raw node data with comprehensive validation.
// Ensures all required fields are present and data integrity is maintained.
func parseNodes(rawNodes []interface{}) ([]RawNode, error) {
	if rawNodes == nil {
		return nil, &WorkflowParseError{
			Field:   "nodes",
			Index:   -1,
			Message: "nodes array cannot be nil",
		}
	}

	if len(rawNodes) == 0 {
		return nil, &WorkflowParseError{
			Field:   "nodes",
			Index:   -1,
			Message: "workflow must contain at least one node",
		}
	}

	nodes := make([]RawNode, 0, len(rawNodes))

	for i, raw := range rawNodes {
		nodeMap, ok := raw.(map[string]interface{})
		if !ok {
			return nil, &WorkflowParseError{
				Field:   "nodes",
				Index:   i,
				Message: "element is not an object",
			}
		}

		node, err := parseNode(nodeMap, i)
		if err != nil {
			return nil, err
		}

		nodes = append(nodes, *node)
	}

	return nodes, nil
}

// parseNode processes a single node with field validation
func parseNode(nodeMap map[string]interface{}, index int) (*RawNode, error) {
	// Validate required string fields
	id, ok := nodeMap["id"].(string)
	if !ok || strings.TrimSpace(id) == "" {
		return nil, &WorkflowParseError{
			Field:   "nodes",
			Index:   index,
			Message: "missing or invalid 'id' field",
		}
	}

	nodeType, ok := nodeMap["type"].(string)
	if !ok || strings.TrimSpace(nodeType) == "" {
		return nil, &WorkflowParseError{
			Field:   "nodes",
			Index:   index,
			Message: "missing or invalid 'type' field",
		}
	}

	// Data field is optional but must be an object if present
	dataMap := make(map[string]interface{})
	if dataRaw, exists := nodeMap["data"]; exists && dataRaw != nil {
		if dataMap, ok = dataRaw.(map[string]interface{}); !ok {
			return nil, &WorkflowParseError{
				Field:   "nodes",
				Index:   index,
				Message: "invalid 'data' field - must be an object",
			}
		}
	}

	return &RawNode{
		ID:   strings.TrimSpace(id),
		Type: strings.TrimSpace(nodeType),
		Data: dataMap,
	}, nil
}

// validateWorkflowStructure performs structural validation of the workflow.
// Ensures node IDs are unique and all edge references are valid.
func validateWorkflowStructure(payload *Payload) error {
	// Validate unique node IDs
	nodeIDs := make(map[string]bool)
	for i, node := range payload.Nodes {
		if nodeIDs[node.ID] {
			return &WorkflowParseError{
				Field:   "nodes",
				Index:   i,
				Message: fmt.Sprintf("duplicate node ID: %s", node.ID),
			}
		}
		nodeIDs[node.ID] = true
	}

	// Validate edge references
	for i, edge := range payload.Edges {
		if !nodeIDs[edge.Source] {
			return &WorkflowParseError{
				Field:   "edges",
				Index:   i,
				Message: fmt.Sprintf("source node '%s' does not exist", edge.Source),
			}
		}
		if !nodeIDs[edge.Target] {
			return &WorkflowParseError{
				Field:   "edges",
				Index:   i,
				Message: fmt.Sprintf("target node '%s' does not exist", edge.Target),
			}
		}
	}

	// Validate unique edge IDs
	edgeIDs := make(map[string]bool)
	for i, edge := range payload.Edges {
		if edgeIDs[edge.ID] {
			return &WorkflowParseError{
				Field:   "edges",
				Index:   i,
				Message: fmt.Sprintf("duplicate edge ID: %s", edge.ID),
			}
		}
		edgeIDs[edge.ID] = true
	}

	return nil
}

// logWorkflow outputs detailed workflow information to logs.
// Provides comprehensive debugging information about nodes and edges.
// Uses structured logging for better observability and debugging.
func logWorkflow(payload *Payload) {
	logger.Log.Info("Successfully parsed workflow",
		zap.Int("nodeCount", len(payload.Nodes)),
		zap.Int("edgeCount", len(payload.Edges)),
		zap.Strings("nodeTypes", extractNodeTypes(payload.Nodes)),
	)

	// Log detailed information only in debug mode to avoid log spam
	if logger.Log.Core().Enabled(zap.DebugLevel) {
		if len(payload.Nodes) > 0 {
			nodeDetails := buildNodeLogDetails(payload.Nodes)
			logger.Log.Debug("Workflow nodes details:\n" + nodeDetails)
		}

		if len(payload.Edges) > 0 {
			edgeDetails := buildEdgeLogDetails(payload.Edges)
			logger.Log.Debug("Workflow edges details:\n" + edgeDetails)
		}
	}
}

// extractNodeTypes returns a slice of unique node types for logging
func extractNodeTypes(nodes []RawNode) []string {
	typeSet := make(map[string]bool)
	for _, node := range nodes {
		typeSet[node.Type] = true
	}

	types := make([]string, 0, len(typeSet))
	for nodeType := range typeSet {
		types = append(types, nodeType)
	}
	return types
}

// buildNodeLogDetails creates formatted string representation of all nodes.
// Returns multi-line string with indented JSON data for readability.
// Optimized for debugging and troubleshooting workflow issues.
func buildNodeLogDetails(nodes []RawNode) string {
	var nodeLines []string
	nodeLines = append(nodeLines, fmt.Sprintf("Total nodes: %d", len(nodes)))

	for i, node := range nodes {
		dataStr := formatJSON(node.Data)
		nodeLines = append(nodeLines,
			fmt.Sprintf("[%d] Node ID: %s", i+1, node.ID),
			fmt.Sprintf("    Type: %s", node.Type),
			"    Data:",
			indentString(dataStr, "      "),
			"", // Empty line for visual separation
		)
	}

	return strings.Join(nodeLines, "\n")
}

// buildEdgeLogDetails creates formatted string representation of all edges.
// Returns multi-line string with edge connection information.
// Includes connection mapping for workflow visualization.
func buildEdgeLogDetails(edges []RawEdge) string {
	var edgeLines []string
	edgeLines = append(edgeLines, fmt.Sprintf("Total edges: %d", len(edges)))

	for i, edge := range edges {
		edgeLines = append(edgeLines,
			fmt.Sprintf("[%d] Edge ID: %s", i+1, edge.ID),
			fmt.Sprintf("    Connection: %s -> %s", edge.Source, edge.Target),
			fmt.Sprintf("    Type: %v", edge.Type),
			"", // Empty line for visual separation
		)
	}

	return strings.Join(edgeLines, "\n")
}

// formatJSON converts interface{} to pretty-printed JSON string.
// Handles marshaling errors gracefully by returning descriptive error message.
// Provides consistent formatting for debugging output.
func formatJSON(v interface{}) string {
	if v == nil {
		return "{}" // Return empty object for nil values
	}

	bytes, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		return fmt.Sprintf("<error formatting json: %v>", err)
	}
	return string(bytes)
}

// indentString adds prefix to every line of the input string.
// Useful for creating nested, readable log output with proper indentation.
// Handles empty lines gracefully to maintain formatting consistency.
func indentString(s, prefix string) string {
	if s == "" {
		return s
	}

	lines := strings.Split(s, "\n")
	for i, line := range lines {
		if strings.TrimSpace(line) != "" { // Only indent non-empty lines
			lines[i] = prefix + line
		}
	}
	return strings.Join(lines, "\n")
}