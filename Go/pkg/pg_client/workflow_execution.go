package pg_client

import (
	"XKA/ent"
	"XKA/ent/workflowexecutionresult"
	"context"
	"fmt"

	"github.com/google/uuid"
)

// ExecutionService provides workflow execution-related database operations
type ExecutionService struct {
	client *Client
}

// Executions returns an execution service instance
func (c *Client) Executions() *ExecutionService {
	return &ExecutionService{client: c}
}

// CreateExecutionParams holds parameters for creating a workflow execution
type CreateExecutionParams struct {
	WorkflowID    uuid.UUID
	Status        string
	StartedAt     int64
	NumberOfNodes int
}

// UpdateExecutionParams holds parameters for updating a workflow execution
type UpdateExecutionParams struct {
	Status     string
	EndedAt    *int64
	DurationMs *int64
	GlobalLogs []string
	ErrorMsg   *string
}

// Create creates a new workflow execution
func (es *ExecutionService) Create(ctx context.Context, params CreateExecutionParams) (*ent.WorkflowExecutionResult, error) {
	if params.WorkflowID == uuid.Nil {
		return nil, fmt.Errorf("workflow ID cannot be empty")
	}
	if params.Status == "" {
		return nil, fmt.Errorf("execution status cannot be empty")
	}

	execution, err := es.client.ent.WorkflowExecutionResult.
		Create().
		SetWorkflowID(params.WorkflowID).
		SetStatus(workflowexecutionresult.Status(params.Status)).
		SetStartedAt(params.StartedAt).
		SetNumberOfNodes(params.NumberOfNodes).
		Save(ctx)

	if err != nil {
		return nil, fmt.Errorf("failed to create workflow execution: %w", err)
	}

	return execution, nil
}

// GetByID retrieves a workflow execution by its ID
func (es *ExecutionService) GetByID(ctx context.Context, id uuid.UUID) (*ent.WorkflowExecutionResult, error) {
	execution, err := es.client.ent.WorkflowExecutionResult.Get(ctx, id)
	if err != nil {
		if ent.IsNotFound(err) {
			return nil, fmt.Errorf("workflow execution not found: %s", id.String())
		}
		return nil, fmt.Errorf("failed to get workflow execution: %w", err)
	}
	return execution, nil
}

// List retrieves workflow executions with pagination
func (es *ExecutionService) List(ctx context.Context, limit, offset int) ([]*ent.WorkflowExecutionResult, error) {
	if limit <= 0 || limit > 100 {
		limit = 10
	}
	if offset < 0 {
		offset = 0
	}

	executions, err := es.client.ent.WorkflowExecutionResult.
		Query().
		Order(ent.Desc(workflowexecutionresult.FieldStartedAt)).
		Limit(limit).
		Offset(offset).
		All(ctx)

	if err != nil {
		return nil, fmt.Errorf("failed to list workflow executions: %w", err)
	}

	return executions, nil
}

// ListByWorkflow retrieves executions for a specific workflow with pagination
func (es *ExecutionService) ListByWorkflow(ctx context.Context, workflowID uuid.UUID, limit, offset int) ([]*ent.WorkflowExecutionResult, error) {
	if limit <= 0 || limit > 100 {
		limit = 10
	}
	if offset < 0 {
		offset = 0
	}

	executions, err := es.client.ent.WorkflowExecutionResult.
		Query().
		Where(workflowexecutionresult.WorkflowID(workflowID)).
		Order(ent.Desc(workflowexecutionresult.FieldStartedAt)).
		Limit(limit).
		Offset(offset).
		All(ctx)

	if err != nil {
		return nil, fmt.Errorf("failed to list workflow executions: %w", err)
	}

	return executions, nil
}

// Count returns the total number of workflow executions
func (es *ExecutionService) Count(ctx context.Context) (int, error) {
	count, err := es.client.ent.WorkflowExecutionResult.Query().Count(ctx)
	if err != nil {
		return 0, fmt.Errorf("failed to count workflow executions: %w", err)
	}
	return count, nil
}

// CountByWorkflow returns the number of executions for a specific workflow
func (es *ExecutionService) CountByWorkflow(ctx context.Context, workflowID uuid.UUID) (int, error) {
	count, err := es.client.ent.WorkflowExecutionResult.
		Query().
		Where(workflowexecutionresult.WorkflowID(workflowID)).
		Count(ctx)

	if err != nil {
		return 0, fmt.Errorf("failed to count workflow executions: %w", err)
	}
	return count, nil
}

// Update updates a workflow execution
func (es *ExecutionService) Update(ctx context.Context, id uuid.UUID, params UpdateExecutionParams) (*ent.WorkflowExecutionResult, error) {
	if params.Status == "" {
		return nil, fmt.Errorf("execution status cannot be empty")
	}

	update := es.client.ent.WorkflowExecutionResult.
		UpdateOneID(id).
		SetStatus(workflowexecutionresult.Status(params.Status))

	if params.EndedAt != nil {
		update = update.SetEndedAt(*params.EndedAt)
	}

	if params.DurationMs != nil {
		update = update.SetDurationMs(*params.DurationMs)
	}

	if params.GlobalLogs != nil {
		update = update.SetGlobalLogs(params.GlobalLogs)
	}

	if params.ErrorMsg != nil {
		update = update.SetError(*params.ErrorMsg)
	}

	execution, err := update.Save(ctx)
	if err != nil {
		if ent.IsNotFound(err) {
			return nil, fmt.Errorf("workflow execution not found: %s", id.String())
		}
		return nil, fmt.Errorf("failed to update workflow execution: %w", err)
	}

	return execution, nil
}

// Delete deletes a workflow execution
func (es *ExecutionService) Delete(ctx context.Context, id uuid.UUID) error {
	err := es.client.ent.WorkflowExecutionResult.DeleteOneID(id).Exec(ctx)
	if err != nil {
		if ent.IsNotFound(err) {
			return fmt.Errorf("workflow execution not found: %s", id.String())
		}
		return fmt.Errorf("failed to delete workflow execution: %w", err)
	}
	return nil
}
