'use client'

import useSWR from 'swr'
import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { getDashboardData } from '../actions/dashboard'

export function useDashboard() {
  const previousDbStatus = useRef<boolean | null>(null)
  const isFirstLoad = useRef(true)

  const { data, error, mutate, isLoading } = useSWR(
    'dashboard-data',
    getDashboardData,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      errorRetryCount: 1, // Réduire les retry pour éviter les erreurs répétées
      errorRetryInterval: 10000,
      // Pas de fallbackData pour éviter les états incohérents
      onSuccess: () => {
        isFirstLoad.current = false
      },
      onError: (error) => {
        // Ne logger que si ce n'est pas le premier chargement
        if (!isFirstLoad.current) {
          console.warn('Dashboard data fetch failed:', error)
        }
      }
    }
  )

  // Gérer les notifications de changement d'état de la DB (seulement après le premier chargement)
  useEffect(() => {
    if (!isFirstLoad.current && data?.dbStatus !== undefined && previousDbStatus.current !== null) {
      if (!previousDbStatus.current && data.dbStatus) {
        toast.success('Base de données reconnectée !', {
          duration: 4000,
          icon: '�'
        })
      } else if (previousDbStatus.current && !data.dbStatus) {
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

  // État stable : ne pas changer brusquement pendant l'hydratation
  const dbStatus = data?.dbStatus
  const finalError = !isFirstLoad.current ? (data?.error || null) : null

  return {
    workflows: data?.workflows || [],
    stats: data?.stats || {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      failureRate: 0,
      avgRuntime: 0
    },
    dbStatus,
    isLoading: isLoading || isFirstLoad.current,
    error: finalError,
    refresh: mutate
  }
}