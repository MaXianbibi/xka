import { eq, desc, asc, like, and, or, ne, count } from 'drizzle-orm'
import { db, workflows, workflowExecutionResults, type Workflow, type NewWorkflow, type WorkflowWithExecutions } from '../drizzle'

// ==================== CREATE ====================

/**
 * Créer un nouveau workflow
 */
export async function createWorkflow(data: Omit<NewWorkflow, 'id' | 'createdAt' | 'updatedAt'>) {
    const [workflow] = await db.insert(workflows).values(data).returning()
    return workflow
}

/**
 * Créer plusieurs workflows en une fois
 */
export async function createWorkflows(data: Omit<NewWorkflow, 'id' | 'createdAt' | 'updatedAt'>[]) {
    return await db.insert(workflows).values(data).returning()
}

// ==================== READ ====================

/**
 * Récupérer tous les workflows
 */
export async function getAllWorkflows(options?: {
    orderBy?: 'name' | 'createdAt' | 'updatedAt'
    order?: 'asc' | 'desc'
    limit?: number
    offset?: number
}) {
    try {
        // Construire la query de base
        let query = db.select().from(workflows)

        // Ajouter le tri si spécifié
        if (options?.orderBy) {
            const orderFn = options.order === 'desc' ? desc : asc
            const column = workflows[options.orderBy]
            query = query.orderBy(orderFn(column)) as typeof query
        }

        // Ajouter la pagination si spécifiée
        if (options?.limit) {
            query = query.limit(options.limit) as typeof query
        }
        if (options?.offset) {
            query = query.offset(options.offset) as typeof query
        }

        return await query
    } catch (error: any) {
        // Améliorer le message d'erreur pour les problèmes de connexion
        if (error?.cause?.code === 'ECONNREFUSED') {
            throw new Error('Database connection failed: PostgreSQL server is not running. Please start the database with "docker-compose up"')
        }
        throw error
    }
}

/**
 * Récupérer un workflow par ID
 */
export async function getWorkflowById(id: string) {
    const [workflow] = await db.select().from(workflows).where(eq(workflows.id, id))
    return workflow || null
}

/**
 * Récupérer un workflow avec ses exécutions
 */
export async function getWorkflowWithExecutions(id: string): Promise<WorkflowWithExecutions | null> {
    const workflow = await db.query.workflows.findFirst({
        where: eq(workflows.id, id),
        with: {
            executions: {
                orderBy: desc(workflowExecutionResults.createdAt),
            },
        },
    })
    return workflow || null
}

/**
 * Rechercher des workflows par nom
 */
export async function searchWorkflowsByName(searchTerm: string, options?: {
    limit?: number
    offset?: number
}) {
    let query = db.select().from(workflows).where(like(workflows.name, `%${searchTerm}%`))

    if (options?.limit) {
        query = query.limit(options.limit) as typeof query
    }
    if (options?.offset) {
        query = query.offset(options.offset) as typeof query
    }

    return await query
}

/**
 * Récupérer les workflows récents
 */
export async function getRecentWorkflows(limit: number = 10) {
    return await db
        .select()
        .from(workflows)
        .orderBy(desc(workflows.updatedAt))
        .limit(limit)
}

/**
 * Compter le nombre total de workflows
 */
export async function countWorkflows() {
    const [result] = await db.select({ count: count() }).from(workflows)
    return result.count
}

// ==================== UPDATE ====================

/**
 * Mettre à jour un workflow
 */
export async function updateWorkflow(id: string, data: Partial<Omit<NewWorkflow, 'id' | 'createdAt'>>) {
    const [workflow] = await db
        .update(workflows)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(workflows.id, id))
        .returning()
    return workflow || null
}

/**
 * Mettre à jour le nom d'un workflow
 */
export async function updateWorkflowName(id: string, name: string) {
    return await updateWorkflow(id, { name })
}

// ==================== DELETE ====================

/**
 * Supprimer un workflow par ID
 */
export async function deleteWorkflow(id: string) {
    const [workflow] = await db.delete(workflows).where(eq(workflows.id, id)).returning()
    return workflow || null
}

/**
 * Supprimer plusieurs workflows
 */
export async function deleteWorkflows(ids: string[]) {
    return await db.delete(workflows).where(
        or(...ids.map(id => eq(workflows.id, id)))
    ).returning()
}

/**
 * Supprimer un workflow avec toutes ses exécutions
 */
export async function deleteWorkflowWithExecutions(id: string) {
    return await db.transaction(async (tx) => {
        // Supprimer d'abord les exécutions
        await tx.delete(workflowExecutionResults).where(eq(workflowExecutionResults.workflowId, id))

        // Puis supprimer le workflow
        const [workflow] = await tx.delete(workflows).where(eq(workflows.id, id)).returning()
        return workflow
    })
}

// ==================== STATISTIQUES ====================

/**
 * Récupérer les statistiques d'un workflow
 */
export async function getWorkflowStats(id: string) {
    // Récupérer toutes les exécutions du workflow
    const executions = await db
        .select({ status: workflowExecutionResults.status })
        .from(workflowExecutionResults)
        .where(eq(workflowExecutionResults.workflowId, id))

    // Calculer les statistiques
    const stats = {
        totalExecutions: executions.length,
        successCount: executions.filter(e => e.status === 'success').length,
        errorCount: executions.filter(e => e.status === 'error').length,
        runningCount: executions.filter(e => e.status === 'running').length,
        skippedCount: executions.filter(e => e.status === 'skipped').length,
    }

    return stats
}

/**
 * Récupérer les workflows avec leurs statistiques
 */
export async function getWorkflowsWithStats() {
    return await db.query.workflows.findMany({
        with: {
            executions: {
                columns: {
                    status: true,
                },
            },
        },
    })
}

// ==================== UTILITAIRES ====================

/**
 * Vérifier si un workflow existe
 */
export async function workflowExists(id: string): Promise<boolean> {
    const [result] = await db
        .select({ count: count() })
        .from(workflows)
        .where(eq(workflows.id, id))
    return result.count > 0
}

/**
 * Vérifier si un nom de workflow est déjà utilisé
 */
export async function isWorkflowNameTaken(name: string, excludeId?: string): Promise<boolean> {
    const baseCondition = eq(workflows.name, name)

    const whereCondition = excludeId
        ? and(baseCondition, ne(workflows.id, excludeId))!
        : baseCondition

    const [result] = await db
        .select({ count: count() })
        .from(workflows)
        .where(whereCondition)

    return result.count > 0
}