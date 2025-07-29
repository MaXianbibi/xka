import React from 'react'

interface TabNavigationProps {
  activeTab: 'overview' | 'history'
  onTabChange: (tab: 'overview' | 'history') => void
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="border-b border-zinc-800">
      <nav className="flex space-x-8">
        <button
          onClick={() => onTabChange('overview')}
          className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'overview'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-300'
          }`}
        >
          Vue d'ensemble
        </button>
        <button
          onClick={() => onTabChange('history')}
          className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'history'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-300'
          }`}
        >
          Historique
        </button>
      </nav>
    </div>
  )
}