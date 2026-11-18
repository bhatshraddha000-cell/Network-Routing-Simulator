import { Topology } from '../models/Topology.js';

export const DEFAULT_SOURCE_NODE = {
  id: 'S',
  label: 'Source (S)',
  type: 'source',
  position: { x: 100, y: 250 },
};

export const DEFAULT_DESTINATION_NODE = {
  id: 'D',
  label: 'Destination (D)',
  type: 'destination',
  position: { x: 900, y: 250 },
};

export const EXAMPLE_TOPOLOGY = {
  name: 'Sample 6-Router Mesh Network',
  nodes: [
    DEFAULT_SOURCE_NODE,
    {
      id: 'R1',
      label: 'R1',
      type: 'intermediate',
      position: { x: 360, y: 130 },
    },
    {
      id: 'R2',
      label: 'R2',
      type: 'intermediate',
      position: { x: 360, y: 370 },
    },
    {
      id: 'R3',
      label: 'R3',
      type: 'intermediate',
      position: { x: 640, y: 130 },
    },
    {
      id: 'R4',
      label: 'R4',
      type: 'intermediate',
      position: { x: 640, y: 370 },
    },
    DEFAULT_DESTINATION_NODE,
  ],
  edges: [
    { id: 'e-S-R1', source: 'S', target: 'R1', weight: 4, direction: 'BIDIRECTIONAL' },
    { id: 'e-S-R2', source: 'S', target: 'R2', weight: 2, direction: 'BIDIRECTIONAL' },
    { id: 'e-R1-R2', source: 'R1', target: 'R2', weight: 1, direction: 'BIDIRECTIONAL' },
    { id: 'e-R1-R3', source: 'R1', target: 'R3', weight: 5, direction: 'BIDIRECTIONAL' },
    { id: 'e-R2-R4', source: 'R2', target: 'R4', weight: 8, direction: 'BIDIRECTIONAL' },
    { id: 'e-R3-R4', source: 'R3', target: 'R4', weight: 2, direction: 'BIDIRECTIONAL' },
    { id: 'e-R3-D', source: 'R3', target: 'D', weight: 6, direction: 'BIDIRECTIONAL' },
    { id: 'e-R4-D', source: 'R4', target: 'D', weight: 3, direction: 'BIDIRECTIONAL' },
  ],
};

/**
 * Validates topology nodes and edges against domain rules
 */
export const validateTopologyData = (nodes, edges) => {
  if (!Array.isArray(nodes)) {
    return { valid: false, message: 'Nodes must be an array.' };
  }
  if (!Array.isArray(edges)) {
    return { valid: false, message: 'Edges must be an array.' };
  }

  if (nodes.length > 50) {
    return {
      valid: false,
      message: 'Network size limit reached. Maximum 50 routers allowed.',
    };
  }

  // Check permanent endpoints S and D
  const sourceNode = nodes.find((n) => n.id === 'S');
  const destNode = nodes.find((n) => n.id === 'D');

  if (!sourceNode || sourceNode.type !== 'source') {
    return { valid: false, message: 'Fixed Source router (S) is required and cannot be removed.' };
  }
  if (!destNode || destNode.type !== 'destination') {
    return { valid: false, message: 'Fixed Destination router (D) is required and cannot be removed.' };
  }

  // Check unique node IDs
  const nodeIds = new Set();
  for (const node of nodes) {
    if (!node.id || typeof node.id !== 'string') {
      return { valid: false, message: 'Every node must have a valid string ID.' };
    }
    if (nodeIds.has(node.id)) {
      return { valid: false, message: `Duplicate router ID detected: ${node.id}` };
    }
    nodeIds.add(node.id);

    if (
      !node.position ||
      typeof node.position.x !== 'number' ||
      typeof node.position.y !== 'number' ||
      isNaN(node.position.x) ||
      isNaN(node.position.y)
    ) {
      return { valid: false, message: `Invalid position coordinates for router ${node.id}.` };
    }
  }

  // Check edges
  const connectionPairs = new Set();
  for (const edge of edges) {
    if (!edge.id) {
      return { valid: false, message: 'Every edge must have a unique ID.' };
    }
    if (!nodeIds.has(edge.source)) {
      return { valid: false, message: `Edge ${edge.id} references non-existent source router ${edge.source}.` };
    }
    if (!nodeIds.has(edge.target)) {
      return { valid: false, message: `Edge ${edge.id} references non-existent target router ${edge.target}.` };
    }
    if (edge.source === edge.target) {
      return { valid: false, message: `Self-loops are not allowed: router ${edge.source} cannot connect to itself.` };
    }

    const weight = Number(edge.weight);
    if (isNaN(weight) || weight <= 0) {
      return {
        valid: false,
        message: `Edge ${edge.id} must have a positive weight greater than zero. Received: ${edge.weight}`,
      };
    }

    const direction = edge.direction || 'BIDIRECTIONAL';
    if (!['BIDIRECTIONAL', 'ONE_WAY'].includes(direction)) {
      return { valid: false, message: `Invalid direction: ${direction}. Must be BIDIRECTIONAL or ONE_WAY.` };
    }

    // Check duplicate connections
    // If either edge is bidirectional or connecting same pair, prevent duplicate connection between router pair
    const pairKey = [edge.source, edge.target].sort().join('<->');
    if (connectionPairs.has(pairKey)) {
      return {
        valid: false,
        message: `Duplicate connection detected between routers ${edge.source} and ${edge.target}.`,
      };
    }
    connectionPairs.add(pairKey);
  }

  return { valid: true };
};

/**
 * GET /api/topology/current
 */
export const getCurrentTopology = async (req, res, next) => {
  try {
    let topology = await Topology.findOne({ isCurrent: true }).sort({ updatedAt: -1 });

    if (!topology) {
      // Initialize an empty topology containing Source S and Destination D
      topology = await Topology.create({
        name: 'Default Topology',
        isCurrent: true,
        nodes: [DEFAULT_SOURCE_NODE, DEFAULT_DESTINATION_NODE],
        edges: [],
      });
      console.log('[Topology] Initialized fresh default topology with S and D endpoints.');
    }

    return res.status(200).json({
      success: true,
      data: topology,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/topology/current
 */
export const saveCurrentTopology = async (req, res, next) => {
  try {
    const { name, nodes, edges } = req.body;

    const validation = validateTopologyData(nodes, edges);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.message,
      });
    }

    // Clean edge weights to at most 2 decimal places
    const cleanedEdges = edges.map((edge) => ({
      ...edge,
      weight: Math.round(Number(edge.weight) * 100) / 100,
      direction: edge.direction || 'BIDIRECTIONAL',
    }));

    let topology = await Topology.findOne({ isCurrent: true }).sort({ updatedAt: -1 });

    if (!topology) {
      topology = new Topology({
        name: name || 'Current Working Topology',
        isCurrent: true,
        nodes,
        edges: cleanedEdges,
      });
    } else {
      if (name) topology.name = name;
      topology.nodes = nodes;
      topology.edges = cleanedEdges;
      topology.isCurrent = true;
    }

    const saved = await topology.save();

    return res.status(200).json({
      success: true,
      message: 'Topology saved successfully.',
      data: saved,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/topology/current/reset
 */
export const resetCurrentTopology = async (req, res, next) => {
  try {
    let topology = await Topology.findOne({ isCurrent: true }).sort({ updatedAt: -1 });

    const defaultNodes = [
      { ...DEFAULT_SOURCE_NODE },
      { ...DEFAULT_DESTINATION_NODE },
    ];
    const defaultEdges = [];

    if (!topology) {
      topology = await Topology.create({
        name: 'Default Topology',
        isCurrent: true,
        nodes: defaultNodes,
        edges: defaultEdges,
      });
    } else {
      topology.nodes = defaultNodes;
      topology.edges = defaultEdges;
      await topology.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Network topology reset. Source S and Destination D preserved.',
      data: topology,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/topology/example
 */
export const loadExampleTopology = async (req, res, next) => {
  try {
    let topology = await Topology.findOne({ isCurrent: true }).sort({ updatedAt: -1 });

    if (!topology) {
      topology = await Topology.create({
        name: EXAMPLE_TOPOLOGY.name,
        isCurrent: true,
        nodes: EXAMPLE_TOPOLOGY.nodes,
        edges: EXAMPLE_TOPOLOGY.edges,
      });
    } else {
      topology.name = EXAMPLE_TOPOLOGY.name;
      topology.nodes = EXAMPLE_TOPOLOGY.nodes;
      topology.edges = EXAMPLE_TOPOLOGY.edges;
      await topology.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Sample example network topology loaded successfully.',
      data: topology,
    });
  } catch (error) {
    next(error);
  }
};

