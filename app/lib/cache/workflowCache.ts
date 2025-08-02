import { unstable_cache } from 'next/cache'
import { getAllWorkflows } from '../drizzle/operations'

export interface SimpleWorkflow {
  id: string
  name: string
  tag: string
  isActive: boolean
  lastExecuted: string
  lastUpdated: string
  createdAt: string
  status: string
  executions: number
  avgRuntime: number
}

export interface Stats {
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number
  failureRate: number
  avgRuntime: number
}

// Cache unifié pour les workflows
export const getCachedWorkflows = unstable_cache(
  async (): Promise<SimpleWorkflow[]> => {
    try {
      const workflows = await getAllWorkflows({
        orderBy: 'updatedAt',
        order: 'desc'
      })
      
      return workflows.map(workflow => ({
        id: workflow.id,
        name: workflow.name,
        tag: 'General',
        isActive: true,
        lastExecuted: 'Never',
        lastUpdated: workflow.updatedAt.toISOString(),
        createdAt: workflow.createdAt.toISOString(),
        status: 'active',
        executions: 0,
        avgRuntime: 0
      }))
    } catch (error) {
      // Re-throw l'erreur pour que la Server Action puisse la capturer
      throw error
    }
  },
  ['workflows'],
  { revalidate: 300, tags: ['workflows'] }
)

// Cache unifié pour les stats
export const getCachedStats = unstable_cache(
  async (): Promise<Stats> => {
    try {
      const workflows = await getAllWorkflows()
      
      return {
        totalExecutions: workflows.length,
        successfulExecutions: 0,
        failedExecutions: 0,
        failureRate: 0,
        avgRuntime: 0
      }
    } catch (error) {
      // Re-throw l'erreur pour que la Server Action puisse la capturer
      throw error
    }
  },
  ['stats'],
  { revalidate: 300, tags: ['stats', 'workflows'] }
)