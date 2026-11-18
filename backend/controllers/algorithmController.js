/**
 * algorithmController.js
 * 
 * Handles incoming graph computation requests for Dijkstra's Shortest Path Algorithm.
 * Validates graph data and executes pure in-memory calculation without altering database state.
 */

import { findShortestPath } from '../services/dijkstraService.js';

export const calculateDijkstra = async (req, res, next) => {
  try {
    const { nodes, edges, sourceId = 'S', destinationId = 'D' } = req.body;

    // 1. Array validation
    if (!Array.isArray(nodes)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input: "nodes" must be an array.',
      });
    }

    if (!Array.isArray(edges)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input: "edges" must be an array.',
      });
    }

    // 2. Capacity limit check
    if (nodes.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Network size exceeds limit: maximum 50 routers permitted.',
      });
    }

    // 3. Unique node IDs and Endpoint presence validation
    const nodeIds = new Set();
    let sourceCount = 0;
    let destCount = 0;

    for (const node of nodes) {
      if (!node.id || typeof node.id !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Every router must have a valid string ID.',
        });
      }

      if (nodeIds.has(node.id)) {
        return res.status(400).json({
          success: false,
          error: `Duplicate router ID detected: ${node.id}`,
        });
      }
      nodeIds.add(node.id);

      if (node.id === sourceId) sourceCount++;
      if (node.id === destinationId) destCount++;
    }

    if (sourceCount !== 1) {
      return res.status(400).json({
        success: false,
        error: `Source router '${sourceId}' must exist exactly once in the topology.`,
      });
    }

    if (destCount !== 1) {
      return res.status(400).json({
        success: false,
        error: `Destination router '${destinationId}' must exist exactly once in the topology.`,
      });
    }

    // 4. Edge validation
    const connectionPairs = new Set();
    for (const edge of edges) {
      if (!edge.id) {
        return res.status(400).json({
          success: false,
          error: 'Every communication link must possess a valid ID.',
        });
      }

      if (!nodeIds.has(edge.source)) {
        return res.status(400).json({
          success: false,
          error: `Link '${edge.id}' references non-existent source router '${edge.source}'.`,
        });
      }

      if (!nodeIds.has(edge.target)) {
        return res.status(400).json({
          success: false,
          error: `Link '${edge.id}' references non-existent target router '${edge.target}'.`,
        });
      }

      if (edge.source === edge.target) {
        return res.status(400).json({
          success: false,
          error: `Self-loops are forbidden: router '${edge.source}' cannot connect to itself.`,
        });
      }

      const weight = Number(edge.weight);
      if (isNaN(weight) || !isFinite(weight) || weight <= 0) {
        return res.status(400).json({
          success: false,
          error: `Link '${edge.id}' must have a positive, finite numeric weight greater than 0. Received: ${edge.weight}`,
        });
      }

      const direction = edge.direction || 'BIDIRECTIONAL';
      if (!['BIDIRECTIONAL', 'ONE_WAY'].includes(direction)) {
        return res.status(400).json({
          success: false,
          error: `Link '${edge.id}' has invalid direction: '${direction}'. Must be BIDIRECTIONAL or ONE_WAY.`,
        });
      }

      // Check duplicate link between same router pair
      const pairKey = [edge.source, edge.target].sort().join('<->');
      if (connectionPairs.has(pairKey)) {
        return res.status(400).json({
          success: false,
          error: `Duplicate link detected between router pair '${edge.source}' and '${edge.target}'.`,
        });
      }
      connectionPairs.add(pairKey);
    }

    // 5. Execute Dijkstra algorithm
    const result = findShortestPath({
      nodes,
      edges,
      sourceId,
      destinationId,
    });

    return res.status(200).json({
      success: true,
      message: result.reachable
        ? 'Shortest path calculated successfully.'
        : 'Destination is unreachable from Source.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

