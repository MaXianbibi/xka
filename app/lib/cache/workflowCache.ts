import { revalidateTag } from 'next/cache'

/**
 * Utilitaires pour gérer le cache des workflows
 */

/**
 * Invalide le cache des workflows
 * À appeler après création, modification ou suppression d'un workflow
 */
export function invalidateWorkflowsCache() {
  revalidateTag('workflows')
}

/**
 * Invalide le cache d'un workflow spécifique
 */
export function invalidateWorkflowCache(workflowId: string) {
  revalidateTag(`workflow-${workflowId}`)
}

/**
 * Invalide tout le cache lié aux workflows
 */
export function invalidateAllWorkflowCache() {
  revalidateTag('workflows')
  // Vous pouvez ajouter d'autres tags si nécessaire
}