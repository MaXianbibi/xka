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
      className="flex items-center space-x-2 px-3 py-2 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/50 text-white rounded-lg text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      title="Rafraîchir les données"
    >
      <FiRefreshCw 
        className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
      />
      <span>{isRefreshing ? 'Rafraîchissement...' : 'Rafraîchir'}</span>
    </button>
  )
}