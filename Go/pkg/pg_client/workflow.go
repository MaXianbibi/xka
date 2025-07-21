package pg_client

import (
	"XKA/ent"
	"XKA/ent/workflow"
	"XKA/ent/workflowexecutionresult"
	"context"
	"fmt"

	"github.com/google/uuid"
)

// WorkflowService provides workflow-related database operations
type WorkflowService struct {
	client *Client
}

// Workflows returns a workflow service instance
func (c *Client) Workflows() *WorkflowService {
	return &WorkflowService{client: c}
}

// Create creates a new workflow
func (ws *WorkflowService) Create(ctx context.Context, name string) (*ent.Workflow, error) {
	if name == "" {
		return nil, fmt.Errorf("workflow name cannot be empty")
	}

	return ws.client.ent.Workflow.
		Create().
		SetName(name).
		Save(ctx)
}

// GetByID retrieves a workflow by its ID
func (ws *WorkflowService) GetByID(ctx context.Context, id uuid.UUID) (*ent.Workflow, error) {
	workflow, err := ws.client.ent.Workflow.Get(ctx, id)
	if err != nil {
		if ent.IsNotFound(err) {
			return nil, fmt.Errorf("workflow not found: %s", id.String())
		}
		return nil, fmt.Errorf("failed to get workflow: %w", err)
	}
	return workflow, nil
}

// List retrieves workflows with pagination
func (ws *WorkflowService) List(ctx context.Context, limit, offset int) ([]*ent.Workflow, error) {
	if limit <= 0 || limit > 100 {
		limit = 10
	}
	if offset < 0 {
		offset = 0
	}

	workflows, err := ws.client.ent.Workflow.
		Query().
		Order(ent.Desc(workflow.FieldCreateTime)).
		Limit(limit).
		Offset(offset).
		All(ctx)

	if err != nil {
		return nil, fmt.Errorf("failed to list workflows: %w", err)
	}

	return workflows, nil
}

// Count returns the total number of workflows
func (ws *WorkflowService) Count(ctx context.Context) (int, error) {
	count, err := ws.client.ent.Workflow.Query().Count(ctx)
	if err != nil {
		return 0, fmt.Errorf("failed to count workflows: %w", err)
	}
	return count, nil
}

// Update updates a workflow
func (ws *WorkflowService) Update(ctx context.Context, id uuid.UUID, name string) (*ent.Workflow, error) {
	if name == "" {
		return nil, fmt.Errorf("workflow name cannot be empty")
	}

	workflow, err := ws.client.ent.Workflow.
		UpdateOneID(id).
		SetName(name).
		Save(ctx)

	if err != nil {
		if ent.IsNotFound(err) {
			return nil, fmt.Errorf("workflow not found: %s", id.String())
		}
		return nil, fmt.Errorf("failed to update workflow: %w", err)
	}

	return workflow, nil
}

// Delete deletes a workflow
func (ws *WorkflowService) Delete(ctx context.Context, id uuid.UUID) error {
	err := ws.client.ent.Workflow.DeleteOneID(id).Exec(ctx)
	if err != nil {
		if ent.IsNotFound(err) {
			return fmt.Errorf("workflow not found: %s", id.String())
		}
		return fmt.Errorf("failed to delete workflow: %w", err)
	}
	return nil
}

// GetExecutions retrieves all executions for a workflow
func (ws *WorkflowService) GetExecutions(ctx context.Context, workflowID uuid.UUID) ([]*ent.WorkflowExecutionResult, error) {
	executions, err := ws.client.ent.WorkflowExecutionResult.
		Query().
		Where(workflowexecutionresult.WorkflowID(workflowID)).
		Order(ent.Desc(workflowexecutionresult.FieldCreateTime)).
		All(ctx)

	if err != nil {
		return nil, fmt.Errorf("failed to get workflow executions: %w", err)
	}

	return executions, nil
}

// GetExecutionsWithPagination retrieves executions for a workflow with pagination
func (ws *WorkflowService) GetExecutionsWithPagination(ctx context.Context, workflowID uuid.UUID, limit, offset int) ([]*ent.WorkflowExecutionResult, error) {
	if limit <= 0 || limit > 100 {
		limit = 10
	}
	if offset < 0 {
		offset = 0
	}

	executions, err := ws.client.ent.WorkflowExecutionResult.
		Query().
		Where(workflowexecutionresult.WorkflowID(workflowID)).
		Order(ent.Desc(workflowexecutionresult.FieldCreateTime)).
		Limit(limit).
		Offset(offset).
		All(ctx)

	if err != nil {
		return nil, fmt.Errorf("failed to get workflow executions: %w", err)
	}

	return executions, nil
}
