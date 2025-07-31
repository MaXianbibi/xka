import React from 'react'
import { WorkflowCard } from './WorkflowCard'

interface Workflow {
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

interface WorkflowsOverviewProps {
  workflows: Workflow[]
}

export function WorkflowsOverview({ workflows }: WorkflowsOverviewProps) {
  return (
    <div className="bg-gradient-to-b from-zinc-950 to-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl shadow-zinc-900/20">
      {/* Enhanced header with better visual hierarchy */}
      <div className="px-6 py-5 border-b border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-white">All workflows</h2>
            <div className="px-2 py-1 bg-zinc-800/50 rounded-md text-xs text-zinc-400 font-medium">
              {workflows.length} total
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select className="bg-zinc-800/60 border border-zinc-700/50 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 hover:bg-zinc-800">
              <option>All tags</option>
              <option>Authentication</option>
              <option>Finance</option>
              <option>Marketing</option>
              <option>Integration</option>
              <option>Operations</option>
            </select>
            <select className="bg-zinc-800/60 border border-zinc-700/50 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 hover:bg-zinc-800">
              <option>All statuses</option>
              <option>Active only</option>
              <option>Inactive only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enhanced workflows list with subtle separators */}
      <div className="divide-y divide-zinc-800/30">
        {workflows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="text-center space-y-4">
              <div>
                <h3 className="text-lg font-medium text-white mb-2">No workflows yet</h3>
                <p className="text-zinc-400 text-sm mb-6">Create your first workflow to get started with automation</p>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                Create New Workflow
              </button>
            </div>
          </div>
        ) : (
          workflows.map((workflow, index) => (
            <div
              key={workflow.id}
              className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <WorkflowCard workflow={workflow} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}