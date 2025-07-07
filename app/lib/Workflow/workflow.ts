"use server"

// lib/actions/workflow.ts
import { v4 as uuidv4 } from 'uuid';
import httpClient  from '@/app/lib/httpClient/httpClient';
import type { WorkflowNode, WorkflowEdge, SaveWorkflowResult } from '@/app/lib/types/types';

export async function saveWorkflow(formData: FormData): Promise<SaveWorkflowResult> {
  try {
    // 1. Extraction des données
    const raw = formData.get('flowData');
    
    if (!raw || typeof raw !== 'string') {
      return { 
        success: false, 
        error: 'No data received' 
      };
    }

    // 2. Parsing JSON
    const parsed = JSON.parse(raw);
    
    // 3. Nettoyage des données
    const nodes: WorkflowNode[] = (parsed.nodes ?? []).map((node: any) => ({
      id: node.id,
      type: node.type ?? null,
      data: node.data ?? {},
    }));

    const edges: WorkflowEdge[] = (parsed.edges ?? []).map((edge: any) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type ?? null,
    }));

    // 4. Validation basique
    if (nodes.length === 0) {
      return { 
        success: false, 
        error: 'No nodes provided' 
      };
    }

    // 5. Préparation du payload
    const id = uuidv4();
    const payload = { nodes, edges, id };

    // 6. Appel API
    const response = await httpClient.post('/workflow', payload);

    // 7. Vérification du statut (200 OU 201 = success)
    if (response.status === 200 || response.status === 201) {
      console.log('✅ Workflow saved successfully with ID:', id);
      
      // Retourner l'ID généré + data du serveur
      return { 
        success: true, 
        data: response.data, 
        id // 🎯 ID toujours retourné !
      };
    }

    // 8. Statut inattendu
    console.error('❌ Unexpected status:', response.status, response.data);
    return { 
      success: false, 
      error: `Server returned status ${response.status}` 
    };

  } catch (error) {
    // 9. Gestion des erreurs
    if (error instanceof SyntaxError) {
      console.error('❌ JSON parsing failed:', error);
      return { 
        success: false, 
        error: 'Invalid JSON format' 
      };
    }

    console.error('❌ Save workflow failed:', error);
    return { 
      success: false, 
      error: 'Failed to save workflow' 
    };
  }
}


export async function getWorflow(id: string): Promise<SaveWorkflowResult> {
  try {
    const response = await httpClient.get(`/workflow/${id}`);

    if (response.status === 200) {
      console.log('✅ Workflow retrieved successfully:', response.data);
      return { 
        success: true, 
        data: response.data, 
        id 
      };
    } else {
      console.error('❌ Unexpected status:', response.status, response.data);
      return { 
        success: false, 
        error: `Server returned status ${response.status}` 
      };
    }
  } catch (error) {
    console.error('❌ Error retrieving workflow:', error);
    return { 
      success: false, 
      error: 'Failed to retrieve workflow' 
    };
  }
}