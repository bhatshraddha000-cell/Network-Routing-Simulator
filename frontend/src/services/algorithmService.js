const API_BASE = '/api/algorithm';

export const algorithmService = {
  /**
   * Calculates the shortest path using Dijkstra's algorithm
   * from the active graph snapshot in React state.
   * 
   * @param {Object} graphData
   * @param {Array} graphData.nodes
   * @param {Array} graphData.edges
   * @param {string} [graphData.sourceId='S']
   * @param {string} [graphData.destinationId='D']
   * @returns {Promise<Object>}
   */
  async calculateDijkstra({ nodes, edges, sourceId = 'S', destinationId = 'D' }) {
    // Clean and normalize nodes and edges from React Flow representation
    const payload = {
      sourceId,
      destinationId,
      nodes: nodes.map((n) => ({
        id: n.id,
        label: n.data?.label || n.id,
        type: n.data?.type || (n.id === 'S' ? 'source' : n.id === 'D' ? 'destination' : 'intermediate'),
        position: {
          x: Math.round(n.position?.x ?? 0),
          y: Math.round(n.position?.y ?? 0),
        },
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        weight: Number(e.data?.weight ?? 1),
        direction: e.data?.direction || 'BIDIRECTIONAL',
      })),
    };

    const res = await fetch(`${API_BASE}/dijkstra`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to calculate shortest path.');
    }

    return json.data;
  },
};

