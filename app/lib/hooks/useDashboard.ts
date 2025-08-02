'use client'

import useSWR from 'swr'
import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { getDashboardData } from '../actions/dashboard'

export function useDashboard() {
  const previousDbStatus = useRef<boolean | null>(null)
  
  const { data, error, mutate, isLoading } = useSWR(
    'dashboard-data',
    getDashboardData,
    {
      refreshInterval: 30000, // Polling unifié toutes les 30 secondes
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      errorRetryCount: 2,
      errorRetryInterval: 10000,
      onError: (error) => {
        console.warn('Dashboard data fetch failed:', error)
      }
    }
  )

  // Gérer les notifications de changement d'état de la DB
  useEffect(() => {
    if (data?.dbStatus !== undefined && previousDbStatus.current !== null) {
      // Si la DB redevient disponible
      if (!previousDbStatus.current && data.dbStatus) {
        toast.success('Base de données reconnectée !', {
          duration: 4000,
          icon: '🟢'
        })
      }
      // Si la DB devient indisponible
      else if (previousDbStatus.current && !data.dbStatus) {
        toast.error('Connexion à la base de données perdue', {
          duration: 6000,
          icon: '🔴'
        })
      }
    }
    
    if (data?.dbStatus !== undefined) {
      previousDbStatus.current = data.dbStatus
    }
  }, [data?.dbStatus])

  return {
    workflows: data?.workflows || [],
    stats: data?.stats || {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      failureRate: 0,
      avgRuntime: 0
    },
    dbStatus: data?.dbStatus ?? true,
    isLoading,
    error: error || data?.error,
    refresh: mutate
  }
}