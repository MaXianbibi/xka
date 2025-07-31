/**
 * Utilitaires pour la gestion d'erreurs
 */

export interface DatabaseError {
  message: string
  code?: string
  details?: any
}

/**
 * Gère les erreurs de base de données de manière sécurisée
 */
export function handleDatabaseError(error: any): DatabaseError {
  console.error('Database error:', error)
  
  // Erreurs de connexion PostgreSQL
  if (error.code === 'ECONNREFUSED') {
    return {
      message: 'Impossible de se connecter à la base de données',
      code: 'CONNECTION_REFUSED',
      details: 'Vérifiez que PostgreSQL est démarré et accessible'
    }
  }
  
  // Erreurs d'authentification
  if (error.code === '28P01') {
    return {
      message: 'Erreur d\'authentification à la base de données',
      code: 'AUTH_FAILED',
      details: 'Vérifiez les identifiants de connexion'
    }
  }
  
  // Erreurs de schéma
  if (error.code === '42P01') {
    return {
      message: 'Table non trouvée',
      code: 'TABLE_NOT_FOUND',
      details: 'Exécutez les migrations de base de données'
    }
  }
  
  // Erreur générique
  return {
    message: error.message || 'Erreur de base de données inconnue',
    code: 'UNKNOWN_ERROR',
    details: error
  }
}

/**
 * Wrapper pour les opérations de base de données avec gestion d'erreur
 */
export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    const dbError = handleDatabaseError(error)
    console.warn(`Database operation failed: ${dbError.message}`)
    return fallback
  }
}

/**
 * Vérifie si la base de données est accessible
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const { db } = await import('../drizzle/drizzle')
    await db.execute('SELECT 1' as any)
    return true
  } catch (error) {
    console.error('Database connection check failed:', error)
    return false
  }
}