import React from 'react'
import { WorkflowCardServer } from '../server/WorkflowCardServer'

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
            <select className="bg-zinc-800/60 border border-zinc-700/50 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 hover:bg-zinc-800 scrollbar-thin">
              <option>All tags</option>
              <option>Authentication</option>
              <option>Finance</option>
              <option>Marketing</option>
              <option>Integration</option>
              <option>Operations</option>
            </select>
            <select className="bg-zinc-800/60 border border-zinc-700/50 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 hover:bg-zinc-800 scrollbar-thin">
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
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="text-center space-y-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center">
                  <svg className="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white tracking-tight">No workflows yet</h3>
                <p className="text-zinc-400 text-sm max-w-sm mx-auto leading-relaxed">
                  Create your first workflow to get started with automation and streamline your processes
                </p>
              </div>

              <button className="group relative overflow-hidden bg-zinc-950 text-zinc-400 px-10 py-5 rounded-xl font-medium transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-zinc-600/50 focus:ring-offset-2 focus:ring-offset-zinc-950">
                {/* Rotating border container */}
                <div className="absolute inset-0  transition-transform duration-700 ease-out">
                  <div className="w-full h-full border-2 border-dashed border-zinc-700 group-hover:border-zinc-500 rounded-xl transition-colors duration-300" />
                </div>

                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-800/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />

                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-zinc-600/20 to-transparent" />

                {/* Content */}
                <span className="relative z-10 flex items-center space-x-3 group-hover:text-zinc-200 transition-colors duration-300">
                  <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Create New Workflow</span>
                </span>

                {/* Pulse effect on hover */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 group-hover:animate-ping bg-zinc-700/20 pointer-events-none" style={{ animationDuration: '2s' }} />
              </button>

              {/* Subtle hint text */}
              <p className="text-xs text-zinc-600 animate-in fade-in-0 duration-1000 delay-500">
                Click to start building your automation
              </p>
            </div>
          </div>
        ) : (
          workflows.map((workflow, index) => (
            <div
              key={workflow.id}
              className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <WorkflowCardServer workflow={workflow} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}