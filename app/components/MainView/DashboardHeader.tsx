import React from 'react'
import { FiPlus } from 'react-icons/fi'
import { RefreshButton } from '../ui/RefreshButton'

export function DashboardHeader() {
  return (
    <div className="border-b border-zinc-800 shadow-lg">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Tableau de bord
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Vue d'ensemble de vos workflows et exécutions
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <RefreshButton />
            
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 shadow-sm">
              <FiPlus className="w-5 h-5" />
              <span>Nouveau Workflow</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}