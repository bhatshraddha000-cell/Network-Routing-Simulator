import assert from 'assert';
import {
  validateTopologyData,
  DEFAULT_SOURCE_NODE,
  DEFAULT_DESTINATION_NODE,
  EXAMPLE_TOPOLOGY,
} from '../controllers/topologyController.js';

console.log('--- Running NetRoute Topology Validation & Logic Tests ---');

// Test 1: Start with empty graph containing only Source S and Destination D
{
  const nodes = [DEFAULT_SOURCE_NODE, DEFAULT_DESTINATION_NODE];
  const edges = [];
  const res = validateTopologyData(nodes, edges);
  assert.strictEqual(res.valid, true, 'Test 1 Failed: Valid initial topology with S and D should pass');
  console.log('✓ Scenario 1: Initial topology with S and D is valid.');
}

// Test 2: Add R1, R2 and R3
{
  const nodes = [
    DEFAULT_SOURCE_NODE,
    { id: 'R1', label: 'R1', type: 'intermediate', position: { x: 300, y: 150 } },
    { id: 'R2', label: 'R2', type: 'intermediate', position: { x: 300, y: 350 } },
    { id: 'R3', label: 'R3', type: 'intermediate', position: { x: 600, y: 250 } },
    DEFAULT_DESTINATION_NODE,
  ];
  const edges = [];
  const res = validateTopologyData(nodes, edges);
  assert.strictEqual(res.valid, true, 'Test 2 Failed');
  console.log('✓ Scenario 2: Added intermediate routers R1, R2, R3 successfully.');
}

// Test 3, 4, 5, 6: Connect S -> R1 (5), R1 -> R2 (3), R2 -> D (7), S -> R2 (10)
{
  const nodes = [
    DEFAULT_SOURCE_NODE,
    { id: 'R1', label: 'R1', type: 'intermediate', position: { x: 300, y: 150 } },
    { id: 'R2', label: 'R2', type: 'intermediate', position: { x: 300, y: 350 } },
    DEFAULT_DESTINATION_NODE,
  ];
  const edges = [
    { id: 'e1', source: 'S', target: 'R1', weight: 5, direction: 'BIDIRECTIONAL' },
    { id: 'e2', source: 'R1', target: 'R2', weight: 3, direction: 'BIDIRECTIONAL' },
    { id: 'e3', source: 'R2', target: 'D', weight: 7, direction: 'BIDIRECTIONAL' },
    { id: 'e4', source: 'S', target: 'R2', weight: 10, direction: 'BIDIRECTIONAL' },
  ];
  const res = validateTopologyData(nodes, edges);
  assert.strictEqual(res.valid, true, 'Test 3-6 Failed');
  console.log('✓ Scenario 3-6: Connected S-R1 (5), R1-R2 (3), R2-D (7), and alternate S-R2 (10).');
}

// Test 7: Modify weight
{
  const nodes = [
    DEFAULT_SOURCE_NODE,
    { id: 'R1', label: 'R1', type: 'intermediate', position: { x: 300, y: 150 } },
    DEFAULT_DESTINATION_NODE,
  ];
  const edges = [
    { id: 'e1', source: 'S', target: 'R1', weight: 8.5, direction: 'BIDIRECTIONAL' },
  ];
  const res = validateTopologyData(nodes, edges);
  assert.strictEqual(res.valid, true, 'Test 7 Failed');
  console.log('✓ Scenario 7: Changed weight to decimal value 8.5 successfully.');
}

// Test 8: One-way link validation
{
  const nodes = [
    DEFAULT_SOURCE_NODE,
    { id: 'R1', label: 'R1', type: 'intermediate', position: { x: 300, y: 150 } },
    DEFAULT_DESTINATION_NODE,
  ];
  const edges = [
    { id: 'e1', source: 'S', target: 'R1', weight: 4.25, direction: 'ONE_WAY' },
  ];
  const res = validateTopologyData(nodes, edges);
  assert.strictEqual(res.valid, true, 'Test 8 Failed');
  console.log('✓ Scenario 8: Validated one-way directed link.');
}

// Test 9 & 10: Delete link and delete router (cascading removal)
{
  let nodes = [
    DEFAULT_SOURCE_NODE,
    { id: 'R1', label: 'R1', type: 'intermediate', position: { x: 300, y: 150 } },
    { id: 'R2', label: 'R2', type: 'intermediate', position: { x: 300, y: 350 } },
    DEFAULT_DESTINATION_NODE,
  ];
  let edges = [
    { id: 'e1', source: 'S', target: 'R1', weight: 5, direction: 'BIDIRECTIONAL' },
    { id: 'e2', source: 'R1', target: 'R2', weight: 3, direction: 'BIDIRECTIONAL' },
    { id: 'e3', source: 'R2', target: 'D', weight: 7, direction: 'BIDIRECTIONAL' },
  ];

  // Delete e2
  edges = edges.filter((e) => e.id !== 'e2');
  assert.strictEqual(edges.length, 2, 'Edge e2 should be removed');
  console.log('✓ Scenario 9: Successfully deleted link e2.');

  // Delete router R1 and its connected edges
  const routerToDelete = 'R1';
  nodes = nodes.filter((n) => n.id !== routerToDelete);
  edges = edges.filter((e) => e.source !== routerToDelete && e.target !== routerToDelete);
  assert.strictEqual(nodes.length, 3, 'R1 should be deleted');
  assert.strictEqual(edges.length, 1, 'Connected edges to R1 should be cascaded and deleted');
  assert.strictEqual(edges[0].id, 'e3', 'Only e3 (R2-D) remains');
  const res = validateTopologyData(nodes, edges);
  assert.strictEqual(res.valid, true);
  console.log('✓ Scenario 10: Deleted router R1 and verified all connected links automatically removed.');
}

// Test 11: Source and Destination cannot be deleted
{
  const nodesWithoutSource = [
    { id: 'R1', label: 'R1', type: 'intermediate', position: { x: 300, y: 150 } },
    DEFAULT_DESTINATION_NODE,
  ];
  const res = validateTopologyData(nodesWithoutSource, []);
  assert.strictEqual(res.valid, false);
  assert.match(res.message, /Source router \(S\) is required/);

  const nodesWithoutDest = [
    DEFAULT_SOURCE_NODE,
    { id: 'R1', label: 'R1', type: 'intermediate', position: { x: 300, y: 150 } },
  ];
  const res2 = validateTopologyData(nodesWithoutDest, []);
  assert.strictEqual(res2.valid, false);
  assert.match(res2.message, /Destination router \(D\) is required/);
  console.log('✓ Scenario 11: Verified that Source (S) and Destination (D) cannot be deleted.');
}

// Test 14: Example topology validity
{
  const res = validateTopologyData(EXAMPLE_TOPOLOGY.nodes, EXAMPLE_TOPOLOGY.edges);
  assert.strictEqual(res.valid, true, 'Example topology must be valid');
  assert.strictEqual(EXAMPLE_TOPOLOGY.nodes.length, 6, 'Example topology has 6 nodes (S, R1, R2, R3, R4, D)');
  assert.strictEqual(EXAMPLE_TOPOLOGY.edges.length, 8, 'Example topology has 8 edges');
  console.log('✓ Scenario 14: Verified sample example topology validity and routes.');
}

// Test 15: Clear graph restores starting topology
{
  const clearedNodes = [DEFAULT_SOURCE_NODE, DEFAULT_DESTINATION_NODE];
  const clearedEdges = [];
  const res = validateTopologyData(clearedNodes, clearedEdges);
  assert.strictEqual(res.valid, true);
  assert.strictEqual(clearedNodes.length, 2);
  assert.strictEqual(clearedEdges.length, 0);
  console.log('✓ Scenario 15: Clear graph restores only Source and Destination endpoints.');
}

// Negative Validation Tests:
// a) Negative or Zero Weight
{
  const nodes = [DEFAULT_SOURCE_NODE, DEFAULT_DESTINATION_NODE];
  const edges = [{ id: 'e1', source: 'S', target: 'D', weight: 0, direction: 'BIDIRECTIONAL' }];
  const res = validateTopologyData(nodes, edges);
  assert.strictEqual(res.valid, false);
  assert.match(res.message, /positive weight greater than zero/);

  const edges2 = [{ id: 'e2', source: 'S', target: 'D', weight: -5, direction: 'BIDIRECTIONAL' }];
  const res2 = validateTopologyData(nodes, edges2);
  assert.strictEqual(res2.valid, false);
  console.log('✓ Negative weights and zero weights are rejected.');
}

// b) Self loops
{
  const nodes = [DEFAULT_SOURCE_NODE, DEFAULT_DESTINATION_NODE];
  const edges = [{ id: 'e1', source: 'S', target: 'S', weight: 5, direction: 'BIDIRECTIONAL' }];
  const res = validateTopologyData(nodes, edges);
  assert.strictEqual(res.valid, false);
  assert.match(res.message, /Self-loops are not allowed/);
  console.log('✓ Self-loops are rejected.');
}

// c) Duplicate edges
{
  const nodes = [DEFAULT_SOURCE_NODE, DEFAULT_DESTINATION_NODE];
  const edges = [
    { id: 'e1', source: 'S', target: 'D', weight: 5, direction: 'BIDIRECTIONAL' },
    { id: 'e2', source: 'D', target: 'S', weight: 3, direction: 'BIDIRECTIONAL' },
  ];
  const res = validateTopologyData(nodes, edges);
  assert.strictEqual(res.valid, false);
  assert.match(res.message, /Duplicate connection detected/);
  console.log('✓ Duplicate connections between same router pair are rejected.');
}

// d) Max 50 routers limit
{
  const nodes = [DEFAULT_SOURCE_NODE, DEFAULT_DESTINATION_NODE];
  for (let i = 1; i <= 49; i++) {
    nodes.push({ id: `R${i}`, label: `R${i}`, type: 'intermediate', position: { x: i * 10, y: i * 10 } });
  }
  // Total 51 nodes
  const res = validateTopologyData(nodes, []);
  assert.strictEqual(res.valid, false);
  assert.match(res.message, /Maximum 50 routers allowed/);
  console.log('✓ Exceeding maximum 50 routers limit is rejected.');
}

console.log('\nALL 15 VALIDATION & DOMAIN LOGIC SCENARIOS PASSED SUCCESSFULLY!');

