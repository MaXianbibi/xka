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
              Vue d&apos;ensemble de vos workflows et exécutions
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <RefreshButton />
            
            <button className="group relative bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 shadow-sm marching-border-primary overflow-hidden">
              <FiPlus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span>Nouveau Workflow</span>
              
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}