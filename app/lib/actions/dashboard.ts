'use server'

import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { getCachedWorkflows, getCachedStats } from '../cache/workflowCache'
// import { isDatabaseAvailable } from '../utils/databaseStatus'
import { 
  createWorkflow, 
  updateWorkflow, 
  deleteWorkflow,
  type NewWorkflow 
} from '../drizzle/operations'

// ==================== DASHBOARD ACTIONS ====================

export async function getDashboardData() {
  const defaultStats = {
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    failureRate: 0,
    avgRuntime: 0
  }

  try {
    const workflows = await getCachedWorkflows()
    const stats = await getCachedStats()
    
    return {
      workflows,
      stats,
      dbStatus: true,
      error: null
    }
  } catch (err: any) {
    const isDbError = err.message?.includes('Database connection failed') || 
                      err.message?.includes('ECONNREFUSED') ||
                      err.message?.includes('Failed query')
    
    if (isDbError) {
      return {
        workflows: [],
        stats: defaultStats,
        dbStatus: false,
        error: null
      }
    } else {
      return {
        workflows: [],
        stats: defaultStats,
        dbStatus: true,
        error: err.message || 'Erreur de chargement'
      }
    }
  }
}

// ==================== WORKFLOW ACTIONS ====================

export async function createWorkflowAction(data: Omit<NewWorkflow, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const workflow = await createWorkflow(data)
    revalidateTag('workflows')
    revalidateTag('stats')
    return { success: true, workflow }
  } catch {
    return { success: false, error: 'Erreur lors de la création du workflow' }
  }
}

export async function updateWorkflowAction(
  id: string, 
  data: Partial<Omit<NewWorkflow, 'id' | 'createdAt'>>
) {
  try {
    const workflow = await updateWorkflow(id, data)
    revalidateTag('workflows')
    revalidateTag('stats')
    revalidateTag(`workflow-${id}`)
    return { success: true, workflow }
  } catch {
    return { success: false, error: 'Erreur lors de la mise à jour du workflow' }
  }
}

export async function deleteWorkflowAction(id: string) {
  try {
    const workflow = await deleteWorkflow(id)
    revalidateTag('workflows')
    revalidateTag('stats')
    revalidateTag(`workflow-${id}`)
    return { success: true, workflow }
  } catch {
    return { success: false, error: 'Erreur lors de la suppression du workflow' }
  }
}

export async function refreshWorkflowsAction() {
  revalidateTag('workflows')
  revalidateTag('stats')
  redirect('/')
}