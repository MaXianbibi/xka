'use server';

import axios from 'axios';

import httpClient from '@/app/lib/httpClient/httpClient';

import { v4 as uuidv4 } from 'uuid';


export async function saveWorkflow(formData: FormData) {
  const raw = formData.get('flowData');

  if (!raw || typeof raw !== 'string') {
    console.error('Invalid flowData');
    return { success: false, error: 'No data received' };
  }

  try {
    const parsed = JSON.parse(raw);

    const rawNodes = parsed.nodes ?? [];
    const rawEdges = parsed.edges ?? [];

    const nodes = rawNodes.map((node: any) => ({
      id: node.id,
      type: node.type ?? null,
      data: node.data ?? {},
    }));

    const edges = rawEdges.map((edge: any) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type ?? null,
    }));

    const id = uuidv4();

    const payload = JSON.stringify({ nodes, edges, id });


    const response = await httpClient.post('/workflow', payload);




    return { success: true, nodes, edges };
  } catch (err) {
    console.error('Failed to parse flowData', err);
    return { success: false, error: 'Invalid JSON' };
  }
}
