import assert from 'assert';
import { calculateDijkstra } from '../controllers/algorithmController.js';

// Helper mock response
const mockRes = () => {
  const res = {};
  res.statusCode = 200;
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
};

const runAlgorithmApiTests = async () => {
  console.log('--- Running Algorithm API Controller Tests (POST /api/algorithm/dijkstra) ---');

  // Test 1: Valid calculation
  {
    const req = {
      body: {
        sourceId: 'S',
        destinationId: 'D',
        nodes: [
          { id: 'S', label: 'Source (S)', type: 'source' },
          { id: 'R1', label: 'R1', type: 'intermediate' },
          { id: 'D', label: 'Destination (D)', type: 'destination' },
        ],
        edges: [
          { id: 'e1', source: 'S', target: 'R1', weight: 4, direction: 'BIDIRECTIONAL' },
          { id: 'e2', source: 'R1', target: 'D', weight: 5, direction: 'BIDIRECTIONAL' },
        ],
      },
    };
    const res = mockRes();
    await calculateDijkstra(req, res, (err) => { throw err; });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.reachable, true);
    assert.deepStrictEqual(res.body.data.shortestPath, ['S', 'R1', 'D']);
    assert.strictEqual(res.body.data.totalCost, 9);
    assert.deepStrictEqual(res.body.data.shortestPathEdges, ['e1', 'e2']);
    console.log('✓ API Test 1: Successful shortest path calculation with 200 OK.');
  }

  // Test 2: Unreachable destination returns 200 OK with reachable: false
  {
    const req = {
      body: {
        sourceId: 'S',
        destinationId: 'D',
        nodes: [
          { id: 'S', label: 'Source (S)', type: 'source' },
          { id: 'R1', label: 'R1', type: 'intermediate' },
          { id: 'D', label: 'Destination (D)', type: 'destination' },
        ],
        edges: [
          { id: 'e1', source: 'S', target: 'R1', weight: 4, direction: 'BIDIRECTIONAL' },
        ],
      },
    };
    const res = mockRes();
    await calculateDijkstra(req, res, (err) => { throw err; });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.data.reachable, false);
    assert.deepStrictEqual(res.body.data.shortestPath, []);
    assert.strictEqual(res.body.data.totalCost, null);
    console.log('✓ API Test 2: Unreachable destination correctly returns reachable: false and null cost.');
  }

  // Test 3: Reject missing Source router
  {
    const req = {
      body: {
        sourceId: 'S',
        destinationId: 'D',
        nodes: [{ id: 'D' }],
        edges: [],
      },
    };
    const res = mockRes();
    await calculateDijkstra(req, res, (err) => { throw err; });

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.error, /Source router 'S' must exist/);
    console.log('✓ API Test 3: Rejected request missing Source router (400 Bad Request).');
  }

  // Test 4: Reject self loop
  {
    const req = {
      body: {
        sourceId: 'S',
        destinationId: 'D',
        nodes: [{ id: 'S' }, { id: 'D' }],
        edges: [{ id: 'e1', source: 'S', target: 'S', weight: 5, direction: 'BIDIRECTIONAL' }],
      },
    };
    const res = mockRes();
    await calculateDijkstra(req, res, (err) => { throw err; });

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.error, /Self-loops are forbidden/);
    console.log('✓ API Test 4: Rejected request with self-loop (400 Bad Request).');
  }

  // Test 5: Reject invalid/negative weight
  {
    const req = {
      body: {
        sourceId: 'S',
        destinationId: 'D',
        nodes: [{ id: 'S' }, { id: 'D' }],
        edges: [{ id: 'e1', source: 'S', target: 'D', weight: -3, direction: 'BIDIRECTIONAL' }],
      },
    };
    const res = mockRes();
    await calculateDijkstra(req, res, (err) => { throw err; });

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.error, /positive, finite numeric weight/);
    console.log('✓ API Test 5: Rejected negative edge weight (400 Bad Request).');
  }

  // Test 6: Reject duplicate connection pair
  {
    const req = {
      body: {
        sourceId: 'S',
        destinationId: 'D',
        nodes: [{ id: 'S' }, { id: 'D' }],
        edges: [
          { id: 'e1', source: 'S', target: 'D', weight: 4, direction: 'BIDIRECTIONAL' },
          { id: 'e2', source: 'D', target: 'S', weight: 4, direction: 'BIDIRECTIONAL' },
        ],
      },
    };
    const res = mockRes();
    await calculateDijkstra(req, res, (err) => { throw err; });

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.error, /Duplicate link detected/);
    console.log('✓ API Test 6: Rejected duplicate link pair (400 Bad Request).');
  }

  console.log('\nALL ALGORITHM API CONTROLLER TESTS PASSED!');
};

runAlgorithmApiTests().catch((err) => {
  console.error('API test failed:', err);
  process.exit(1);
});

