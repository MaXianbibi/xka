import React from 'react'
import { formatRelativeTime, getTagColor } from '@/app/lib/utils/dateUtils'
import { Switch } from '@/app/components/ui/Switch'
import { WorkflowActions } from '../client/WorkflowActions'

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

interface WorkflowCardServerProps {
  workflow: Workflow
}

export function WorkflowCardServer({ workflow }: WorkflowCardServerProps) {
  return (
    <div className="px-6 py-3 hover:bg-zinc-800/30 transition-colors group">
      <div className="flex items-center space-x-3">
        {/* Name */}
        <div className="w-48">
          <h4 className="font-medium text-white text-sm truncate" title={workflow.name}>
            {workflow.name}
          </h4>
        </div>

        {/* Tag */}
        <div className="w-24">
          <span className={getTagColor(workflow.tag)}>
            {workflow.tag}
          </span>
        </div>

        {/* Switch */}
        <div className="w-12 flex justify-center">
          <Switch 
            checked={workflow.isActive}
            onChange={() => {/* Handle toggle */}}
          />
        </div>

        {/* Metadata */}
        <div className="flex-1 flex items-center space-x-3 text-xs text-zinc-500 min-w-0">
          <span className="whitespace-nowrap">Exec: {formatRelativeTime(workflow.lastExecuted)}</span>
          <span className="text-zinc-600">•</span>
          <span className="whitespace-nowrap">Mod: {formatRelativeTime(workflow.lastUpdated)}</span>
          <span className="text-zinc-600">•</span>
          <span className="whitespace-nowrap">Created: {formatRelativeTime(workflow.createdAt)}</span>
          <span className="text-zinc-600">•</span>
          <span className="font-medium whitespace-nowrap">{workflow.executions} runs</span>
        </div>

        {/* Actions - Client Component */}
        <WorkflowActions workflow={workflow} />
      </div>
    </div>
  )
}