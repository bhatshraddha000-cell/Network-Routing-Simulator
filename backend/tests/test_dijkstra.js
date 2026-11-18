import assert from 'assert';
import { MinPriorityQueue } from '../utils/MinPriorityQueue.js';
import { buildAdjacencyList, findShortestPath } from '../services/dijkstraService.js';

console.log('=== Running NetRoute Module 2: Dijkstra Algorithm Engine Tests ===\n');

// -------------------------------------------------------------
// PART 1: MinPriorityQueue Unit Tests
// -------------------------------------------------------------
console.log('--- PART 1: MinPriorityQueue Unit Tests ---');
{
  const pq = new MinPriorityQueue();
  assert.strictEqual(pq.isEmpty(), true);
  assert.strictEqual(pq.size(), 0);
  assert.strictEqual(pq.peek(), null);
  assert.strictEqual(pq.extractMin(), null);

  // Insert elements out of order
  pq.insert({ nodeId: 'R3', distance: 15 });
  pq.insert({ nodeId: 'S', distance: 0 });
  pq.insert({ nodeId: 'R1', distance: 5 });
  pq.insert({ nodeId: 'R2', distance: 8.5 });
  pq.insert({ nodeId: 'D', distance: 2 });

  assert.strictEqual(pq.size(), 5);
  assert.strictEqual(pq.peek().nodeId, 'S');
  assert.strictEqual(pq.peek().distance, 0);

  // Extract in ascending order of distance
  const extracted = [];
  while (!pq.isEmpty()) {
    extracted.push(pq.extractMin());
  }

  assert.deepStrictEqual(
    extracted.map((e) => e.nodeId),
    ['S', 'D', 'R1', 'R2', 'R3']
  );
  assert.deepStrictEqual(
    extracted.map((e) => e.distance),
    [0, 2, 5, 8.5, 15]
  );
  assert.strictEqual(pq.isEmpty(), true);
  console.log('✓ MinPriorityQueue correctly maintains binary min-heap invariant and extracts in ascending order.');
}

// -------------------------------------------------------------
// PART 2: Adjacency List Construction Tests
// -------------------------------------------------------------
console.log('\n--- PART 2: Adjacency List Construction Tests ---');
{
  const nodes = [{ id: 'S' }, { id: 'R1' }, { id: 'D' }];
  const edges = [
    { id: 'e1', source: 'S', target: 'R1', weight: 4, direction: 'BIDIRECTIONAL' },
    { id: 'e2', source: 'R1', target: 'D', weight: 3, direction: 'ONE_WAY' },
  ];

  const adj = buildAdjacencyList(nodes, edges);

  // S has outgoing to R1
  assert.strictEqual(adj.get('S').length, 1);
  assert.strictEqual(adj.get('S')[0].to, 'R1');
  assert.strictEqual(adj.get('S')[0].weight, 4);

  // R1 has outgoing to S (bidirectional from e1) and outgoing to D (one-way from e2)
  assert.strictEqual(adj.get('R1').length, 2);
  const r1ToS = adj.get('R1').find((e) => e.to === 'S');
  const r1ToD = adj.get('R1').find((e) => e.to === 'D');
  assert.ok(r1ToS);
  assert.ok(r1ToD);

  // D has NO outgoing edges (since e2 is ONE_WAY from R1 to D)
  assert.strictEqual(adj.get('D').length, 0);
  console.log('✓ Adjacency list correctly differentiates BIDIRECTIONAL and ONE_WAY edges.');
}

// -------------------------------------------------------------
// PART 3: 10 Critical Edge Cases (Section 11)
// -------------------------------------------------------------
console.log('\n--- PART 3: Verification of All 10 Critical Edge Cases ---');

// Case 1: Direct connection: S --10-- D
{
  const nodes = [{ id: 'S' }, { id: 'D' }];
  const edges = [{ id: 'e1', source: 'S', target: 'D', weight: 10, direction: 'BIDIRECTIONAL' }];

  const result = findShortestPath({ nodes, edges, sourceId: 'S', destinationId: 'D' });
  assert.strictEqual(result.reachable, true);
  assert.deepStrictEqual(result.shortestPath, ['S', 'D']);
  assert.strictEqual(result.totalCost, 10);
  assert.deepStrictEqual(result.shortestPathEdges, ['e1']);
  console.log('✓ Case 1: Direct connection (S -10- D) produces [S, D] with cost 10.');
}

// Case 2: Multiple possible paths
// S --4-- R1 --5-- D
// S --2-- R2 --10-- D
// R1 --3-- R2
{
  const nodes = [{ id: 'S' }, { id: 'R1' }, { id: 'R2' }, { id: 'D' }];
  const edges = [
    { id: 'e1', source: 'S', target: 'R1', weight: 4, direction: 'BIDIRECTIONAL' },
    { id: 'e2', source: 'R1', target: 'D', weight: 5, direction: 'BIDIRECTIONAL' },
    { id: 'e3', source: 'S', target: 'R2', weight: 2, direction: 'BIDIRECTIONAL' },
    { id: 'e4', source: 'R2', target: 'D', weight: 10, direction: 'BIDIRECTIONAL' },
  ];

  const result = findShortestPath({ nodes, edges, sourceId: 'S', destinationId: 'D' });
  assert.strictEqual(result.reachable, true);
  assert.deepStrictEqual(result.shortestPath, ['S', 'R1', 'D']);
  assert.strictEqual(result.totalCost, 9);
  console.log('✓ Case 2: Multiple paths selects minimum cost route (S -> R1 -> D, cost 9).');
}

// Case 3: More intermediate routers (at least 5 intermediate routers)
// S -> R1 (2) -> R2 (2) -> R3 (2) -> R4 (2) -> R5 (2) -> D (2) = total 12
// Shortcut S -> R3 (5) -> R5 (4) -> D (2) = total 11
// Longer detour S -> R1 (2) -> R4 (15) -> D (1) = 18
{
  const nodes = [
    { id: 'S' },
    { id: 'R1' },
    { id: 'R2' },
    { id: 'R3' },
    { id: 'R4' },
    { id: 'R5' },
    { id: 'D' },
  ];
  const edges = [
    { id: 'e1', source: 'S', target: 'R1', weight: 2, direction: 'BIDIRECTIONAL' },
    { id: 'e2', source: 'R1', target: 'R2', weight: 2, direction: 'BIDIRECTIONAL' },
    { id: 'e3', source: 'R2', target: 'R3', weight: 2, direction: 'BIDIRECTIONAL' },
    { id: 'e4', source: 'R3', target: 'R4', weight: 2, direction: 'BIDIRECTIONAL' },
    { id: 'e5', source: 'R4', target: 'R5', weight: 2, direction: 'BIDIRECTIONAL' },
    { id: 'e6', source: 'R5', target: 'D', weight: 2, direction: 'BIDIRECTIONAL' },
    // Shortcut
    { id: 'e7', source: 'S', target: 'R3', weight: 5, direction: 'BIDIRECTIONAL' },
    { id: 'e8', source: 'R3', target: 'R5', weight: 4, direction: 'BIDIRECTIONAL' },
    // Detour
    { id: 'e9', source: 'R1', target: 'R4', weight: 15, direction: 'BIDIRECTIONAL' },
  ];

  const result = findShortestPath({ nodes, edges, sourceId: 'S', destinationId: 'D' });
  assert.strictEqual(result.reachable, true);
  // Path S -> R3 (5) -> R5 (4) -> D (2) = 11 vs S -> R1 (2) -> R2 (2) -> R3 (2) -> R5 (4) -> D (2) = 12
  assert.deepStrictEqual(result.shortestPath, ['S', 'R3', 'R5', 'D']);
  assert.strictEqual(result.totalCost, 11);
  console.log('✓ Case 3: Complex 7-node network correctly identifies lowest cost path (cost 11).');
}

// Case 4: Unreachable destination
{
  const nodes = [{ id: 'S' }, { id: 'R1' }, { id: 'D' }];
  const edges = [{ id: 'e1', source: 'S', target: 'R1', weight: 5, direction: 'BIDIRECTIONAL' }];

  const result = findShortestPath({ nodes, edges, sourceId: 'S', destinationId: 'D' });
  assert.strictEqual(result.reachable, false);
  assert.deepStrictEqual(result.shortestPath, []);
  assert.strictEqual(result.totalCost, null);
  assert.deepStrictEqual(result.shortestPathEdges, []);

  const destRow = result.distanceTable.find((row) => row.nodeId === 'D');
  assert.strictEqual(destRow.status, 'UNREACHABLE');
  assert.strictEqual(destRow.distance, null);
  assert.strictEqual(destRow.predecessor, null);
  console.log('✓ Case 4: Unreachable destination returns reachable: false, null cost, and empty path.');
}

// Case 5: One-way connection (respects direction)
// S -> R1 (ONE_WAY: S to R1)
// R2 -> R1 (ONE_WAY: R2 to R1)
// R2 -> D (ONE_WAY: R2 to D)
// Cannot go from R1 backwards to R2! So D is unreachable!
{
  const nodes = [{ id: 'S' }, { id: 'R1' }, { id: 'R2' }, { id: 'D' }];
  const edges = [
    { id: 'e1', source: 'S', target: 'R1', weight: 2, direction: 'ONE_WAY' },
    { id: 'e2', source: 'R2', target: 'R1', weight: 3, direction: 'ONE_WAY' }, // incoming to R1, not outgoing!
    { id: 'e3', source: 'R2', target: 'D', weight: 4, direction: 'ONE_WAY' },
  ];

  const result = findShortestPath({ nodes, edges, sourceId: 'S', destinationId: 'D' });
  assert.strictEqual(result.reachable, false);
  assert.deepStrictEqual(result.shortestPath, []);
  console.log('✓ Case 5: One-way links are strictly one-directional and cannot be traversed backwards.');
}

// Case 6: Bidirectional connection
// Even if stored as source: 'D', target: 'R1', a bidirectional link must be traversable S -> R1 -> D
{
  const nodes = [{ id: 'S' }, { id: 'R1' }, { id: 'D' }];
  const edges = [
    { id: 'e1', source: 'S', target: 'R1', weight: 3, direction: 'BIDIRECTIONAL' },
    { id: 'e2', source: 'D', target: 'R1', weight: 4, direction: 'BIDIRECTIONAL' }, // reversed storage orientation
  ];

  const result = findShortestPath({ nodes, edges, sourceId: 'S', destinationId: 'D' });
  assert.strictEqual(result.reachable, true);
  assert.deepStrictEqual(result.shortestPath, ['S', 'R1', 'D']);
  assert.strictEqual(result.totalCost, 7);
  assert.deepStrictEqual(result.shortestPathEdges, ['e1', 'e2']);
  console.log('✓ Case 6: Bidirectional links are traversable in both directions regardless of storage orientation.');
}

// Case 7: Cycles in network
// S -1- R1 -1- R2 -1- S (triangle cycle), and R2 -2- D
{
  const nodes = [{ id: 'S' }, { id: 'R1' }, { id: 'R2' }, { id: 'D' }];
  const edges = [
    { id: 'e1', source: 'S', target: 'R1', weight: 1, direction: 'BIDIRECTIONAL' },
    { id: 'e2', source: 'R1', target: 'R2', weight: 1, direction: 'BIDIRECTIONAL' },
    { id: 'e3', source: 'R2', target: 'S', weight: 5, direction: 'BIDIRECTIONAL' },
    { id: 'e4', source: 'R2', target: 'D', weight: 2, direction: 'BIDIRECTIONAL' },
  ];

  const result = findShortestPath({ nodes, edges, sourceId: 'S', destinationId: 'D' });
  assert.strictEqual(result.reachable, true);
  assert.deepStrictEqual(result.shortestPath, ['S', 'R1', 'R2', 'D']);
  assert.strictEqual(result.totalCost, 4);
  console.log('✓ Case 7: Network cycles terminate cleanly and prevent infinite loops.');
}

// Case 8: Different weights (decimal precision)
{
  const nodes = [{ id: 'S' }, { id: 'R1' }, { id: 'D' }];
  const edges = [
    { id: 'e1', source: 'S', target: 'R1', weight: 3.15, direction: 'BIDIRECTIONAL' },
    { id: 'e2', source: 'R1', target: 'D', weight: 2.85, direction: 'BIDIRECTIONAL' },
  ];

  const result = findShortestPath({ nodes, edges, sourceId: 'S', destinationId: 'D' });
  assert.strictEqual(result.reachable, true);
  assert.strictEqual(result.totalCost, 6);
  console.log('✓ Case 8: Decimal weights are accurately computed without floating-point errors.');
}

// Case 9: Equal-cost alternative routes (Deterministic tie handling)
// Path 1: S -> R1 -> D (cost 5 + 5 = 10)
// Path 2: S -> R2 -> D (cost 5 + 5 = 10)
{
  const nodes = [{ id: 'S' }, { id: 'R1' }, { id: 'R2' }, { id: 'D' }];
  const edges = [
    { id: 'e1', source: 'S', target: 'R1', weight: 5, direction: 'BIDIRECTIONAL' },
    { id: 'e2', source: 'R1', target: 'D', weight: 5, direction: 'BIDIRECTIONAL' },
    { id: 'e3', source: 'S', target: 'R2', weight: 5, direction: 'BIDIRECTIONAL' },
    { id: 'e4', source: 'R2', target: 'D', weight: 5, direction: 'BIDIRECTIONAL' },
  ];

  const result1 = findShortestPath({ nodes, edges, sourceId: 'S', destinationId: 'D' });
  const result2 = findShortestPath({ nodes, edges, sourceId: 'S', destinationId: 'D' });

  assert.deepStrictEqual(result1.shortestPath, result2.shortestPath);
  assert.strictEqual(result1.totalCost, 10);
  console.log('✓ Case 9: Equal-cost routes produce deterministic, consistent results.');
}

// Case 10: Disconnected intermediate routers
{
  const nodes = [
    { id: 'S' },
    { id: 'R1' },
    { id: 'R2' }, // Disconnected island
    { id: 'R3' }, // Connected to R2 but not S
    { id: 'D' },
  ];
  const edges = [
    { id: 'e1', source: 'S', target: 'R1', weight: 4, direction: 'BIDIRECTIONAL' },
    { id: 'e2', source: 'R1', target: 'D', weight: 6, direction: 'BIDIRECTIONAL' },
    { id: 'e3', source: 'R2', target: 'R3', weight: 2, direction: 'BIDIRECTIONAL' },
  ];

  const result = findShortestPath({ nodes, edges, sourceId: 'S', destinationId: 'D' });
  assert.strictEqual(result.reachable, true);
  assert.deepStrictEqual(result.shortestPath, ['S', 'R1', 'D']);
  assert.strictEqual(result.totalCost, 10);

  const r2Row = result.distanceTable.find((row) => row.nodeId === 'R2');
  const r3Row = result.distanceTable.find((row) => row.nodeId === 'R3');
  assert.strictEqual(r2Row.status, 'UNREACHABLE');
  assert.strictEqual(r2Row.distance, null);
  assert.strictEqual(r2Row.visitOrder, null);
  assert.strictEqual(r3Row.status, 'UNREACHABLE');
  assert.strictEqual(r3Row.distance, null);
  console.log('✓ Case 10: Disconnected intermediate routers appear as UNREACHABLE with null distance and visit order.');
}

// -------------------------------------------------------------
// PART 4: Verification of Execution Trace Structure (Module 3 prep)
// -------------------------------------------------------------
console.log('\n--- PART 4: Execution Trace Verification ---');
{
  const nodes = [{ id: 'S' }, { id: 'R1' }, { id: 'D' }];
  const edges = [
    { id: 'e1', source: 'S', target: 'R1', weight: 4, direction: 'BIDIRECTIONAL' },
    { id: 'e2', source: 'R1', target: 'D', weight: 5, direction: 'BIDIRECTIONAL' },
  ];

  const result = findShortestPath({ nodes, edges, sourceId: 'S', destinationId: 'D' });
  assert.ok(Array.isArray(result.steps));
  assert.ok(result.steps.length > 0);

  // Check event types
  const types = new Set(result.steps.map((s) => s.type));
  assert.ok(types.has('INITIALIZE_NODE'));
  assert.ok(types.has('SELECT_NODE'));
  assert.ok(types.has('EXAMINE_EDGE'));
  assert.ok(types.has('DISTANCE_UPDATED'));
  assert.ok(types.has('FINALIZE_NODE'));
  assert.ok(types.has('ALGORITHM_COMPLETE'));

  // Check sequence ordering
  for (let i = 0; i < result.steps.length; i++) {
    assert.strictEqual(result.steps[i].sequence, i + 1);
  }
  console.log(`✓ Execution trace contains ${result.steps.length} sequential steps matching Module 3 specifications.`);
}

console.log('\n======================================================');
console.log('ALL MODULE 2 DIJKSTRA ENGINE UNIT TESTS PASSED (100%)!');
console.log('======================================================\n');

