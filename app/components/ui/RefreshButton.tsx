'use client'

import React, { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from './Button'
import { refreshWorkflowsAction } from '@/app/lib/actions/dashboard'

export function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshWorkflowsAction()
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error)
      setIsRefreshing(false)
    }
  }

  return (
    <Button
      onClick={handleRefresh}
      isLoading={isRefreshing}
      title="Rafraîchir les données"
      className="p-3"
    >
      <RefreshCw className={`w-5 h-5 ${isRefreshing ? '' : 'group-hover:rotate-180 transition-transform'}`} />
    </Button>
  )
}