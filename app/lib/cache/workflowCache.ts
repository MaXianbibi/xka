import { unstable_cache } from 'next/cache'
import { getAllWorkflows } from '../drizzle/operations'
import { CACHE_CONFIG } from '../config/cache'

// Interface pour les workflows transformés
interface SimpleWorkflow {
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

// Interface pour les stats
interface Stats {
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number
  failureRate: number
  avgRuntime: number
}

// Fonction pour transformer les workflows
function transformWorkflows(workflows: any[]): SimpleWorkflow[] {
  return workflows.map(workflow => ({
    id: workflow.id,
    name: workflow.name,
    tag: 'General',
    isActive: true,
    lastExecuted: 'Never',
    lastUpdated: workflow.updatedAt.toISOString(),
    createdAt: workflow.createdAt.toISOString(),
    status: 'unknown',
    executions: 0,
    avgRuntime: 0
  }))
}

// Cache les workflows avec transformation
export const getCachedWorkflows = unstable_cache(
  async (): Promise<SimpleWorkflow[]> => {
    try {
      const workflows = await getAllWorkflows({
        orderBy: 'updatedAt',
        order: 'desc'
      })
      return transformWorkflows(workflows)
    } catch (error) {
      console.error('Erreur lors du chargement des workflows:', error)
      return []
    }
  },
  ['workflows-transformed'],
  {
    revalidate: CACHE_CONFIG.WORKFLOWS.REVALIDATE,
    tags: CACHE_CONFIG.WORKFLOWS.TAGS
  }
)

// Cache les statistiques
export const getCachedStats = unstable_cache(
  async (): Promise<Stats> => {
    try {
      const workflows = await getAllWorkflows()
      
      // Calcul des stats basé sur les workflows
      return {
        totalExecutions: workflows.length,
        successfulExecutions: 0,
        failedExecutions: 0,
        failureRate: 0,
        avgRuntime: 0
      }
    } catch (error) {
      console.error('Erreur lors du calcul des stats:', error)
      return {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        failureRate: 0,
        avgRuntime: 0
      }
    }
  },
  ['dashboard-stats'],
  {
    revalidate: CACHE_CONFIG.WORKFLOWS.REVALIDATE,
    tags: ['stats', ...CACHE_CONFIG.WORKFLOWS.TAGS]
  }
)