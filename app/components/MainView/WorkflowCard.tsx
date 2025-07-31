"use client"

import React, { useState } from 'react'
import { FiEdit2, FiCopy, FiTrash2, FiMoreHorizontal, FiPlay } from 'react-icons/fi'
import { clsx } from 'clsx'
import { formatRelativeTime, getTagColor } from '@/app/lib/utils/dateUtils'
import { Switch } from '@/app/components/ui/Switch'

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

interface WorkflowCardProps {
  workflow: Workflow
}

export function WorkflowCard({ workflow }: WorkflowCardProps) {
  const [showActions, setShowActions] = useState(false)

  return (
    <div className="px-6 py-3 hover:bg-zinc-800/30 transition-colors group">
      {/* Single line - Compact layout */}
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

        {/* Compact metadata */}
        <div className="flex-1 flex items-center space-x-3 text-xs text-zinc-500 min-w-0">
          <span className="whitespace-nowrap">Exec: {formatRelativeTime(workflow.lastExecuted)}</span>
          <span className="text-zinc-600">•</span>
          <span className="whitespace-nowrap">Mod: {formatRelativeTime(workflow.lastUpdated)}</span>
          <span className="text-zinc-600">•</span>
          <span className="whitespace-nowrap">Created: {formatRelativeTime(workflow.createdAt)}</span>
          <span className="text-zinc-600">•</span>
          <span className="font-medium whitespace-nowrap">{workflow.executions} runs</span>
        </div>

        {/* Always visible actions */}
        <div className="flex items-center space-x-1">
          {/* Quick Action - Always visible */}
          <button
            className={clsx(
              'p-1.5 rounded-md transition-colors',
              'text-zinc-500 hover:text-blue-400 hover:bg-blue-400/10',
              workflow.isActive ? 'hover:scale-105' : 'cursor-not-allowed opacity-40'
            )}
            disabled={!workflow.isActive}
            title="Run workflow"
          >
            <FiPlay className="w-3.5 h-3.5" />
          </button>

          {/* Actions Menu - Always visible */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1.5 hover:bg-zinc-700 rounded-md transition-colors text-zinc-400 hover:text-zinc-300"
            >
              <FiMoreHorizontal className="w-4 h-4" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-full mt-1 bg-zinc-800/95 backdrop-blur-sm border border-zinc-700 rounded-lg shadow-lg z-10 min-w-[140px]">
                <button className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-700 flex items-center space-x-2 rounded-t-lg">
                  <FiEdit2 className="w-4 h-4" />
                  <span>Rename</span>
                </button>
                <button className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-700 flex items-center space-x-2">
                  <FiCopy className="w-4 h-4" />
                  <span>Duplicate</span>
                </button>
                <button className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-zinc-700 flex items-center space-x-2 rounded-b-lg">
                  <FiTrash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}