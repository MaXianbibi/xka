'use server'

import { getCachedWorkflows, getCachedStats } from '../cache/workflowCache'
import { isDatabaseAvailable } from '../utils/databaseStatus'

export async function getDashboardData() {
  const defaultStats = {
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    failureRate: 0,
    avgRuntime: 0
  }

  // Stratégie simple : essayer de charger les workflows
  // Si ça échoue avec une erreur de connexion DB → DB offline
  // Sinon → DB online
  
  try {
    const workflows = await getCachedWorkflows()
    const stats = await getCachedStats()
    
    // Si on arrive ici, la DB fonctionne
    return {
      workflows,
      stats,
      dbStatus: true,
      error: null
    }
  } catch (err: any) {
    // Vérifier si c'est une erreur de connexion DB
    const isDbError = err.message?.includes('Database connection failed') || 
                      err.message?.includes('ECONNREFUSED') ||
                      err.message?.includes('Failed query')
    
    if (isDbError) {
      // DB offline
      return {
        workflows: [],
        stats: defaultStats,
        dbStatus: false,
        error: null // Pas d'erreur, juste DB offline
      }
    } else {
      // Autre erreur
      return {
        workflows: [],
        stats: defaultStats,
        dbStatus: true,
        error: err.message || 'Erreur de chargement'
      }
    }
  }
}

export async function checkDatabaseStatus() {
  try {
    const isAvailable = await isDatabaseAvailable()
    return { available: isAvailable, error: null }
  } catch (error: any) {
    return { available: false, error: error.message }
  }
}