import React from 'react'
import { ExecutionRow } from './ExecutionRow'

interface Execution {
  id: string
  workflowName: string
  status: string
  startTime: string
  duration: number
  nodeCount: number
}

interface ExecutionHistoryProps {
  executions: Execution[]
}

export function ExecutionHistory({ executions }: ExecutionHistoryProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">
          Historique des exécutions
        </h2>
        <div className="flex items-center space-x-4">
          <select className="bg-zinc-800/50 border border-zinc-800 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-zinc-800 transition-colors">
            <option>Toutes les exécutions</option>
            <option>Succès uniquement</option>
            <option>Échecs uniquement</option>
          </select>
        </div>
      </div>

      <div className="bg-gradient-to-b from-zinc-950 to-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-lg">
        <table className="w-full">
          <thead className="bg-zinc-800/50 border-b border-zinc-800">
            <tr>
              <th className="text-left py-4 px-4 font-medium text-zinc-300 text-sm">
                Workflow
              </th>
              <th className="text-left py-4 px-4 font-medium text-zinc-300 text-sm">
                Statut
              </th>
              <th className="text-left py-4 px-4 font-medium text-zinc-300 text-sm">
                Heure
              </th>
              <th className="text-left py-4 px-4 font-medium text-zinc-300 text-sm">
                Durée
              </th>
              <th className="text-left py-4 px-4 font-medium text-zinc-300 text-sm">
                Nœuds
              </th>
            </tr>
          </thead>
          <tbody>
            {executions.map((execution) => (
              <ExecutionRow key={execution.id} execution={execution} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}