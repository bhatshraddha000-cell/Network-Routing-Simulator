import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import { topologyService } from '../services/topologyService';
import { algorithmService } from '../services/algorithmService';
import { generateSimulationSnapshots } from '../utils/simulationHelpers';

const DEFAULT_SOURCE_NODE = {
  id: 'S',
  type: 'router',
  position: { x: 100, y: 250 },
  draggable: false,
  data: { label: 'Source (S)', type: 'source' },
};

const DEFAULT_DEST_NODE = {
  id: 'D',
  type: 'router',
  position: { x: 900, y: 250 },
  draggable: false,
  data: { label: 'Destination (D)', type: 'destination' },
};

/**
 * Normalizes backend node objects to React Flow node format
 */
const formatNodeForFlow = (node) => {
  const isEndpoint = node.id === 'S' || node.id === 'D';
  return {
    id: node.id,
    type: 'router',
    position: node.position || { x: 200, y: 200 },
    draggable: !isEndpoint,
    data: {
      label: node.label || node.id,
      type: node.type || (node.id === 'S' ? 'source' : node.id === 'D' ? 'destination' : 'intermediate'),
    },
  };
};

/**
 * Normalizes backend edge objects to React Flow edge format
 */
const formatEdgeForFlow = (edge) => {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    data: {
      weight: edge.weight,
      direction: edge.direction || 'BIDIRECTIONAL',
    },
  };
};

export const useTopology = (showToast) => {
  const [nodes, setNodes] = useState([DEFAULT_SOURCE_NODE, DEFAULT_DEST_NODE]);
  const [edges, setEdges] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingConnection, setPendingConnection] = useState(null);

  // Module 2 & 3 State
  const [dijkstraResult, setDijkstraResult] = useState(() => {
    try {
      const saved = sessionStorage.getItem('netroute_last_result');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [isTopologyModified, setIsTopologyModified] = useState(false);

  // Simulation mode
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSnapshots, setSimulationSnapshots] = useState([]);

  // Invalidate algorithm result when graph changes
  const invalidateAlgorithmResult = useCallback(() => {
    setIsSimulating(false);
    setSimulationSnapshots([]);
    setDijkstraResult(null);
    setIsTopologyModified(true);
    try {
      sessionStorage.removeItem('netroute_last_result');
    } catch { }
  }, []);

  // Keep track of unsaved changes in ref for beforeunload listener
  const unsavedChangesRef = useRef(false);
  unsavedChangesRef.current = hasUnsavedChanges;

  // Warn user before leaving page if unsaved
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (unsavedChangesRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Fetch initial topology on mount
  const fetchTopology = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await topologyService.getCurrent();
      if (data && Array.isArray(data.nodes) && data.nodes.length > 0) {
        setNodes(data.nodes.map(formatNodeForFlow));
        setEdges(Array.isArray(data.edges) ? data.edges.map(formatEdgeForFlow) : []);
      } else {
        setNodes([DEFAULT_SOURCE_NODE, DEFAULT_DEST_NODE]);
        setEdges([]);
      }
      setHasUnsavedChanges(false);
      setDijkstraResult(null);
      setIsTopologyModified(false);
      setIsSimulating(false);
      setSimulationSnapshots([]);
      showToast('Network topology loaded from database.', 'success');
    } catch (err) {
      console.warn('Backend unavailable, using default initial network topology:', err.message);
      setNodes([DEFAULT_SOURCE_NODE, DEFAULT_DEST_NODE]);
      setEdges([]);
      showToast('Operating in local mode. Please verify backend/database connection.', 'info');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchTopology();
  }, [fetchTopology]);

  // Handle node position changes / drag (disabled during simulation)
  const onNodesChange = useCallback(
    (changes) => {
      if (isSimulating) return;

      setNodes((nds) => {
        const updated = applyNodeChanges(changes, nds);
        return updated.map((node) => {
          if (node.id === 'S' || node.id === 'D') {
            return { ...node, draggable: false };
          }
          return node;
        });
      });

      const hasMovement = changes.some((c) => c.type === 'position' && c.dragging);
      if (hasMovement) {
        setHasUnsavedChanges(true);
        invalidateAlgorithmResult();
      }
    },
    [isSimulating, invalidateAlgorithmResult]
  );

  // Handle edge changes
  const onEdgesChange = useCallback(
    (changes) => {
      if (isSimulating) return;

      setEdges((eds) => applyEdgeChanges(changes, eds));
      const hasRemoval = changes.some((c) => c.type === 'remove');
      if (hasRemoval) {
        setHasUnsavedChanges(true);
        invalidateAlgorithmResult();
      }
    },
    [isSimulating, invalidateAlgorithmResult]
  );

  // Generate unique sequential router ID without duplicates
  const getNextRouterId = useCallback((currentNodes) => {
    const existingIndices = new Set();
    currentNodes.forEach((node) => {
      const match = node.id.match(/^R(\d+)$/);
      if (match) {
        existingIndices.add(parseInt(match[1], 10));
      }
    });

    let index = 1;
    while (existingIndices.has(index)) {
      index++;
    }
    return `R${index}`;
  }, []);

  // Add intermediate router
  const addRouter = useCallback(() => {
    if (isSimulating) return;

    if (nodes.length >= 50) {
      showToast('Network size limit reached. Maximum 50 routers permitted.', 'error');
      return;
    }

    const nextId = getNextRouterId(nodes);
    const intermediateCount = nodes.filter((n) => n.id !== 'S' && n.id !== 'D').length;
    const col = intermediateCount % 4;
    const row = Math.floor(intermediateCount / 4) % 4;

    const posX = 320 + col * 120 + (Math.random() * 20 - 10);
    const posY = 140 + row * 110 + (Math.random() * 20 - 10);

    const newNode = {
      id: nextId,
      type: 'router',
      position: { x: Math.round(posX), y: Math.round(posY) },
      draggable: true,
      data: {
        label: nextId,
        type: 'intermediate',
      },
    };

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(nextId);
    setSelectedEdgeId(null);
    setHasUnsavedChanges(true);
    invalidateAlgorithmResult();
    showToast(`Added intermediate router ${nextId}.`, 'success');
  }, [isSimulating, nodes, getNextRouterId, showToast, invalidateAlgorithmResult]);

  // Delete router
  const deleteNode = useCallback(
    (nodeId) => {
      if (isSimulating) return;

      if (nodeId === 'S' || nodeId === 'D') {
        showToast('Fixed endpoints (Source S and Destination D) cannot be deleted.', 'error');
        return;
      }

      setNodes((prev) => prev.filter((n) => n.id !== nodeId));
      setEdges((prev) => prev.filter((e) => e.source !== nodeId && e.target !== nodeId));

      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null);
      }
      setHasUnsavedChanges(true);
      invalidateAlgorithmResult();
      showToast(`Router ${nodeId} and connected links removed.`, 'info');
    },
    [isSimulating, selectedNodeId, showToast, invalidateAlgorithmResult]
  );

  // Initiating connection between router handles
  const onConnect = useCallback(
    (connection) => {
      if (isSimulating) return;

      const { source, target } = connection;

      if (source === target) {
        showToast('Routers cannot connect to themselves.', 'error');
        return;
      }

      const alreadyConnected = edges.some(
        (e) =>
          (e.source === source && e.target === target) ||
          (e.source === target && e.target === source)
      );

      if (alreadyConnected) {
        showToast(`A communication link already exists between ${source} and ${target}.`, 'error');
        return;
      }

      const sourceNode = nodes.find((n) => n.id === source);
      const targetNode = nodes.find((n) => n.id === target);

      setPendingConnection({
        source,
        target,
        sourceLabel: sourceNode?.data?.label || source,
        targetLabel: targetNode?.data?.label || target,
      });
    },
    [isSimulating, edges, nodes, showToast]
  );

  // Confirm connection weight & direction from modal
  const confirmConnection = useCallback(
    ({ source, target, weight, direction }) => {
      const newEdgeId = `e-${source}-${target}-${Date.now().toString().slice(-4)}`;
      const newEdge = {
        id: newEdgeId,
        source,
        target,
        type: 'networkEdge',
        data: {
          weight: Number(weight),
          direction: direction || 'BIDIRECTIONAL',
        },
      };

      setEdges((prev) => [...prev, newEdge]);
      setPendingConnection(null);
      setSelectedEdgeId(newEdgeId);
      setHasUnsavedChanges(true);
      invalidateAlgorithmResult();
      showToast(`Established link ${source} ─ (${weight}) ─ ${target}.`, 'success');
    },
    [showToast, invalidateAlgorithmResult]
  );

  const cancelConnection = useCallback(() => {
    setPendingConnection(null);
  }, []);

  // Update edge weight
  const updateEdgeWeight = useCallback(
    (edgeId, newWeight) => {
      if (isSimulating) return;

      setEdges((prev) =>
        prev.map((edge) => {
          if (edge.id === edgeId) {
            return {
              ...edge,
              data: {
                ...edge.data,
                weight: Number(newWeight),
              },
            };
          }
          return edge;
        })
      );
      setHasUnsavedChanges(true);
      invalidateAlgorithmResult();
      showToast(`Link cost updated to ${newWeight}.`, 'success');
    },
    [isSimulating, showToast, invalidateAlgorithmResult]
  );

  // Update edge direction
  const updateEdgeDirection = useCallback(
    (edgeId, newDirection) => {
      if (isSimulating) return;

      setEdges((prev) =>
        prev.map((edge) => {
          if (edge.id === edgeId) {
            return {
              ...edge,
              data: {
                ...edge.data,
                direction: newDirection,
              },
            };
          }
          return edge;
        })
      );
      setHasUnsavedChanges(true);
      invalidateAlgorithmResult();
      showToast(`Link direction set to ${newDirection === 'ONE_WAY' ? 'One-Way' : 'Bidirectional'}.`, 'info');
    },
    [isSimulating, showToast, invalidateAlgorithmResult]
  );

  // Delete edge
  const deleteEdge = useCallback(
    (edgeId) => {
      if (isSimulating) return;

      setEdges((prev) => prev.filter((e) => e.id !== edgeId));
      if (selectedEdgeId === edgeId) {
        setSelectedEdgeId(null);
      }
      setHasUnsavedChanges(true);
      invalidateAlgorithmResult();
      showToast('Communication link removed.', 'info');
    },
    [isSimulating, selectedEdgeId, showToast, invalidateAlgorithmResult]
  );

  // Save current topology to MongoDB
  const saveTopology = useCallback(async () => {
    setIsSaving(true);
    try {
      const payload = {
        name: 'Current Working Topology',
        nodes: nodes.map((n) => ({
          id: n.id,
          label: n.data?.label || n.id,
          type: n.data?.type || (n.id === 'S' ? 'source' : n.id === 'D' ? 'destination' : 'intermediate'),
          position: {
            x: Math.round(n.position.x),
            y: Math.round(n.position.y),
          },
        })),
        edges: edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          weight: e.data?.weight || 1,
          direction: e.data?.direction || 'BIDIRECTIONAL',
        })),
      };

      await topologyService.saveCurrent(payload);
      setHasUnsavedChanges(false);
      showToast('Topology successfully saved to MongoDB database.', 'success');
    } catch (err) {
      console.error('Error saving topology:', err);
      showToast(`Failed to save topology: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  }, [nodes, edges, showToast]);

  // Load example network
  const loadExample = useCallback(async () => {
    try {
      const data = await topologyService.loadExample();
      if (data && Array.isArray(data.nodes)) {
        setNodes(data.nodes.map(formatNodeForFlow));
        setEdges(Array.isArray(data.edges) ? data.edges.map(formatEdgeForFlow) : []);
      }
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      setHasUnsavedChanges(false);
      invalidateAlgorithmResult();
      showToast('Sample 6-node network loaded.', 'success');
    } catch (err) {
      console.error('Failed to load example topology from server:', err);
      const sampleNodes = [
        DEFAULT_SOURCE_NODE,
        { id: 'R1', type: 'router', position: { x: 360, y: 130 }, draggable: true, data: { label: 'R1', type: 'intermediate' } },
        { id: 'R2', type: 'router', position: { x: 360, y: 370 }, draggable: true, data: { label: 'R2', type: 'intermediate' } },
        { id: 'R3', type: 'router', position: { x: 640, y: 130 }, draggable: true, data: { label: 'R3', type: 'intermediate' } },
        { id: 'R4', type: 'router', position: { x: 640, y: 370 }, draggable: true, data: { label: 'R4', type: 'intermediate' } },
        DEFAULT_DEST_NODE,
      ];
      const sampleEdges = [
        { id: 'e-S-R1', source: 'S', target: 'R1', data: { weight: 4, direction: 'BIDIRECTIONAL' } },
        { id: 'e-S-R2', source: 'S', target: 'R2', data: { weight: 2, direction: 'BIDIRECTIONAL' } },
        { id: 'e-R1-R2', source: 'R1', target: 'R2', data: { weight: 1, direction: 'BIDIRECTIONAL' } },
        { id: 'e-R1-R3', source: 'R1', target: 'R3', data: { weight: 5, direction: 'BIDIRECTIONAL' } },
        { id: 'e-R2-R4', source: 'R2', target: 'R4', data: { weight: 8, direction: 'BIDIRECTIONAL' } },
        { id: 'e-R3-R4', source: 'R3', target: 'R4', data: { weight: 2, direction: 'BIDIRECTIONAL' } },
        { id: 'e-R3-D', source: 'R3', target: 'D', data: { weight: 6, direction: 'BIDIRECTIONAL' } },
        { id: 'e-R4-D', source: 'R4', target: 'D', data: { weight: 3, direction: 'BIDIRECTIONAL' } },
      ].map(formatEdgeForFlow);

      setNodes(sampleNodes);
      setEdges(sampleEdges);
      setHasUnsavedChanges(true);
      invalidateAlgorithmResult();
      showToast('Loaded local sample topology.', 'info');
    }
  }, [showToast, invalidateAlgorithmResult]);

  // Clear network (preserving S and D)
  const clearNetwork = useCallback(async () => {
    try {
      await topologyService.resetCurrent();
      setNodes([DEFAULT_SOURCE_NODE, DEFAULT_DEST_NODE]);
      setEdges([]);
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      setHasUnsavedChanges(false);
      invalidateAlgorithmResult();
      showToast('Network cleared. Endpoints Source S and Destination D preserved.', 'info');
    } catch (err) {
      console.warn('Backend reset unavailable, clearing locally:', err.message);
      setNodes([DEFAULT_SOURCE_NODE, DEFAULT_DEST_NODE]);
      setEdges([]);
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      setHasUnsavedChanges(true);
      invalidateAlgorithmResult();
      showToast('Network cleared locally.', 'info');
    }
  }, [showToast, invalidateAlgorithmResult]);

  // -------------------------------------------------------------
  // DIJKSTRA CALCULATION & SIMULATION INITIALIZATION
  // -------------------------------------------------------------
  const calculateDijkstra = useCallback(async () => {
    setIsCalculating(true);
    try {
      const result = await algorithmService.calculateDijkstra({
        nodes,
        edges,
        sourceId: 'S',
        destinationId: 'D',
      });

      setDijkstraResult(result);
      setIsTopologyModified(false);
      try {
        sessionStorage.setItem('netroute_last_result', JSON.stringify(result));
      } catch (e) {
        console.warn('Could not persist dijkstra result to sessionStorage:', e);
      }

      // Generate deterministic snapshots from trace
      const snapshots = generateSimulationSnapshots(nodes, edges, result.steps, result);
      setSimulationSnapshots(snapshots);

      return { result, snapshots };
    } catch (err) {
      console.error('Dijkstra calculation error:', err);
      showToast(err.message || 'Error executing Dijkstra calculation.', 'error');
      return null;
    } finally {
      setIsCalculating(false);
    }
  }, [nodes, edges, showToast]);

  // Start Step-by-Step Simulation Mode
  const startSimulation = useCallback(async () => {
    let snaps = simulationSnapshots;
    if (!dijkstraResult || snaps.length === 0 || isTopologyModified) {
      const calc = await calculateDijkstra();
      if (!calc) return;
      snaps = calc.snapshots;
    }
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setIsSimulating(true);
    showToast('Entered step-by-step simulation mode.', 'info');
  }, [simulationSnapshots, dijkstraResult, isTopologyModified, calculateDijkstra, showToast]);

  // Exit Simulation Mode
  const exitSimulation = useCallback(() => {
    setIsSimulating(false);
    showToast('Returned to topology editor.', 'info');
  }, [showToast]);

  // Reset algorithm result / remove highlighting
  const resetAlgorithmResult = useCallback(() => {
    setIsSimulating(false);
    setDijkstraResult(null);
    setSimulationSnapshots([]);
    setIsTopologyModified(false);
    try {
      sessionStorage.removeItem('netroute_last_result');
    } catch { }
    showToast('Cleared shortest path highlighting and results.', 'info');
  }, [showToast]);

  return {
    nodes,
    edges,
    selectedNodeId,
    selectedEdgeId,
    hasUnsavedChanges,
    isLoading,
    isSaving,
    isCalculating,
    dijkstraResult,
    isTopologyModified,
    isSimulating,
    simulationSnapshots,
    pendingConnection,
    setSelectedNodeId,
    setSelectedEdgeId,
    onNodesChange,
    onEdgesChange,
    addRouter,
    deleteNode,
    onConnect,
    confirmConnection,
    cancelConnection,
    updateEdgeWeight,
    updateEdgeDirection,
    deleteEdge,
    saveTopology,
    loadExample,
    clearNetwork,
    fetchTopology,
    calculateDijkstra,
    startSimulation,
    exitSimulation,
    resetAlgorithmResult,
  };
};
