import React from 'react'
import { WorkflowsOverview } from './WorkflowsOverview'

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

interface DashboardContentProps {
  workflows: SimpleWorkflow[]
  executions: any[] // Gardé pour la compatibilité mais non utilisé
}

export function DashboardContent({ workflows }: DashboardContentProps) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">Workflows</h2>
        <p className="text-zinc-400">Gérez et surveillez vos workflows d'automatisation</p>
      </div>

      <WorkflowsOverview workflows={workflows} />
    </div>
  )
}