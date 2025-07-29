import React from 'react'
import { FiPlay, FiCheckCircle, FiAlertTriangle, FiClock } from 'react-icons/fi'
import { StatItem } from './StatItem'

interface Stats {
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number
  failureRate: number
  avgRuntime: number
}

interface StatsOverviewProps {
  stats: Stats
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-x divide-zinc-800">
        <StatItem
          title="Exécutions totales"
          value={stats.totalExecutions.toLocaleString()}
          icon={FiPlay}
        />
        <StatItem
          title="Exécutions réussies"
          value={stats.successfulExecutions.toLocaleString()}
          subtitle={`${((stats.successfulExecutions / stats.totalExecutions) * 100).toFixed(1)}% de succès`}
          icon={FiCheckCircle}
        />
        <StatItem
          title="Taux d'échec"
          value={`${stats.failureRate}%`}
          subtitle={`${stats.failedExecutions} échecs`}
          icon={FiAlertTriangle}
        />
        <StatItem
          title="Temps d'exécution moyen"
          value={`${stats.avgRuntime}s`}
          icon={FiClock}
        />
      </div>
    </div>
  )
}