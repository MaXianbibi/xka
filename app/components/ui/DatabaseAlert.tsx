'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useState } from 'react'

interface DatabaseAlertProps {
  isVisible: boolean
  onRetry?: () => void
}

export function DatabaseAlert({ isVisible, onRetry }: DatabaseAlertProps) {
  const [isRetrying, setIsRetrying] = useState(false)

  if (!isVisible) return null

  const handleRetry = async () => {
    if (!onRetry) return
    setIsRetrying(true)
    await onRetry()
    setIsRetrying(false)
  }

  return (
    <div className="mx-6 my-4 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg flex items-center gap-3">
      <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
      <div className="flex-1">
        <h3 className="text-yellow-400 font-medium text-sm">
          Base de données non disponible
        </h3>
        <p className="text-yellow-300/80 text-xs mt-1">
          Démarrez PostgreSQL avec{' '}
          <code className="bg-yellow-900/30 px-1 rounded text-yellow-200">
            docker-compose up
          </code>
        </p>
      </div>
      {onRetry && (
        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="flex items-center gap-2 px-3 py-1.5 bg-yellow-800/30 hover:bg-yellow-800/50 border border-yellow-600/30 rounded text-yellow-200 text-xs transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Vérification...' : 'Réessayer'}
        </button>
      )}
    </div>
  )
}