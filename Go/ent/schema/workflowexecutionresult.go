// schema/workflowexecutionresult.go
package schema

import (
    "github.com/google/uuid"
    "entgo.io/ent"
    "entgo.io/ent/schema/edge"
    "entgo.io/ent/schema/field"
    "entgo.io/ent/schema/mixin"
)

// WorkflowExecutionResult holds the schema definition for the WorkflowExecutionResult entity.
type WorkflowExecutionResult struct {
    ent.Schema
}

// Mixin pour ajouter les champs created_at/updated_at
func (WorkflowExecutionResult) Mixin() []ent.Mixin {
    return []ent.Mixin{
        mixin.Time{},
    }
}

// Fields of the WorkflowExecutionResult.
func (WorkflowExecutionResult) Fields() []ent.Field {
    return []ent.Field{
        field.UUID("id", uuid.UUID{}).Default(uuid.New).Unique(),
        field.UUID("workflow_id", uuid.UUID{}),
        field.Enum("status").Values("success", "error", "running", "skipped"),
        field.Int64("started_at"),
        field.Int64("ended_at").Optional().Nillable(),
        field.Int64("duration_ms").Optional().Nillable(),
        field.Strings("global_logs").Optional(),
        field.String("error").Optional().Nillable(),
        field.JSON("meta", map[string]interface{}{}).Optional(),
        field.Int("number_of_nodes").Default(0),
    }
}

// Edges of the WorkflowExecutionResult.
func (WorkflowExecutionResult) Edges() []ent.Edge {
    return []ent.Edge{
        edge.From("workflow", Workflow.Type).
            Ref("executions").
            Unique(), 
    }
}

