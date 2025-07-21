package schema

import (
    "github.com/google/uuid"
    "entgo.io/ent"
    "entgo.io/ent/schema/edge"
    "entgo.io/ent/schema/field"
    "entgo.io/ent/schema/mixin"
)

// Workflow holds the schema definition for the Workflow entity.
type Workflow struct {
    ent.Schema
}

func (Workflow) Mixin() []ent.Mixin {
    return []ent.Mixin{
        mixin.Time{},
    }
}

func (Workflow) Fields() []ent.Field {
    return []ent.Field{
        field.UUID("id", uuid.UUID{}).Default(uuid.New).Unique(),
        field.String("name").NotEmpty(),
    }
}

// ✅ AJOUTEZ CET EDGE !
func (Workflow) Edges() []ent.Edge {
    return []ent.Edge{
        edge.To("executions", WorkflowExecutionResult.Type), // 👈 Relation one-to-many
    }
}
