'use server';

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

    const payload = JSON.stringify({ nodes, edges });


    // TODO: Save to DB or forward to another service

    

    return { success: true, nodes, edges };
  } catch (err) {
    console.error('Failed to parse flowData', err);
    return { success: false, error: 'Invalid JSON' };
  }
}
