'use client'

import { DatabaseAlert } from '../ui/DatabaseAlert'
import { StatsOverview } from '../MainView/StatsOverview'
import { DashboardContent } from '../MainView/DashboardContent'
import { StatsSkeleton, WorkflowsSkeleton, ErrorBoundary, Button } from '../ui'
import { useDashboard } from '@/app/lib/hooks/useDashboard'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface DashboardClientProps {
  initialData: {
    workflows: any[]
    stats: any
    dbStatus: boolean
  }
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const { workflows, stats, dbStatus, isLoading, error, refresh } = useDashboard()

  const handleRetry = () => {
    refresh()
  }

  // LOGIQUE OPTIMISTE : Utiliser les données initiales jusqu'à ce qu'on ait des données client
  // Cela évite le flash d'erreur au chargement
  const currentWorkflows = workflows.length > 0 ? workflows : initialData.workflows
  const currentStats = stats.totalExecutions > 0 || !isLoading ? stats : initialData.stats
  const currentDbStatus = dbStatus !== undefined ? dbStatus : initialData.dbStatus

  // CAS 1: Base de données confirmée offline après vérification
  if (currentDbStatus === false && !isLoading) {
    return (
      <>
        <DatabaseAlert isVisible={true} onRetry={handleRetry} delay={500} />
        <div className="p-6 space-y-8">
          <StatsSkeleton />
          <WorkflowsSkeleton />
        </div>
      </>
    )
  }

  // CAS 2: Erreur confirmée après chargement (pas pendant l'hydratation)
  if (error && !isLoading && currentDbStatus !== false) {
    return (
      <div className="p-6">
        <div className="p-6 bg-red-900/20 border border-red-600/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-red-400 font-medium text-sm mb-2">
                Erreur de chargement
              </h3>
              <p className="text-red-300/80 text-xs mb-4">
                {error}
              </p>
              <Button
                onClick={handleRetry}
                variant="danger"
                size="sm"
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Réessayer
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // CAS 3: Affichage normal avec données optimistes
  return (
    <div className="p-6 space-y-8">
      <ErrorBoundary>
        {isLoading && currentStats.totalExecutions === 0 ? (
          <StatsSkeleton />
        ) : (
          <StatsOverview stats={currentStats} />
        )}
      </ErrorBoundary>

      <ErrorBoundary>
        {isLoading && currentWorkflows.length === 0 ? (
          <WorkflowsSkeleton />
        ) : (
          <DashboardContent workflows={currentWorkflows} executions={[]} />
        )}
      </ErrorBoundary>
    </div>
  )
}