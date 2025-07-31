'use server'

import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { 
  createWorkflow, 
  updateWorkflow, 
  deleteWorkflow,
  type NewWorkflow 
} from '../drizzle/operations'

/**
 * Actions serveur pour les workflows avec invalidation de cache
 */

/**
 * Créer un nouveau workflow
 */
export async function createWorkflowAction(data: Omit<NewWorkflow, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const workflow = await createWorkflow(data)
    
    // Invalider le cache
    revalidateTag('workflows')
    revalidateTag('stats')
    
    return { success: true, workflow }
  } catch (error) {
    console.error('Erreur lors de la création du workflow:', error)
    return { success: false, error: 'Erreur lors de la création du workflow' }
  }
}

/**
 * Mettre à jour un workflow
 */
export async function updateWorkflowAction(
  id: string, 
  data: Partial<Omit<NewWorkflow, 'id' | 'createdAt'>>
) {
  try {
    const workflow = await updateWorkflow(id, data)
    
    // Invalider le cache
    revalidateTag('workflows')
    revalidateTag('stats')
    revalidateTag(`workflow-${id}`)
    
    return { success: true, workflow }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du workflow:', error)
    return { success: false, error: 'Erreur lors de la mise à jour du workflow' }
  }
}

/**
 * Supprimer un workflow
 */
export async function deleteWorkflowAction(id: string) {
  try {
    const workflow = await deleteWorkflow(id)
    
    // Invalider le cache
    revalidateTag('workflows')
    revalidateTag('stats')
    revalidateTag(`workflow-${id}`)
    
    return { success: true, workflow }
  } catch (error) {
    console.error('Erreur lors de la suppression du workflow:', error)
    return { success: false, error: 'Erreur lors de la suppression du workflow' }
  }
}

/**
 * Rafraîchir manuellement le cache des workflows
 */
export async function refreshWorkflowsAction() {
  revalidateTag('workflows')
  revalidateTag('stats')
  redirect('/')
}