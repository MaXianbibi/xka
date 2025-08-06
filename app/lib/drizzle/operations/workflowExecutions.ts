import { eq, desc, asc, and, gte, lte, count } from 'drizzle-orm'
import { db, workflowExecutionResults, type NewWorkflowExecutionResult, type WorkflowExecutionResultWithWorkflow } from '../drizzle'

// ==================== CREATE ====================

/**
 * Créer un nouveau résultat d'exécution
 */
export async function createWorkflowExecution(data: Omit<NewWorkflowExecutionResult, 'id' | 'createdAt' | 'updatedAt'>) {
    const [execution] = await db.insert(workflowExecutionResults).values(data).returning()
    return execution
}

// ==================== READ ====================

/**
 * Récupérer toutes les exécutions d'un workflow
 */
export async function getWorkflowExecutions(workflowId: string, options?: {
    status?: 'success' | 'error' | 'running' | 'skipped'
    limit?: number
    offset?: number
    orderBy?: 'startedAt' | 'endedAt' | 'durationMs' | 'createdAt'
    order?: 'asc' | 'desc'
}) {
    // Construire la condition WHERE
    const baseCondition = eq(workflowExecutionResults.workflowId, workflowId)

    const whereCondition = options?.status
        ? and(baseCondition, eq(workflowExecutionResults.status, options.status))!
        : baseCondition

    let query = db.select().from(workflowExecutionResults).where(whereCondition)

    // Tri
    if (options?.orderBy) {
        const orderFn = options.order === 'asc' ? asc : desc
        const column = workflowExecutionResults[options.orderBy]
        query = query.orderBy(orderFn(column)) as typeof query
    } else {
        // Tri par défaut : plus récent en premier
        query = query.orderBy(desc(workflowExecutionResults.startedAt)) as typeof query
    }

    // Pagination
    if (options?.limit) {
        query = query.limit(options.limit) as typeof query
    }
    if (options?.offset) {
        query = query.offset(options.offset) as typeof query
    }

    return await query
}

/**
 * Récupérer une exécution par ID
 */
export async function getWorkflowExecutionById(id: string) {
    const [execution] = await db.select().from(workflowExecutionResults).where(eq(workflowExecutionResults.id, id))
    return execution || null
}

/**
 * Récupérer une exécution avec son workflow
 */
export async function getWorkflowExecutionWithWorkflow(id: string): Promise<WorkflowExecutionResultWithWorkflow | null> {
    const execution = await db.query.workflowExecutionResults.findFirst({
        where: eq(workflowExecutionResults.id, id),
        with: {
            workflow: true,
        },
    })
    return execution || null
}

/**
 * Récupérer les exécutions récentes
 */
export async function getRecentExecutions(limit: number = 20) {
    return await db.query.workflowExecutionResults.findMany({
        limit,
        orderBy: desc(workflowExecutionResults.startedAt),
        with: {
            workflow: {
                columns: {
                    name: true,
                },
            },
        },
    })
}

/**
 * Récupérer les exécutions en cours
 */
export async function getRunningExecutions() {
    return await db.query.workflowExecutionResults.findMany({
        where: eq(workflowExecutionResults.status, 'running'),
        with: {
            workflow: {
                columns: {
                    name: true,
                },
            },
        },
        orderBy: desc(workflowExecutionResults.startedAt),
    })
}

/**
 * Récupérer les exécutions dans une plage de temps
 */
export async function getExecutionsInTimeRange(startTime: number, endTime: number, workflowId?: string) {
    const timeRangeCondition = and(
        gte(workflowExecutionResults.startedAt, startTime),
        lte(workflowExecutionResults.startedAt, endTime)
    )!

    const whereCondition = workflowId
        ? and(timeRangeCondition, eq(workflowExecutionResults.workflowId, workflowId))!
        : timeRangeCondition

    return await db.query.workflowExecutionResults.findMany({
        where: whereCondition,
        with: {
            workflow: {
                columns: {
                    name: true,
                },
            },
        },
        orderBy: desc(workflowExecutionResults.startedAt),
    })
}

// ==================== UPDATE ====================

/**
 * Mettre à jour une exécution
 */
export async function updateWorkflowExecution(id: string, data: Partial<Omit<NewWorkflowExecutionResult, 'id' | 'createdAt'>>) {
    const [execution] = await db
        .update(workflowExecutionResults)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(workflowExecutionResults.id, id))
        .returning()
    return execution || null
}

/**
 * Marquer une exécution comme terminée
 */
export async function completeWorkflowExecution(id: string, status: 'success' | 'error', endedAt: number, error?: string) {
    const execution = await getWorkflowExecutionById(id)
    if (!execution) return null

    const durationMs = endedAt - execution.startedAt

    return await updateWorkflowExecution(id, {
        status,
        endedAt,
        durationMs,
        error,
    })
}

/**
 * Ajouter des logs à une exécution
 */
export async function addLogsToExecution(id: string, newLogs: string[]) {
    const execution = await getWorkflowExecutionById(id)
    if (!execution) return null

    const currentLogs = execution.globalLogs || []
    const updatedLogs = [...currentLogs, ...newLogs]

    return await updateWorkflowExecution(id, {
        globalLogs: updatedLogs,
    })
}

// ==================== DELETE ====================

/**
 * Supprimer une exécution
 */
export async function deleteWorkflowExecution(id: string) {
    const [execution] = await db.delete(workflowExecutionResults).where(eq(workflowExecutionResults.id, id)).returning()
    return execution || null
}

/**
 * Supprimer toutes les exécutions d'un workflow
 */
export async function deleteWorkflowExecutions(workflowId: string) {
    return await db.delete(workflowExecutionResults).where(eq(workflowExecutionResults.workflowId, workflowId)).returning()
}

/**
 * Supprimer les anciennes exécutions (plus anciennes que X jours)
 */
export async function deleteOldExecutions(daysOld: number) {
    const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000)
    return await db.delete(workflowExecutionResults).where(lte(workflowExecutionResults.startedAt, cutoffTime)).returning()
}

// ==================== STATISTIQUES ====================

/**
 * Récupérer les statistiques globales des exécutions
 */
export async function getExecutionStats() {
    // Récupérer toutes les exécutions avec les données nécessaires
    const executions = await db
        .select({
            status: workflowExecutionResults.status,
            durationMs: workflowExecutionResults.durationMs,
        })
        .from(workflowExecutionResults)

    // Calculer les statistiques
    const validDurations = executions
        .map(e => e.durationMs)
        .filter((d): d is number => d !== null && d !== undefined)

    const stats = {
        totalExecutions: executions.length,
        successCount: executions.filter(e => e.status === 'success').length,
        errorCount: executions.filter(e => e.status === 'error').length,
        runningCount: executions.filter(e => e.status === 'running').length,
        skippedCount: executions.filter(e => e.status === 'skipped').length,
        avgDuration: validDurations.length > 0 ? validDurations.reduce((a, b) => a + b, 0) / validDurations.length : null,
        totalDuration: validDurations.reduce((a, b) => a + b, 0),
        minDuration: validDurations.length > 0 ? Math.min(...validDurations) : null,
        maxDuration: validDurations.length > 0 ? Math.max(...validDurations) : null,
    }

    return stats
}

/**
 * Récupérer les statistiques d'un workflow spécifique
 */
export async function getWorkflowExecutionStats(workflowId: string) {
    // Récupérer toutes les exécutions du workflow avec les données nécessaires
    const executions = await db
        .select({
            status: workflowExecutionResults.status,
            durationMs: workflowExecutionResults.durationMs,
        })
        .from(workflowExecutionResults)
        .where(eq(workflowExecutionResults.workflowId, workflowId))

    // Calculer les statistiques
    const validDurations = executions
        .map(e => e.durationMs)
        .filter((d): d is number => d !== null && d !== undefined)

    const stats = {
        totalExecutions: executions.length,
        successCount: executions.filter(e => e.status === 'success').length,
        errorCount: executions.filter(e => e.status === 'error').length,
        runningCount: executions.filter(e => e.status === 'running').length,
        skippedCount: executions.filter(e => e.status === 'skipped').length,
        avgDuration: validDurations.length > 0 ? validDurations.reduce((a, b) => a + b, 0) / validDurations.length : null,
        totalDuration: validDurations.reduce((a, b) => a + b, 0),
        minDuration: validDurations.length > 0 ? Math.min(...validDurations) : null,
        maxDuration: validDurations.length > 0 ? Math.max(...validDurations) : null,
    }

    return stats
}

/**
 * Récupérer les statistiques par jour pour un workflow
 */
export async function getDailyExecutionStats(workflowId: string, days: number = 30) {
    const startTime = Date.now() - (days * 24 * 60 * 60 * 1000)

    return await db
        .select({
            date: workflowExecutionResults.startedAt,
            status: workflowExecutionResults.status,
            durationMs: workflowExecutionResults.durationMs,
        })
        .from(workflowExecutionResults)
        .where(and(
            eq(workflowExecutionResults.workflowId, workflowId),
            gte(workflowExecutionResults.startedAt, startTime)
        )!)
        .orderBy(asc(workflowExecutionResults.startedAt))
}

// ==================== UTILITAIRES ====================

/**
 * Vérifier si une exécution existe
 */
export async function executionExists(id: string): Promise<boolean> {
    const [result] = await db
        .select({ count: count() })
        .from(workflowExecutionResults)
        .where(eq(workflowExecutionResults.id, id))
    return result.count > 0
}

/**
 * Récupérer la dernière exécution d'un workflow
 */
export async function getLastExecution(workflowId: string) {
    const [execution] = await db
        .select()
        .from(workflowExecutionResults)
        .where(eq(workflowExecutionResults.workflowId, workflowId))
        .orderBy(desc(workflowExecutionResults.startedAt))
        .limit(1)

    return execution || null
}