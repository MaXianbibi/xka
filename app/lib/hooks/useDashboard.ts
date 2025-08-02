'use client'

import useSWR from 'swr'
import { useEffect, useRef } from 'react'
import { showToast } from '../utils/toast'

import { getDashboardData } from '../actions/dashboard'

export function useDashboard() {
  const previousDbStatus = useRef<boolean | null>(null)
  const isFirstLoad = useRef(true)

  const { data, mutate, isLoading } = useSWR(
    'dashboard-data',
    getDashboardData,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      errorRetryCount: 1,
      errorRetryInterval: 10000,
      onSuccess: () => {
        isFirstLoad.current = false
      },
      onError: (error) => {
        if (!isFirstLoad.current) {
          console.warn('Dashboard data fetch failed:', error)
        }
      }
    }
  )

  // Gérer les notifications de changement d'état de la DB
  useEffect(() => {
    if (!isFirstLoad.current && data?.dbStatus !== undefined && previousDbStatus.current !== null) {
      if (!previousDbStatus.current && data.dbStatus) {
        showToast.success('Base de données reconnectée !')
      } else if (previousDbStatus.current && !data.dbStatus) {
        showToast.error('Connexion à la base de données perdue')
      }
    }

    if (data?.dbStatus !== undefined) {
      previousDbStatus.current = data.dbStatus
    }
  }, [data?.dbStatus])

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