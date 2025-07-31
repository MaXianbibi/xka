import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { pgTable, uuid, varchar, timestamp, bigint, integer, text, json, pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Configuration de la base de données
const connectionString = `postgresql://${process.env.POSTGRES_USER || 'xka_user'}:${process.env.POSTGRES_PASSWORD || 'xka_password'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'xka'}`

// Client PostgreSQL
const client = postgres(connectionString)

// Enum pour le status des exécutions
export const statusEnum = pgEnum('workflowexecutionresult_status', ['success', 'error', 'running', 'skipped'])

// Schéma de la table workflows
export const workflows = pgTable('workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('create_time').defaultNow().notNull(),
  updatedAt: timestamp('update_time').defaultNow().notNull(),
})

// Schéma de la table workflow_execution_results
export const workflowExecutionResults = pgTable('workflowexecutionresults', {
  id: uuid('id').primaryKey().defaultRandom(),
  workflowId: uuid('workflow_id').notNull(),
  status: statusEnum('status').notNull(),
  startedAt: bigint('started_at', { mode: 'number' }).notNull(),
  endedAt: bigint('ended_at', { mode: 'number' }),
  durationMs: bigint('duration_ms', { mode: 'number' }),
  globalLogs: text('global_logs').array(),
  error: text('error'),
  meta: json('meta').$type<Record<string, any>>(),
  numberOfNodes: integer('number_of_nodes').default(0).notNull(),
  createdAt: timestamp('create_time').defaultNow().notNull(),
  updatedAt: timestamp('update_time').defaultNow().notNull(),
})

// Relations entre les tables
export const workflowsRelations = relations(workflows, ({ many }) => ({
  executions: many(workflowExecutionResults),
}))

export const workflowExecutionResultsRelations = relations(workflowExecutionResults, ({ one }) => ({
  workflow: one(workflows, {
    fields: [workflowExecutionResults.workflowId],
    references: [workflows.id],
  }),
}))

// Client Drizzle
export const db = drizzle(client, {
  schema: {
    workflows,
    workflowExecutionResults,
    workflowsRelations,
    workflowExecutionResultsRelations,
  },
})

// Types TypeScript inférés
export type Workflow = typeof workflows.$inferSelect
export type NewWorkflow = typeof workflows.$inferInsert
export type WorkflowExecutionResult = typeof workflowExecutionResults.$inferSelect
export type NewWorkflowExecutionResult = typeof workflowExecutionResults.$inferInsert

// Types avec relations
export type WorkflowWithExecutions = Workflow & {
  executions: WorkflowExecutionResult[]
}

export type WorkflowExecutionResultWithWorkflow = WorkflowExecutionResult & {
  workflow: Workflow
}

export default db