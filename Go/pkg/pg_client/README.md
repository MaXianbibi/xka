# PostgreSQL Client Package

A clean, efficient PostgreSQL client wrapper for the XKA project using Ent ORM.

## Key Improvements

### 🔧 **Architecture**
- **Service Pattern**: Organized methods into `WorkflowService` and `ExecutionService`
- **Proper Connection Pooling**: Configurable connection limits and lifetimes
- **Transaction Support**: Built-in transaction helper with proper rollback handling
- **Testable Design**: `NewClient()` function for creating test instances

### 🚀 **Performance**
- **Connection Pooling**: Configurable max open/idle connections
- **Connection Lifecycle**: Proper connection lifetime management
- **Efficient Queries**: Optimized database queries with proper ordering

### 🛡️ **Reliability**
- **Consistent Error Handling**: Wrapped errors with context
- **Input Validation**: Proper parameter validation
- **Graceful Degradation**: Better handling of edge cases
- **Resource Management**: Proper connection cleanup

### 📝 **Code Quality**
- **English Comments**: Consistent language throughout
- **Type Safety**: Strong typing with parameter structs
- **Clean API**: Intuitive method names and organization
- **No Duplicates**: Eliminated duplicate code and functions

## Usage

### Basic Setup

```go
// Get singleton client
client := pg_client.GetClient()
defer client.Close()

// Test connection
ctx := context.Background()
if err := client.Ping(ctx); err != nil {
    log.Fatal("Database connection failed:", err)
}
```

### Workflow Operations

```go
workflows := client.Workflows()

// Create workflow
workflow, err := workflows.Create(ctx, "My Workflow")
if err != nil {
    return err
}

// Get by ID
workflow, err := workflows.GetByID(ctx, workflowID)

// List with pagination
workflowList, err := workflows.List(ctx, 10, 0)

// Update
workflow, err := workflows.Update(ctx, workflowID, "New Name")

// Delete
err := workflows.Delete(ctx, workflowID)

// Get executions
executions, err := workflows.GetExecutions(ctx, workflowID)
```

### Execution Operations

```go
executions := client.Executions()

// Create execution
execution, err := executions.Create(ctx, pg_client.CreateExecutionParams{
    WorkflowID:    workflowID,
    Status:        "running",
    StartedAt:     time.Now().Unix(),
    NumberOfNodes: 5,
})

// Update execution
execution, err := executions.Update(ctx, executionID, pg_client.UpdateExecutionParams{
    Status:     "completed",
    EndedAt:    &endTime,
    DurationMs: &duration,
    GlobalLogs: []string{"Log 1", "Log 2"},
})

// List executions
executions, err := executions.List(ctx, 10, 0)

// List by workflow
executions, err := executions.ListByWorkflow(ctx, workflowID, 10, 0)
```

### Transactions

```go
err := client.Tx(ctx, func(tx *ent.Tx) error {
    // All operations within this function are in a transaction
    workflow1, err := tx.Workflow.Create().SetName("Workflow 1").Save(ctx)
    if err != nil {
        return err // Automatic rollback
    }
    
    workflow2, err := tx.Workflow.Create().SetName("Workflow 2").Save(ctx)
    if err != nil {
        return err // Automatic rollback
    }
    
    return nil // Automatic commit
})
```

### Testing

```go
// Create test client
config := &pg_client.Config{
    Host:     "localhost",
    Port:     "5432",
    User:     "test_user",
    Password: "test_password",
    DB:       "test_db",
    EnableDebug: true,
}

testClient, err := pg_client.NewClient(config)
if err != nil {
    t.Fatal(err)
}
defer testClient.Close()
```

## Configuration

Environment variables:

```bash
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=xka
POSTGRES_MAX_OPEN_CONNS=25
POSTGRES_MAX_IDLE_CONNS=5
POSTGRES_CONN_MAX_LIFETIME_MINUTES=5
POSTGRES_DEBUG=false
```

## Migration Guide

### Old Usage → New Usage

```go
// OLD
db := pg_client.GetClient()
workflow, err := db.CreateWorkflow(ctx, "name")
execution, err := db.CreateWorkflowExecution(ctx, workflowID, "running", startTime, 5)

// NEW
client := pg_client.GetClient()
workflow, err := client.Workflows().Create(ctx, "name")
execution, err := client.Executions().Create(ctx, pg_client.CreateExecutionParams{
    WorkflowID:    workflowID,
    Status:        "running", 
    StartedAt:     startTime,
    NumberOfNodes: 5,
})
```

## Benefits

1. **Better Organization**: Clear separation of concerns with service pattern
2. **Improved Performance**: Proper connection pooling and lifecycle management
3. **Enhanced Reliability**: Consistent error handling and input validation
4. **Easier Testing**: Dedicated test client creation
5. **Cleaner Code**: Eliminated duplicates and improved readability
6. **Transaction Support**: Built-in transaction helpers
7. **Type Safety**: Strong typing with parameter structs