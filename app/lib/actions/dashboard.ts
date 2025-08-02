'use server'

import { getCachedWorkflows, getCachedStats } from '../cache/workflowCache'
import { isDatabaseAvailable } from '../utils/databaseStatus'

export async function getDashboardData() {
  try {
    const [workflows, stats, dbStatus] = await Promise.all([
      getCachedWorkflows(),
      getCachedStats(),
      isDatabaseAvailable()
    ])

    return {
      workflows,
      stats,
      dbStatus,
      error: null
    }
  } catch (error: any) {
    return {
      workflows: [],
      stats: {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        failureRate: 0,
        avgRuntime: 0
      },
      dbStatus: false,
      error: error.message || 'Failed to load dashboard data'
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