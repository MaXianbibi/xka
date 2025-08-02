'use client'

import { DatabaseAlert } from '../ui/DatabaseAlert'
import { StatsOverview } from '../MainView/StatsOverview'
import { DashboardContent } from '../MainView/DashboardContent'
import { StatsSkeleton } from '../skeletons/StatsSkeleton'
import { WorkflowsSkeleton } from '../skeletons/WorkflowsSkeleton'
import { ErrorBoundary } from '../ui/ErrorBoundary'
import { useDashboard } from '@/app/lib/hooks/useDashboard'

interface DashboardClientProps {
  initialData: {
    workflows: any[]
    stats: any
    dbStatus: boolean
  }
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const { workflows, stats, dbStatus, isLoading, refresh } = useDashboard()

  // Utiliser les données initiales pendant le chargement
  const currentWorkflows = isLoading ? initialData.workflows : workflows
  const currentStats = isLoading ? initialData.stats : stats
  const currentDbStatus = isLoading ? initialData.dbStatus : dbStatus

  return (
    <>
      <DatabaseAlert 
        isVisible={!currentDbStatus} 
        onRetry={refresh}
      />
      
      <div className="p-6 space-y-8">
        {/* Statistiques */}
        <ErrorBoundary>
          {isLoading && !currentStats ? (
            <StatsSkeleton />
          ) : (
            <StatsOverview stats={currentStats} />
          )}
        </ErrorBoundary>

        {/* Workflows */}
        <ErrorBoundary>
          {isLoading && !currentWorkflows.length ? (
            <WorkflowsSkeleton />
          ) : (
            <DashboardContent workflows={currentWorkflows} executions={[]} />
          )}
        </ErrorBoundary>
      </div>
    </>
  )
}