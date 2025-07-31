// Export des opérations workflows
export {
  createWorkflow,
  createWorkflows,
  getAllWorkflows,
  getWorkflowById,
  getWorkflowWithExecutions,
  searchWorkflowsByName,
  getRecentWorkflows,
  countWorkflows,
  updateWorkflow,
  updateWorkflowName,
  deleteWorkflow,
  deleteWorkflows,
  deleteWorkflowWithExecutions,
  getWorkflowStats,
  getWorkflowsWithStats,
  workflowExists,
  isWorkflowNameTaken
} from './workflows'

// Export des opérations workflow executions
export {
  createWorkflowExecution,
  getWorkflowExecutions,
  getWorkflowExecutionById,
  getWorkflowExecutionWithWorkflow,
  getRecentExecutions,
  getRunningExecutions,
  getExecutionsInTimeRange,
  updateWorkflowExecution,
  completeWorkflowExecution,
  addLogsToExecution,
  deleteWorkflowExecution,
  deleteWorkflowExecutions,
  deleteOldExecutions,
  getExecutionStats,
  getWorkflowExecutionStats,
  getDailyExecutionStats,
  executionExists,
  getLastExecution
} from './workflowExecutions'

// Export du client et des types
export {
  db,
  workflows,
  workflowExecutionResults,
  statusEnum,
  type Workflow,
  type NewWorkflow,
  type WorkflowExecutionResult,
  type NewWorkflowExecutionResult,
  type WorkflowWithExecutions,
  type WorkflowExecutionResultWithWorkflow
} from '../drizzle'