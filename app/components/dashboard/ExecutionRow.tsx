import React from 'react'
import { format, parseISO } from 'date-fns'
import { getStatusBadgeClasses } from '@/app/utils/dateUtils'

interface Execution {
  id: string
  workflowName: string
  status: string
  startTime: string
  duration: number
  nodeCount: number
}

interface ExecutionRowProps {
  execution: Execution
}

export function ExecutionRow({ execution }: ExecutionRowProps) {
  const formatTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'HH:mm')
    } catch (error) {
      console.warn('Invalid date string:', dateString)
      return '--:--'
    }
  }

  return (
    <tr className="border-b border-zinc-800 hover:bg-zinc-800/30 transition-colors">
      <td className="py-3 px-4">
        <div className="font-medium text-white text-sm">{execution.workflowName}</div>
      </td>
      <td className="py-3 px-4">
        <span className={getStatusBadgeClasses(execution.status)}>
          {execution.status === 'success' ? 'Success' : 'Failed'}
        </span>
      </td>
      <td className="py-3 px-4 text-sm text-zinc-400">
        {formatTime(execution.startTime)}
      </td>
      <td className="py-3 px-4 text-sm text-zinc-400">
        {execution.duration}s
      </td>
      <td className="py-3 px-4 text-sm text-zinc-400">
        {execution.nodeCount} nodes
      </td>
    </tr>
  )
}