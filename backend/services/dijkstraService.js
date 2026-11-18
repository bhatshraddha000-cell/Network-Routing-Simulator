/**
 * dijkstraService.js
 * 
 * Core implementation of Dijkstra's Single-Source Shortest Path Algorithm
 * for weighted directed and bidirectional network graphs.
 * 
 * Theoretical Complexity:
 * - Time Complexity:  O((V + E) log V)
 *   Where V is the number of routers (vertices) and E is the number of communication links (edges).
 *   - Each vertex is extracted from the min-heap at most once: O(V log V)
 *   - Each edge relaxation potentially inserts a new key into the min-heap: O(E log V)
 *   - Adjacency list representation enables examining incident edges in O(E) total time.
 * 
 * - Space Complexity: O(V + E)
 *   - Adjacency list stores V lists containing 2E directed items: O(V + E)
 *   - Distances, predecessor, visit order maps, and priority queue: O(V)
 *   - Execution steps trace: O(V + E)
 */

import { MinPriorityQueue } from '../utils/MinPriorityQueue.js';

/**
 * Builds an adjacency list from nodes and edges.
 * Correctly accounts for BIDIRECTIONAL and ONE_WAY communication links.
 * 
 * @param {Array} nodes - Array of router nodes
 * @param {Array} edges - Array of communication link edges
 * @returns {Map<string, Array<{to: string, weight: number, edgeId: string, direction: string}>>}
 */
export const buildAdjacencyList = (nodes, edges) => {
  const adj = new Map();

  // Initialize empty adjacency lists for all nodes
  for (const node of nodes) {
    adj.set(node.id, []);
  }

  for (const edge of edges) {
    const { source, target, id } = edge;
    const weight = Math.round(Number(edge.weight) * 100) / 100;
    const direction = edge.direction || 'BIDIRECTIONAL';

    if (!adj.has(source) || !adj.has(target)) {
      continue;
    }

    // Forward edge: source -> target
    adj.get(source).push({
      to: target,
      weight,
      edgeId: id,
      direction,
    });

    // If BIDIRECTIONAL, create symmetric return edge: target -> source
    if (direction === 'BIDIRECTIONAL') {
      adj.get(target).push({
        to: source,
        weight,
        edgeId: id,
        direction,
      });
    }
  }

  return adj;
};

/**
 * Finds the shortest path and generates complete diagnostic execution trace
 * between sourceId and destinationId using Dijkstra's Algorithm with a Binary Min-Heap.
 * 
 * @param {Object} params
 * @param {Array} params.nodes - Router nodes array
 * @param {Array} params.edges - Network communication links
 * @param {string} [params.sourceId='S'] - Origin router ID (Default: 'S')
 * @param {string} [params.destinationId='D'] - Target router ID (Default: 'D')
 * @returns {Object} Complete algorithm execution result
 */
export const findShortestPath = ({
  nodes,
  edges,
  sourceId = 'S',
  destinationId = 'D',
}) => {
  // Validate presence of source and destination
  const sourceNode = nodes.find((n) => n.id === sourceId);
  const destNode = nodes.find((n) => n.id === destinationId);

  if (!sourceNode) {
    throw new Error(`Source router with ID '${sourceId}' was not found in the topology.`);
  }
  if (!destNode) {
    throw new Error(`Destination router with ID '${destinationId}' was not found in the topology.`);
  }

  const adj = buildAdjacencyList(nodes, edges);
  const pq = new MinPriorityQueue();

  const distances = new Map();
  const predecessor = new Map();
  const finalized = new Set();
  const visitOrder = new Map();
  const visitedOrderList = [];

  const steps = [];
  let seq = 0;

  // Step A: Initialization
  for (const node of nodes) {
    const isSource = node.id === sourceId;
    const initialDist = isSource ? 0 : Infinity;
    distances.set(node.id, initialDist);
    predecessor.set(node.id, null);

    steps.push({
      sequence: ++seq,
      type: 'INITIALIZE_NODE',
      nodeId: node.id,
      distance: isSource ? 0 : null,
      predecessor: null,
      isSource,
    });
  }

  // Insert Source S into min-heap with distance 0
  pq.insert({ nodeId: sourceId, distance: 0 });

  // Step B & C: Main Dijkstra Relaxation Loop
  while (!pq.isEmpty()) {
    const current = pq.extractMin();
    const currentId = current.nodeId;
    const currentDist = current.distance;

    // Skip stale priority queue entries
    if (finalized.has(currentId)) {
      steps.push({
        sequence: ++seq,
        type: 'SKIP_FINALIZED_NODE',
        nodeId: currentId,
        staleDistance: currentDist,
        currentDistance: distances.get(currentId),
      });
      continue;
    }

    if (currentDist > distances.get(currentId)) {
      steps.push({
        sequence: ++seq,
        type: 'SKIP_STALE_ENTRY',
        nodeId: currentId,
        staleDistance: currentDist,
        currentDistance: distances.get(currentId),
      });
      continue;
    }

    // Step B.4: Mark selected router as finalized (Visited)
    finalized.add(currentId);
    const orderNum = finalized.size;
    visitOrder.set(currentId, orderNum);
    visitedOrderList.push(currentId);

    steps.push({
      sequence: ++seq,
      type: 'SELECT_NODE',
      nodeId: currentId,
      currentDistance: currentDist,
      visitOrder: orderNum,
    });

    // Step C: Examine and Relax Outgoing Edges
    const neighbors = adj.get(currentId) || [];
    for (const edge of neighbors) {
      const neighborId = edge.to;
      const edgeWeight = edge.weight;
      const edgeId = edge.edgeId;

      // If already finalized, record edge check and continue
      if (finalized.has(neighborId)) {
        steps.push({
          sequence: ++seq,
          type: 'EXAMINE_EDGE',
          fromNodeId: currentId,
          toNodeId: neighborId,
          edgeId,
          edgeWeight,
          currentDistance: currentDist,
          candidateDistance: Math.round((currentDist + edgeWeight) * 100) / 100,
          neighborCurrentDistance: distances.get(neighborId),
          alreadyFinalized: true,
        });
        continue;
      }

      const candidateDistance = Math.round((currentDist + edgeWeight) * 100) / 100;
      const previousDistance = distances.get(neighborId);

      steps.push({
        sequence: ++seq,
        type: 'EXAMINE_EDGE',
        fromNodeId: currentId,
        toNodeId: neighborId,
        edgeId,
        edgeWeight,
        currentDistance: currentDist,
        candidateDistance,
        neighborCurrentDistance: previousDistance === Infinity ? null : previousDistance,
        alreadyFinalized: false,
      });

      // Relaxation condition: strictly strictly smaller to ensure deterministic tie handling
      if (candidateDistance < previousDistance) {
        distances.set(neighborId, candidateDistance);
        predecessor.set(neighborId, currentId);
        pq.insert({ nodeId: neighborId, distance: candidateDistance });

        steps.push({
          sequence: ++seq,
          type: 'DISTANCE_UPDATED',
          nodeId: neighborId,
          fromNodeId: currentId,
          edgeId,
          previousDistance: previousDistance === Infinity ? null : previousDistance,
          newDistance: candidateDistance,
          predecessor: currentId,
        });
      } else {
        steps.push({
          sequence: ++seq,
          type: 'DISTANCE_UNCHANGED',
          nodeId: neighborId,
          fromNodeId: currentId,
          edgeId,
          candidateDistance,
          retainedDistance: previousDistance === Infinity ? null : previousDistance,
        });
      }
    }

    steps.push({
      sequence: ++seq,
      type: 'FINALIZE_NODE',
      nodeId: currentId,
      finalDistance: currentDist,
      visitOrder: orderNum,
    });
  }

  steps.push({
    sequence: ++seq,
    type: 'ALGORITHM_COMPLETE',
    totalSteps: seq,
    finalizedCount: finalized.size,
  });

  // Step E: Reconstruct the Shortest Path
  const destDist = distances.get(destinationId);
  const isReachable = destDist !== undefined && destDist !== Infinity;

  let shortestPath = [];
  let shortestPathEdges = [];
  let totalCost = null;

  if (isReachable) {
    totalCost = destDist;
    const path = [];
    let curr = destinationId;

    while (curr !== null && curr !== undefined) {
      path.push(curr);
      curr = predecessor.get(curr);
    }

    path.reverse();

    // Verify valid path starting with sourceId
    if (path.length > 0 && path[0] === sourceId) {
      shortestPath = path;

      // Identify corresponding edge IDs along the shortest path
      for (let i = 0; i < shortestPath.length - 1; i++) {
        const u = shortestPath[i];
        const v = shortestPath[i + 1];

        // Find the edge that connects u and v
        const matchingEdge = edges.find((e) => {
          if (e.source === u && e.target === v) return true;
          if (e.direction === 'BIDIRECTIONAL' && e.source === v && e.target === u) return true;
          return false;
        });

        if (matchingEdge) {
          shortestPathEdges.push(matchingEdge.id);
        }
      }
    } else {
      // Destination was marked reachable but path didn't trace back to source (integrity fallback)
      shortestPath = [];
      totalCost = null;
    }
  }

  // Final Distance Table for all routers in the topology
  const distanceTable = nodes.map((node) => {
    const rawDist = distances.get(node.id);
    const reachable = rawDist !== undefined && rawDist !== Infinity;

    return {
      nodeId: node.id,
      label: node.label || node.id,
      distance: reachable ? rawDist : null,
      predecessor: predecessor.get(node.id) || null,
      status: reachable ? 'VISITED' : 'UNREACHABLE',
      visitOrder: reachable ? (visitOrder.get(node.id) || null) : null,
    };
  });

  return {
    sourceId,
    destinationId,
    reachable: isReachable && shortestPath.length > 0,
    shortestPath,
    shortestPathEdges,
    totalCost,
    distanceTable,
    visitedOrder: visitedOrderList,
    steps,
    stats: {
      totalRouters: nodes.length,
      totalLinks: edges.length,
      reachableRouters: finalized.size,
      unreachableRouters: nodes.length - finalized.size,
      timeComplexity: 'O((V + E) log V)',
      spaceComplexity: 'O(V + E)',
    },
  };
};

