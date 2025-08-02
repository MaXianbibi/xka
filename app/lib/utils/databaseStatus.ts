import { getAllWorkflows } from '../drizzle/operations'

/**
 * Vérifie si la base de données est disponible
 */
export async function isDatabaseAvailable(): Promise<boolean> {
  try {
    await getAllWorkflows({ limit: 1 })
    return true
  } catch (error: any) {
    // Vérifier spécifiquement l'erreur de connexion
    if (error?.cause?.code === 'ECONNREFUSED' || 
        error?.message?.includes('ECONNREFUSED') ||
        error?.message?.includes('Failed query')) {
      return false
    }
    // Pour d'autres erreurs, on considère que la DB est disponible mais qu'il y a un autre problème
    return true
  }
}

/**
 * Fonction utilitaire pour gérer les erreurs de base de données
 */
export function isDatabaseConnectionError(error: any): boolean {
  return error?.cause?.code === 'ECONNREFUSED' || 
         error?.message?.includes('ECONNREFUSED') ||
         error?.message?.includes('Failed query')
}