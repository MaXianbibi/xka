
import React, { Suspense } from 'react'
import { DashboardHeader } from './components/MainView/DashboardHeader'
import { StatsOverview } from './components/MainView/StatsOverview'
import { DashboardContent } from '@/app/components/MainView/DashboardContent'
import { StatsSkeleton } from './components/skeletons/StatsSkeleton'
import { WorkflowsSkeleton } from './components/skeletons/WorkflowsSkeleton'
import { getCachedWorkflows, getCachedStats } from './lib/cache/workflowCache'

// Server Components pour les données async
async function StatsSection() {
  const stats = await getCachedStats()
  return <StatsOverview stats={stats} />
}

async function WorkflowsSection() {
  const workflows = await getCachedWorkflows()
  return <DashboardContent workflows={workflows} executions={[]} />
}



export default function Home() {
  return (
    <div className="flex-1 bg-zinc-950 overflow-auto custom-scrollbar">
      <DashboardHeader />

      <div className="p-6 space-y-8">
        {/* Statistiques avec Suspense */}
        <Suspense fallback={<StatsSkeleton />}>
          <StatsSection />
        </Suspense>

        {/* Workflows avec Suspense */}
        <Suspense fallback={<WorkflowsSkeleton />}>
          <WorkflowsSection />
        </Suspense>
      </div>
    </div>
  )
}
