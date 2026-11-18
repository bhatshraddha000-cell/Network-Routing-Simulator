/**
 * simulationHelpers.js
 * 
 * Generates deterministic simulation snapshots from the backend Dijkstra execution trace.
 * Enables zero-overhead instantaneous forward/backward stepping and playback.
 */

export const generateSimulationSnapshots = (nodes, edges, steps, finalResult) => {
  if (!Array.isArray(steps) || steps.length === 0) {
    return [];
  }

  const sourceId = finalResult?.sourceId || 'S';
  const destinationId = finalResult?.destinationId || 'D';

  // Base state before any relaxation begins
  const initialDistances = {};
  const initialPredecessors = {};
  const initialStatuses = {};
  const initialVisitOrders = {};

  nodes.forEach((node) => {
    initialDistances[node.id] = node.id === sourceId ? 0 : null;
    initialPredecessors[node.id] = null;
    initialStatuses[node.id] = 'unvisited';
    initialVisitOrders[node.id] = null;
  });

  const snapshots = [];

  // Running tracking state as we iterate through trace events
  let currentDistances = { ...initialDistances };
  let currentPredecessors = { ...initialPredecessors };
  let currentStatuses = { ...initialStatuses };
  let currentVisitOrders = { ...initialVisitOrders };
  let currentVisitedList = [];
  let currentPQ = [];

  steps.forEach((event, idx) => {
    const isLastStep = idx === steps.length - 1;
    let activeNodeId = null;
    let activeEdgeId = null;
    let activeNeighborId = null;
    let edgeExaminedState = null; // 'examining' | 'relaxed' | 'unrelaxed'
    let operationTitle = '';
    let explanationText = '';
    let mathBreakdown = null;

    // Use queue snapshot directly from backend event if provided
    if (Array.isArray(event.queueSnapshot)) {
      currentPQ = event.queueSnapshot;
    }

    switch (event.type) {
      case 'INITIALIZE_NODE': {
        operationTitle = `Initialize Router ${event.nodeId}`;
        if (event.isSource) {
          currentDistances[event.nodeId] = 0;
          explanationText = `Source router ${event.nodeId} initialized with distance 0. Added as origin for routing calculations.`;
        } else {
          currentDistances[event.nodeId] = null;
          explanationText = `Router ${event.nodeId} initialized with distance ∞ (infinity) and no predecessor.`;
        }
        break;
      }

      case 'QUEUE_INSERTED': {
        operationTitle = `Insert Router ${event.nodeId} into Priority Queue`;
        explanationText = `Router ${event.nodeId} inserted into the binary min-heap with priority ${event.distance}.`;
        break;
      }

      case 'SELECT_NODE': {
        activeNodeId = event.nodeId;
        currentStatuses[event.nodeId] = 'current';
        operationTitle = `Extract Minimum-Distance Router ${event.nodeId}`;
        explanationText = `Router ${event.nodeId} has the minimum tentative distance (${event.currentDistance}) in the priority queue. It is extracted to explore its communication links.`;
        break;
      }

      case 'EXAMINE_EDGE': {
        activeNodeId = event.fromNodeId;
        activeNeighborId = event.toNodeId;
        activeEdgeId = event.edgeId;
        edgeExaminedState = 'examining';

        operationTitle = `Examine Link ${event.fromNodeId} → ${event.toNodeId}`;

        const prevDistStr = event.neighborCurrentDistance !== null && event.neighborCurrentDistance !== undefined
          ? `${event.neighborCurrentDistance}`
          : '∞';

        explanationText = `Evaluating communication link from ${event.fromNodeId} to ${event.toNodeId} with link cost ${event.edgeWeight}.`;
        mathBreakdown = {
          currentDistance: event.currentDistance,
          edgeWeight: event.edgeWeight,
          candidateDistance: event.candidateDistance,
          previousDistance: prevDistStr,
          isAlreadyFinalized: event.alreadyFinalized,
        };
        break;
      }

      case 'DISTANCE_UPDATED': {
        activeNodeId = event.fromNodeId;
        activeNeighborId = event.nodeId;
        activeEdgeId = event.edgeId;
        edgeExaminedState = 'relaxed';

        currentDistances[event.nodeId] = event.newDistance;
        currentPredecessors[event.nodeId] = event.predecessor;

        operationTitle = `Relax Distance to Router ${event.nodeId}`;
        const oldDistStr = event.previousDistance !== null ? `${event.previousDistance}` : '∞';
        explanationText = `Shorter path found! Candidate distance (${event.newDistance}) is less than current distance (${oldDistStr}). Updating distance to ${event.newDistance} and setting predecessor to ${event.predecessor}.`;
        break;
      }

      case 'DISTANCE_UNCHANGED': {
        activeNodeId = event.fromNodeId;
        activeNeighborId = event.nodeId;
        activeEdgeId = event.edgeId;
        edgeExaminedState = 'unrelaxed';

        operationTitle = `Retain Distance for Router ${event.nodeId}`;
        explanationText = `Candidate distance (${event.candidateDistance}) is greater than or equal to existing shortest distance (${event.retainedDistance}). No update needed.`;
        break;
      }

      case 'SKIP_FINALIZED_NODE': {
        activeNodeId = event.nodeId;
        operationTitle = `Skip Already-Finalized Router ${event.nodeId}`;
        explanationText = `Router ${event.nodeId} was already finalized in visit order #${currentVisitOrders[event.nodeId]}. Stale queue entry (${event.staleDistance}) is discarded.`;
        break;
      }

      case 'SKIP_STALE_ENTRY': {
        activeNodeId = event.nodeId;
        operationTitle = `Discard Stale Queue Entry for ${event.nodeId}`;
        explanationText = `Extracted distance (${event.staleDistance}) is larger than current confirmed distance (${event.currentDistance}). Outdated entry ignored.`;
        break;
      }

      case 'FINALIZE_NODE': {
        activeNodeId = event.nodeId;
        currentStatuses[event.nodeId] = 'visited';
        currentVisitOrders[event.nodeId] = event.visitOrder;
        if (!currentVisitedList.includes(event.nodeId)) {
          currentVisitedList.push(event.nodeId);
        }

        operationTitle = `Finalize Router ${event.nodeId}`;
        explanationText = `Router ${event.nodeId} finalized in visit order #${event.visitOrder} with optimal distance ${event.finalDistance}. All incident links have been relaxed.`;
        break;
      }

      case 'ALGORITHM_COMPLETE': {
        operationTitle = 'Dijkstra Simulation Completed';
        if (finalResult?.reachable) {
          explanationText = `All reachable routers have been processed. Shortest path from Source ${sourceId} to Destination ${destinationId} is confirmed with minimum total cost ${finalResult.totalCost}.`;
        } else {
          explanationText = `Simulation finished. Destination router ${destinationId} could not be reached from Source ${sourceId}.`;
        }

        // Mark any remaining nodes with null distance as unreachable
        nodes.forEach((n) => {
          if (currentDistances[n.id] === null || currentDistances[n.id] === undefined) {
            currentStatuses[n.id] = 'unreachable';
          }
        });
        break;
      }

      default: {
        operationTitle = `Step: ${event.type}`;
        explanationText = 'Executing algorithm step.';
      }
    }

    // Determine edge state mapping for graph canvas rendering
    const edgeStates = {};
    edges.forEach((e) => {
      if (isLastStep && finalResult?.reachable && finalResult?.shortestPathEdges?.includes(e.id)) {
        edgeStates[e.id] = 'shortestPath';
      } else if (e.id === activeEdgeId) {
        edgeStates[e.id] = edgeExaminedState || 'examining';
      } else {
        edgeStates[e.id] = 'normal';
      }
    });

    // Determine node states
    const nodeStates = { ...currentStatuses };
    if (isLastStep && finalResult?.reachable) {
      (finalResult.shortestPath || []).forEach((nodeId) => {
        nodeStates[nodeId] = 'shortestPath';
      });
    }

    snapshots.push({
      stepIndex: idx,
      sequence: event.sequence || idx + 1,
      totalSteps: steps.length,
      eventType: event.type,
      operation: operationTitle,
      explanation: explanationText,
      mathBreakdown,
      activeNodeId,
      activeEdgeId,
      activeNeighborId,
      nodeStates,
      edgeStates,
      distances: { ...currentDistances },
      predecessors: { ...currentPredecessors },
      visitOrders: { ...currentVisitOrders },
      visitedList: [...currentVisitedList],
      priorityQueue: [...currentPQ],
      isCompleted: isLastStep || event.type === 'ALGORITHM_COMPLETE',
      shortestPath: isLastStep && finalResult?.reachable ? (finalResult.shortestPath || []) : [],
      shortestPathEdges: isLastStep && finalResult?.reachable ? (finalResult.shortestPathEdges || []) : [],
      totalCost: isLastStep ? finalResult?.totalCost : null,
      reachable: Boolean(finalResult?.reachable),
    });
  });

  return snapshots;
};

