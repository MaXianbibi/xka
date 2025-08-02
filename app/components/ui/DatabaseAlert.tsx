'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from './Button'
import { SmoothTransition } from './SmoothTransition'

interface DatabaseAlertProps {
  isVisible: boolean
  onRetry?: () => void
  delay?: number
}

export function DatabaseAlert({ isVisible, onRetry, delay = 1000 }: DatabaseAlertProps) {
  const [isRetrying, setIsRetrying] = useState(false)
  const [shouldShow, setShouldShow] = useState(false)

  // Délai avant d'afficher l'alerte pour éviter le flash au chargement
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShouldShow(true), delay)
      return () => clearTimeout(timer)
    } else {
      setShouldShow(false)
    }
  }, [isVisible, delay])

  const handleRetry = async () => {
    if (!onRetry) return
    setIsRetrying(true)
    await onRetry()
    setIsRetrying(false)
  }

  return (
    <SmoothTransition show={shouldShow}>
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
          <Button
            onClick={handleRetry}
            isLoading={isRetrying}
            size="sm"
            className="bg-yellow-800/30 hover:bg-yellow-800/50 border-yellow-600/30 text-yellow-200 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            {isRetrying ? 'Vérification...' : 'Réessayer'}
          </Button>
        )}
      </div>
    </SmoothTransition>
  )
}