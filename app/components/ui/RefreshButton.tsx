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
      // Le redirect dans l'action gère le rafraîchissement
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error)
      setIsRefreshing(false)
    }
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="group relative bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 text-white px-3.5 py-3.5 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm marching-border-secondary overflow-hidden"
      title="Rafraîchir les données"
    >
      <FiRefreshCw
        className={`w-5 h-5 transition-transform duration-300 ${
          isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'
        }`}
      />
      
      {/* Pulse effect when refreshing */}
      {isRefreshing && (
        <div className="absolute inset-0 bg-zinc-600/20 animate-pulse rounded-lg" />
      )}
    </button>
  )
}