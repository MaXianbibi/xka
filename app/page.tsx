
import React from 'react'
import { unstable_cache } from 'next/cache'
import { DashboardHeader } from './components/MainView/DashboardHeader'
import { StatsOverview } from './components/MainView/StatsOverview'
import { DashboardContent } from '@/app/components/MainView/DashboardContent'
import {
  getAllWorkflows
} from './lib/drizzle/operations'
import { CACHE_CONFIG } from './lib/config/cache'

// Interface simple pour les workflows
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



// Cache les workflows avec configuration centralisée
const getCachedWorkflows = unstable_cache(
  async () => {
    try {
      const workflows = await getAllWorkflows({
        orderBy: 'updatedAt',
        order: 'desc'
      })
      return workflows
    } catch (error) {
      console.error('Erreur lors du chargement des workflows:', error)
      return []
    }
  },
  ['workflows-list'], // Cache key
  {
    revalidate: CACHE_CONFIG.WORKFLOWS.REVALIDATE,
    tags: CACHE_CONFIG.WORKFLOWS.TAGS
  }
)

// Fonction pour transformer les workflows simples
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



export default async function Home() {
  // Récupérer les workflows avec cache
  const workflows = await getCachedWorkflows()

  // Transformer les workflows
  const transformedWorkflows = transformWorkflows(workflows)

  return (
    <div className="flex-1 bg-zinc-950 overflow-auto">
      <DashboardHeader />

      <div className="p-6 space-y-8">
        {/* Statistiques simples basées sur les workflows */}
        <StatsOverview stats={{
          totalExecutions: workflows.length,
          successfulExecutions: 0,
          failedExecutions: 0,
          failureRate: 0,
          avgRuntime: 0
        }} />

        <DashboardContent
          workflows={transformedWorkflows}
          executions={[]}
        />
      </div>
    </div>
  )
}
