'use client'

import { useState } from 'react'
import { Button, Switch, Alert, Skeleton, ScrollArea, ErrorBoundary } from './index'
import { showToast } from '@/app/lib/utils/toast'

// Exemple d'utilisation du nouveau système UI optimisé
export function UIExample() {
  const [isLoading, setIsLoading] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [switchValue, setSwitchValue] = useState(false)

  const handleAsyncAction = async () => {
    setIsLoading(true)
    
    // Exemple avec toast promise
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.5) {
          resolve('Success!')
        } else {
          reject('Error!')
        }
      }, 2000)
    })

    try {
      await showToast.promise(promise, {
        loading: 'Traitement en cours...',
        success: 'Opération réussie !',
        error: 'Erreur lors du traitement'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold text-white">Exemples UI Optimisés</h2>
      
      {/* Buttons */}
      <div className="space-y-3">
        <h3 className="text-lg text-zinc-300">Boutons</h3>
        <div className="flex gap-3">
          <Button variant="primary" onClick={() => showToast.success('Succès !')}>
            Primary
          </Button>
          <Button variant="secondary" onClick={() => showToast.error('Erreur !')}>
            Secondary
          </Button>
          <Button variant="danger" onClick={() => setShowAlert(true)}>
            Danger
          </Button>
          <Button variant="ghost" isLoading={isLoading} onClick={handleAsyncAction}>
            Async Action
          </Button>
        </div>
      </div>

      {/* Switch */}
      <div className="space-y-3">
        <h3 className="text-lg text-zinc-300">Switch</h3>
        <div className="flex items-center gap-3">
          <Switch checked={switchValue} onChange={setSwitchValue} />
          <span className="text-zinc-400">
            {switchValue ? 'Activé' : 'Désactivé'}
          </span>
        </div>
      </div>

      {/* Alert */}
      <div className="space-y-3">
        <h3 className="text-lg text-zinc-300">Alertes</h3>
        <Alert
          isVisible={showAlert}
          variant="warning"
          title="Attention"
          description="Ceci est un exemple d'alerte avec délai d'affichage"
          onRetry={() => {
            setShowAlert(false)
            showToast.success('Alerte fermée !')
          }}
        />
      </div>

      {/* Skeletons */}
      <div className="space-y-3">
        <h3 className="text-lg text-zinc-300">Skeletons</h3>
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-8 w-1/4" />
        </div>
      </div>

      {/* ScrollArea */}
      <div className="space-y-3">
        <h3 className="text-lg text-zinc-300">Zone de défilement</h3>
        <ScrollArea variant="thin" maxHeight="150px" className="border border-zinc-700 rounded p-3">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="py-1 text-zinc-400">
              Ligne de contenu {i + 1}
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* ErrorBoundary */}
      <div className="space-y-3">
        <h3 className="text-lg text-zinc-300">Error Boundary</h3>
        <ErrorBoundary>
          <div className="p-3 bg-zinc-800 rounded text-zinc-300">
            Composant protégé par ErrorBoundary
          </div>
        </ErrorBoundary>
      </div>
    </div>
  )
}