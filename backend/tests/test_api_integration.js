import mongoose from 'mongoose';
import assert from 'assert';
import { connectDB } from '../config/db.js';
import { Topology } from '../models/Topology.js';
import {
  getCurrentTopology,
  saveCurrentTopology,
  resetCurrentTopology,
  loadExampleTopology,
} from '../controllers/topologyController.js';

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

const runIntegrationTests = async () => {
  console.log('--- Connecting to MongoDB for API Integration Tests ---');
  await connectDB();

  // Clean previous test data
  await Topology.deleteMany({});
  console.log('✓ Cleared test collection.');

  // Test 1: GET /api/topology/current (Initial creation of S and D)
  {
    const req = {};
    const res = mockRes();
    await getCurrentTopology(req, res, (err) => { throw err; });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.nodes.length, 2);
    assert.strictEqual(res.body.data.nodes[0].id, 'S');
    assert.strictEqual(res.body.data.nodes[1].id, 'D');
    assert.strictEqual(res.body.data.edges.length, 0);
    console.log('✓ API Test 1: GET /api/topology/current initializes default S and D endpoints in MongoDB.');
  }

  // Test 2: PUT /api/topology/current (Save network with intermediate routers & links)
  {
    const req = {
      body: {
        name: 'My Custom Network',
        nodes: [
          { id: 'S', label: 'Source (S)', type: 'source', position: { x: 100, y: 250 } },
          { id: 'R1', label: 'R1', type: 'intermediate', position: { x: 350, y: 150 } },
          { id: 'R2', label: 'R2', type: 'intermediate', position: { x: 350, y: 350 } },
          { id: 'D', label: 'Destination (D)', type: 'destination', position: { x: 900, y: 250 } },
        ],
        edges: [
          { id: 'e1', source: 'S', target: 'R1', weight: 5, direction: 'BIDIRECTIONAL' },
          { id: 'e2', source: 'R1', target: 'R2', weight: 3, direction: 'BIDIRECTIONAL' },
          { id: 'e3', source: 'R2', target: 'D', weight: 7, direction: 'ONE_WAY' },
        ],
      },
    };
    const res = mockRes();
    await saveCurrentTopology(req, res, (err) => { throw err; });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.nodes.length, 4);
    assert.strictEqual(res.body.data.edges.length, 3);
    assert.strictEqual(res.body.data.edges[2].direction, 'ONE_WAY');
    console.log('✓ API Test 2: PUT /api/topology/current persisted 4 routers and 3 links to MongoDB.');
  }

  // Test 3: GET /api/topology/current (Verify persistence after save)
  {
    const req = {};
    const res = mockRes();
    await getCurrentTopology(req, res, (err) => { throw err; });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.data.nodes.length, 4);
    assert.strictEqual(res.body.data.edges.length, 3);
    assert.strictEqual(res.body.data.edges[0].weight, 5);
    console.log('✓ API Test 3: Verified saved topology persists and reloads from MongoDB identically.');
  }

  // Test 4: POST /api/topology/example (Load sample network)
  {
    const req = {};
    const res = mockRes();
    await loadExampleTopology(req, res, (err) => { throw err; });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.data.nodes.length, 6);
    assert.strictEqual(res.body.data.edges.length, 8);
    console.log('✓ API Test 4: POST /api/topology/example loaded 6-router sample network into MongoDB.');
  }

  // Test 5: POST /api/topology/current/reset (Reset network)
  {
    const req = {};
    const res = mockRes();
    await resetCurrentTopology(req, res, (err) => { throw err; });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.data.nodes.length, 2);
    assert.strictEqual(res.body.data.nodes[0].id, 'S');
    assert.strictEqual(res.body.data.nodes[1].id, 'D');
    assert.strictEqual(res.body.data.edges.length, 0);
    console.log('✓ API Test 5: POST /api/topology/current/reset restored empty network with S & D in MongoDB.');
  }

  await mongoose.disconnect();
  console.log('\nALL BACKEND API MONGODB INTEGRATION TESTS PASSED!');
};

runIntegrationTests().catch((err) => {
  console.error('Integration test failed:', err);
  process.exit(1);
});

