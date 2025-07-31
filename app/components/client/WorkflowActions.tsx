'use client'

import React, { useState } from 'react'
import { FiEdit2, FiCopy, FiTrash2, FiMoreHorizontal, FiPlay } from 'react-icons/fi'
import { clsx } from 'clsx'
import { ActionButton } from '../ui/ActionButton'

interface Workflow {
  id: string
  name: string
  isActive: boolean
}

interface WorkflowActionsProps {
  workflow: Pick<Workflow, 'id' | 'name' | 'isActive'>
}

export function WorkflowActions({ workflow }: WorkflowActionsProps) {
  const [showActions, setShowActions] = useState(false)

  return (
    <div className="flex items-center space-x-1">
      {/* Quick Action - Run */}
      <ActionButton
        variant={workflow.isActive ? "action" : "secondary"}
        disabled={!workflow.isActive}
        className={clsx(
          'p-1.5',
          !workflow.isActive && 'opacity-40'
        )}
        onClick={() => console.log('Run workflow')}
      >
        <FiPlay className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-200" />
      </ActionButton>

      {/* Actions Menu */}
      <div className="relative">
        <ActionButton
          variant="secondary"
          className="p-1.5"
          onClick={() => setShowActions(!showActions)}
        >
          <FiMoreHorizontal className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
        </ActionButton>
        
        {showActions && (
          <div className="absolute right-0 top-full mt-1 bg-zinc-800/95 backdrop-blur-sm border border-zinc-700 rounded-lg shadow-lg z-10 min-w-[140px] animate-in fade-in-0 slide-in-from-top-2 duration-200 max-h-48 overflow-auto dropdown-scroll">
            <div className="p-1 space-y-1">
              <ActionButton
                variant="secondary"
                size="sm"
                className="w-full justify-start text-left"
                onClick={() => console.log('Rename')}
              >
                <FiEdit2 className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                <span>Rename</span>
              </ActionButton>
              
              <ActionButton
                variant="secondary"
                size="sm"
                className="w-full justify-start text-left"
                onClick={() => console.log('Duplicate')}
              >
                <FiCopy className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                <span>Duplicate</span>
              </ActionButton>
              
              <ActionButton
                variant="danger"
                size="sm"
                className="w-full justify-start text-left"
                onClick={() => console.log('Delete')}
              >
                <FiTrash2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                <span>Delete</span>
              </ActionButton>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}