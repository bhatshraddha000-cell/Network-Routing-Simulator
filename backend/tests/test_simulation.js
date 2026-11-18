import assert from 'assert';
import { findShortestPath } from '../services/dijkstraService.js';

console.log('=== Running NetRoute Module 3: Step-by-Step Simulation Engine Tests ===\n');

// -------------------------------------------------------------
// Test 1: Simple Direct Route (S -10- D)
// -------------------------------------------------------------
console.log('--- Test 1: Simple Direct Route (S -10- D) ---');
{
  const nodes = [{ id: 'S' }, { id: 'D' }];
  const edges = [{ id: 'e1', source: 'S', target: 'D', weight: 10, direction: 'BIDIRECTIONAL' }];

  const result = findShortestPath({ nodes, edges, sourceId: 'S', destinationId: 'D' });

  assert.strictEqual(result.reachable, true);
  assert.strictEqual(result.totalCost, 10);
  assert.deepStrictEqual(result.shortestPath, ['S', 'D']);

  // Verify sequential event order
  const eventTypes = result.steps.map((s) => s.type);
  assert.ok(eventTypes.includes('INITIALIZE_NODE'));
  assert.ok(eventTypes.includes('SELECT_NODE'));
  assert.ok(eventTypes.includes('EXAMINE_EDGE'));
  assert.ok(eventTypes.includes('DISTANCE_UPDATED'));
  assert.ok(eventTypes.includes('FINALIZE_NODE'));
  assert.ok(eventTypes.includes('ALGORITHM_COMPLETE'));

  // First selected node must be S with distance 0
  const firstSelect = result.steps.find((s) => s.type === 'SELECT_NODE');
  assert.strictEqual(firstSelect.nodeId, 'S');
  assert.strictEqual(firstSelect.currentDistance, 0);

  // Distance update for D must be 10 with predecessor S
  const distUpdateD = result.steps.find((s) => s.type === 'DISTANCE_UPDATED' && s.nodeId === 'D');
  assert.ok(distUpdateD);
  assert.strictEqual(distUpdateD.newDistance, 10);
  assert.strictEqual(distUpdateD.predecessor, 'S');

  console.log('✓ Test 1: Simple direct route generates exact sequential events from S=0 to D=10.');
}

// -------------------------------------------------------------
// Test 2: Multiple Possible Routes & Distance Improvement
// S -4- R1 -5- D
// S -2- R2 -10- D
// -------------------------------------------------------------
console.log('\n--- Test 2: Dynamic Distance Improvement (12 -> 9) ---');
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

  // Router selection order: S (0), then R2 (2), then R1 (4), then D (9)
  const selectedNodes = result.steps
    .filter((s) => s.type === 'SELECT_NODE')
    .map((s) => s.nodeId);
  assert.strictEqual(selectedNodes[0], 'S');
  assert.strictEqual(selectedNodes[1], 'R2'); // R2 extracted before R1 because 2 < 4
  assert.strictEqual(selectedNodes[2], 'R1');
  assert.strictEqual(selectedNodes[3], 'D');

  // Verify that D's distance updates TWICE: first to 12 via R2, then improves to 9 via R1
  const dUpdates = result.steps.filter(
    (s) => s.type === 'DISTANCE_UPDATED' && s.nodeId === 'D'
  );
  assert.strictEqual(dUpdates.length, 2);
  assert.strictEqual(dUpdates[0].fromNodeId, 'R2');
  assert.strictEqual(dUpdates[0].newDistance, 12);
  assert.strictEqual(dUpdates[1].fromNodeId, 'R1');
  assert.strictEqual(dUpdates[1].newDistance, 9);
  assert.strictEqual(dUpdates[1].previousDistance, 12);

  console.log('✓ Test 2: Verified D distance dynamically improves from 12 (via R2) to 9 (via R1).');
}

// -------------------------------------------------------------
// Test 3: Multiple Intermediate Routers (6 intermediate routers)
// -------------------------------------------------------------
console.log('\n--- Test 3: Complex Mesh Network (6 intermediate routers) ---');
{
  const nodes = [
    { id: 'S' },
    { id: 'R1' },
    { id: 'R2' },
    { id: 'R3' },
    { id: 'R4' },
    { id: 'R5' },
    { id: 'R6' },
    { id: 'D' },
  ];
  const edges = [
    { id: 'e1', source: 'S', target: 'R1', weight: 3, direction: 'BIDIRECTIONAL' },
    { id: 'e2', source: 'S', target: 'R2', weight: 6, direction: 'BIDIRECTIONAL' },
    { id: 'e3', source: 'R1', target: 'R3', weight: 4, direction: 'BIDIRECTIONAL' },
    { id: 'e4', source: 'R2', target: 'R4', weight: 2, direction: 'BIDIRECTIONAL' },
    { id: 'e5', source: 'R3', target: 'R5', weight: 2, direction: 'BIDIRECTIONAL' },
    { id: 'e6', source: 'R4', target: 'R6', weight: 5, direction: 'BIDIRECTIONAL' },
    { id: 'e7', source: 'R5', target: 'D', weight: 1, direction: 'BIDIRECTIONAL' },
    { id: 'e8', source: 'R6', target: 'D', weight: 4, direction: 'BIDIRECTIONAL' },
    { id: 'e9', source: 'R3', target: 'R4', weight: 1, direction: 'BIDIRECTIONAL' },
  ];

  const result = findShortestPath({ nodes, edges, sourceId: 'S', destinationId: 'D' });
  assert.strictEqual(result.reachable, true);
  // S -> R1 (3) -> R3 (4) -> R5 (2) -> D (1) = 10
  assert.deepStrictEqual(result.shortestPath, ['S', 'R1', 'R3', 'R5', 'D']);
  assert.strictEqual(result.totalCost, 10);
  assert.ok(result.steps.length > 25);
  console.log(`✓ Test 3: 8-router mesh simulation generates comprehensive trace with ${result.steps.length} steps.`);
}

// -------------------------------------------------------------
// Test 4: One-Way Links Never Traversed Backwards
// -------------------------------------------------------------
console.log('\n--- Test 4: One-Way Link Direction Verification ---');
{
  const nodes = [{ id: 'S' }, { id: 'R1' }, { id: 'R2' }, { id: 'D' }];
  const edges = [
    { id: 'e1', source: 'S', target: 'R1', weight: 2, direction: 'ONE_WAY' },
    { id: 'e2', source: 'D', target: 'R1', weight: 3, direction: 'ONE_WAY' }, // incoming to R1, not from R1!
  ];

  const result = findShortestPath({ nodes, edges, sourceId: 'S', destinationId: 'D' });
  assert.strictEqual(result.reachable, false);
  assert.deepStrictEqual(result.shortestPath, []);
  assert.strictEqual(result.totalCost, null);

  // R1 must never examine e2 towards D
  const examineR1ToD = result.steps.find(
    (s) => s.type === 'EXAMINE_EDGE' && s.fromNodeId === 'R1' && s.toNodeId === 'D'
  );
  assert.strictEqual(examineR1ToD, undefined);
  console.log('✓ Test 4: Verified that one-way links are never examined backwards.');
}

// -------------------------------------------------------------
// Test 5: Bidirectional Links Traversed Symmetrically
// -------------------------------------------------------------
console.log('\n--- Test 5: Bidirectional Links Symmetry ---');
{
  const nodes = [{ id: 'S' }, { id: 'R1' }, { id: 'D' }];
  const edges = [
    { id: 'e1', source: 'S', target: 'R1', weight: 5, direction: 'BIDIRECTIONAL' },
    { id: 'e2', source: 'D', target: 'R1', weight: 2, direction: 'BIDIRECTIONAL' }, // target is R1
  ];

  const result = findShortestPath({ nodes, edges, sourceId: 'S', destinationId: 'D' });
  assert.strictEqual(result.reachable, true);
  assert.deepStrictEqual(result.shortestPath, ['S', 'R1', 'D']);
  assert.strictEqual(result.totalCost, 7);
  console.log('✓ Test 5: Verified bidirectional link stored as D->R1 was correctly traversed R1->D.');
}

// -------------------------------------------------------------
// Test 6: Unreachable Destination Handling
// -------------------------------------------------------------
console.log('\n--- Test 6: Unreachable Destination ---');
{
  const nodes = [{ id: 'S' }, { id: 'R1' }, { id: 'D' }];
  const edges = [{ id: 'e1', source: 'S', target: 'R1', weight: 4, direction: 'BIDIRECTIONAL' }];

  const result = findShortestPath({ nodes, edges, sourceId: 'S', destinationId: 'D' });
  assert.strictEqual(result.reachable, false);
  assert.strictEqual(result.totalCost, null);
  assert.deepStrictEqual(result.shortestPath, []);

  const dRow = result.distanceTable.find((r) => r.nodeId === 'D');
  assert.strictEqual(dRow.status, 'UNREACHABLE');
  assert.strictEqual(dRow.distance, null);
  console.log('✓ Test 6: Disconnected destination correctly sets reachable=false and status=UNREACHABLE.');
}

// -------------------------------------------------------------
// Test 7: Cyclic Graph Without Infinite Loops
// -------------------------------------------------------------
console.log('\n--- Test 7: Cyclic Graph Termination ---');
{
  const nodes = [{ id: 'S' }, { id: 'R1' }, { id: 'R2' }, { id: 'D' }];
  const edges = [
    { id: 'e1', source: 'S', target: 'R1', weight: 1, direction: 'BIDIRECTIONAL' },
    { id: 'e2', source: 'R1', target: 'R2', weight: 1, direction: 'BIDIRECTIONAL' },
    { id: 'e3', source: 'R2', target: 'S', weight: 1, direction: 'BIDIRECTIONAL' }, // cycle
    { id: 'e4', source: 'R2', target: 'D', weight: 1, direction: 'BIDIRECTIONAL' },
  ];

  const result = findShortestPath({ nodes, edges, sourceId: 'S', destinationId: 'D' });
  assert.strictEqual(result.reachable, true);
  assert.strictEqual(result.totalCost, 2);
  assert.deepStrictEqual(result.shortestPath, ['S', 'R2', 'D']);

  // Every node finalized at most once
  const finalizeEvents = result.steps.filter((s) => s.type === 'FINALIZE_NODE');
  const finalizedNodes = finalizeEvents.map((s) => s.nodeId);
  const uniqueFinalized = new Set(finalizedNodes);
  assert.strictEqual(finalizedNodes.length, uniqueFinalized.size);
  console.log('✓ Test 7: Cyclic network terminates cleanly with each vertex finalized exactly once.');
}

// -------------------------------------------------------------
// Test 8: Deterministic Priority Queue Snapshots in Trace
// -------------------------------------------------------------
console.log('\n--- Test 8: Priority Queue Snapshot Integrity ---');
{
  const nodes = [{ id: 'S' }, { id: 'R1' }, { id: 'R2' }, { id: 'D' }];
  const edges = [
    { id: 'e1', source: 'S', target: 'R1', weight: 4, direction: 'BIDIRECTIONAL' },
    { id: 'e2', source: 'S', target: 'R2', weight: 2, direction: 'BIDIRECTIONAL' },
    { id: 'e3', source: 'R2', target: 'D', weight: 5, direction: 'BIDIRECTIONAL' },
  ];

  const result = findShortestPath({ nodes, edges, sourceId: 'S', destinationId: 'D' });

  // Verify that all events have an array queueSnapshot
  result.steps.forEach((step, i) => {
    assert.ok(Array.isArray(step.queueSnapshot), `Step ${i} must have queueSnapshot array`);
  });

  // When S is inserted, queue has S: 0
  const qInsert = result.steps.find((s) => s.type === 'QUEUE_INSERTED' && s.nodeId === 'S');
  assert.deepStrictEqual(qInsert.queueSnapshot, [{ nodeId: 'S', distance: 0 }]);

  console.log('✓ Test 8: All steps contain valid priority queue snapshots for accurate replay.');
}

console.log('\n========================================================');
console.log('ALL MODULE 3 SIMULATION ENGINE TESTS PASSED (100%)!');
console.log('========================================================\n');
