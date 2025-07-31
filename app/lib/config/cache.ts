/**
 * Configuration du cache pour l'application
 */

export const CACHE_CONFIG = {
  // Durées de cache en secondes
  WORKFLOWS: {
    REVALIDATE: 300 as const, // 5 minutes
    TAGS: ['workflows'] as string[]
  },
  
  WORKFLOW_DETAILS: {
    REVALIDATE: 180 as const, // 3 minutes
    TAGS: (id: string) => [`workflow-${id}`, 'workflows'] as string[]
  },
  
  EXECUTIONS: {
    REVALIDATE: 60 as const, // 1 minute
    TAGS: ['executions'] as string[]
  },
  
  STATS: {
    REVALIDATE: 300 as const, // 5 minutes
    TAGS: ['stats', 'workflows', 'executions'] as string[]
  }
}

/**
 * Tags de cache utilisés dans l'application
 */
export const CACHE_TAGS = {
  WORKFLOWS: 'workflows',
  EXECUTIONS: 'executions',
  STATS: 'stats',
  WORKFLOW: (id: string) => `workflow-${id}`,
  EXECUTION: (id: string) => `execution-${id}`
} as const