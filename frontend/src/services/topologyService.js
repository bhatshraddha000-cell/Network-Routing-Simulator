const API_BASE = '/api/topology';

export const topologyService = {
  /**
   * Fetch the active topology
   */
  async getCurrent() {
    const res = await fetch(`${API_BASE}/current`);
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to fetch topology');
    }
    return json.data;
  },

  /**
   * Save or update the active topology
   */
  async saveCurrent(data) {
    const res = await fetch(`${API_BASE}/current`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to save topology');
    }
    return json.data;
  },

  /**
   * Reset topology to initial S and D only
   */
  async resetCurrent() {
    const res = await fetch(`${API_BASE}/current/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to reset topology');
    }
    return json.data;
  },

  /**
   * Load predefined sample topology
   */
  async loadExample() {
    const res = await fetch(`${API_BASE}/example`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to load example topology');
    }
    return json.data;
  },
};

