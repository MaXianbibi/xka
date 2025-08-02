'use client'

import { DatabaseAlert } from '../ui/DatabaseAlert'
import { StatsOverview } from '../MainView/StatsOverview'
import { DashboardContent } from '../MainView/DashboardContent'
import { StatsSkeleton, WorkflowsSkeleton } from '../ui/Skeleton'
import { ErrorBoundary } from '../ui/ErrorBoundary'
import { Button } from '../ui/Button'
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

  // LOGIQUE SIMPLE : 
  // 1. DB offline → Alerte jaune + skeletons
  // 2. DB online + erreur → Message rouge
  // 3. Sinon → Contenu normal

  // CAS 1: Base de données offline
  if (!dbStatus) {
    return (
      <>
        <DatabaseAlert isVisible={true} onRetry={handleRetry} />
        <div className="p-6 space-y-8">
          <StatsSkeleton />
          <WorkflowsSkeleton />
        </div>
      </>
    )
  }

  // CAS 2: Base de données online mais erreur de chargement
  if (error) {
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

  // CAS 3: Tout va bien - afficher le contenu
  return (
    <div className="p-6 space-y-8">
      <ErrorBoundary>
        {isLoading ? <StatsSkeleton /> : <StatsOverview stats={stats} />}
      </ErrorBoundary>

      <ErrorBoundary>
        {isLoading ? <WorkflowsSkeleton /> : <DashboardContent workflows={workflows} executions={[]} />}
      </ErrorBoundary>
    </div>
  )
}