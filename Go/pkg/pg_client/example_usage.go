package pg_client

import (
	"XKA/ent"
	"context"
	"fmt"
	"time"
)

// ExampleUsage demonstrates how to use the improved pg_client
func ExampleUsage() {
	ctx := context.Background()

	// Get the singleton client
	client := GetClient()
	defer client.Close()

	// Test connection
	if err := client.Ping(ctx); err != nil {
		fmt.Printf("Failed to ping database: %v\n", err)
		return
	}

	// === Workflow Operations ===
	workflows := client.Workflows()

	// Create a workflow
	workflow, err := workflows.Create(ctx, "My Test Workflow")
	if err != nil {
		fmt.Printf("Failed to create workflow: %v\n", err)
		return
	}
	fmt.Printf("Created workflow: %s\n", workflow.ID)

	// Get workflow by ID
	retrievedWorkflow, err := workflows.GetByID(ctx, workflow.ID)
	if err != nil {
		fmt.Printf("Failed to get workflow: %v\n", err)
		return
	}
	fmt.Printf("Retrieved workflow: %s\n", retrievedWorkflow.Name)

	// List workflows with pagination
	workflowList, err := workflows.List(ctx, 10, 0)
	if err != nil {
		fmt.Printf("Failed to list workflows: %v\n", err)
		return
	}
	fmt.Printf("Found %d workflows\n", len(workflowList))

	// Count workflows
	count, err := workflows.Count(ctx)
	if err != nil {
		fmt.Printf("Failed to count workflows: %v\n", err)
		return
	}
	fmt.Printf("Total workflows: %d\n", count)

	// === Execution Operations ===
	executions := client.Executions()

	// Create an execution
	execution, err := executions.Create(ctx, CreateExecutionParams{
		WorkflowID:    workflow.ID,
		Status:        "running",
		StartedAt:     time.Now().Unix(),
		NumberOfNodes: 5,
	})
	if err != nil {
		fmt.Printf("Failed to create execution: %v\n", err)
		return
	}
	fmt.Printf("Created execution: %s\n", execution.ID)

	// Update execution
	endTime := time.Now().Unix()
	duration := int64(1000) // 1 second in ms
	logs := []string{"Step 1 completed", "Step 2 completed"}

	updatedExecution, err := executions.Update(ctx, execution.ID, UpdateExecutionParams{
		Status:     "success",
		EndedAt:    &endTime,
		DurationMs: &duration,
		GlobalLogs: logs,
	})
	if err != nil {
		fmt.Printf("Failed to update execution: %v\n", err)
		return
	}
	fmt.Printf("Updated execution status: %s\n", updatedExecution.Status)

	// Get executions for a workflow
	workflowExecutions, err := workflows.GetExecutions(ctx, workflow.ID)
	if err != nil {
		fmt.Printf("Failed to get workflow executions: %v\n", err)
		return
	}
	fmt.Printf("Found %d executions for workflow\n", len(workflowExecutions))

	// === Transaction Example ===
	err = client.Tx(ctx, func(tx *ent.Tx) error {
		// Create multiple workflows in a transaction
		_, err := tx.Workflow.Create().SetName("Workflow 1").Save(ctx)
		if err != nil {
			return err
		}

		_, err = tx.Workflow.Create().SetName("Workflow 2").Save(ctx)
		if err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		fmt.Printf("Transaction failed: %v\n", err)
		return
	}

	fmt.Println("Transaction completed successfully")
}

// ExampleTestClient demonstrates how to create a client for testing
func ExampleTestClient() (*Client, error) {
	config := &Config{
		Host:            "localhost",
		Port:            "5432",
		User:            "test_user",
		Password:        "test_password",
		DB:              "test_db",
		MaxOpenConns:    5,
		MaxIdleConns:    2,
		ConnMaxLifetime: 1 * time.Minute,
		EnableDebug:     true,
	}

	return NewClient(config)
}
