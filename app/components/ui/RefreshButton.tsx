'use client'

import React, { useState } from 'react'
import { FiRefreshCw } from 'react-icons/fi'
import { refreshWorkflowsAction } from '@/app/lib/actions/workflowActions'

export function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshWorkflowsAction()
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/50 text-white px-3.5 py-3.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
      title="Rafraîchir les données"
    >
      <FiRefreshCw
        className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
      />
    </button>
  )
}