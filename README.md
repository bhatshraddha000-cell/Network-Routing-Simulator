# NetRoute – Network Routing Simulator

A Computer Networks interactive simulator built with the **MERN** stack and **React Flow**, focusing on dynamic network topology visualization and Dijkstra's Shortest Path routing algorithm.

---

## Architecture Overview

```text
Network-Routing-Simulator/
├── backend/
│   ├── config/
│   │   └── db.js                        # MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── algorithmController.js       # Dijkstra API controller (POST /api/algorithm/dijkstra)
│   │   └── topologyController.js        # Topology persistence controller
│   ├── middleware/
│   │   └── errorMiddleware.js           # 404 & global JSON error handling
│   ├── models/
│   │   └── Topology.js                  # Mongoose schema for persistent topologies
│   ├── routes/
│   │   ├── algorithmRoutes.js           # Dijkstra algorithm routes
│   │   └── topologyRoutes.js            # Network topology CRUD routes
│   ├── services/
│   │   └── dijkstraService.js           # Dijkstra engine, adjacency list & execution trace
│   ├── utils/
│   │   └── MinPriorityQueue.js          # Binary Min-Heap Priority Queue implementation
│   ├── tests/
│   │   ├── test_dijkstra.js             # 10 edge cases & priority queue unit tests
│   │   ├── test_algorithm_api.js        # Controller validation & API endpoint tests
│   │   ├── test_topology.js             # Module 1 domain validation unit tests
│   │   └── test_api_integration.js     # End-to-end MongoDB database persistence tests
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   └── server.js                        # Express server entry point
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── ConfirmDialog.jsx    # Action confirmation dialogs
│   │   │   │   └── Toast.jsx            # Toast alert notifications
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx           # Top navbar with Calculate button & save controls
│   │   │   │   └── Sidebar.jsx          # Left control sidebar & router list
│   │   │   └── network/
│   │   │       ├── ConnectionWeightModal.jsx # Edge weight & direction modal
│   │   │       ├── NetworkCanvas.jsx    # React Flow canvas with custom nodes/edges
│   │   │       ├── NetworkEdge.jsx      # Custom edge with weight badge & arrow markers
│   │   │       ├── NetworkLegend.jsx    # Visual legend with shortest-path indicator
│   │   │       ├── PropertiesPanel.jsx  # Right sidebar inspector for node/edge properties
│   │   │       ├── RouterNode.jsx       # Custom router node with 4 handles & path glow
│   │   │       └── ShortestPathResult.jsx # Shortest path display, distance table & metrics
│   │   ├── hooks/
│   │   │   └── useTopology.js           # Graph state, Dijkstra execution & invalidation
│   │   ├── pages/
│   │   │   └── NetworkEditor.jsx        # Main dashboard page
│   │   ├── services/
│   │   │   ├── algorithmService.js      # Client API service for Dijkstra endpoint
│   │   │   └── topologyService.js       # Client API service for Topology endpoints
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── .gitignore
└── README.md
```

---

## Module 1: Network Topology Builder

- **Fixed Endpoints**: Permanent **Source (S)** in green and **Destination (D)** in orange with fixed positions.
- **Dynamic Routers**: Add intermediate routers (**R1, R2, R3...**) in blue with drag-and-drop repositioning.
- **Sequential IDs**: Unique sequential IDs generated dynamically without duplicates even after deletions.
- **Communication Links**: Connect router handles and assign positive communication costs/weights (including decimals).
- **Link Directions**: Support for both **Bidirectional** and **One-Way** links with directed arrow markers.
- **MongoDB Persistence**: Real-time synchronization and database storage.

---

## Module 2: Dijkstra's Shortest Path Algorithm Engine

### 1. Algorithm Overview
- **Binary Min-Heap Priority Queue**: Custom `MinPriorityQueue` providing $O(\log V)$ insertions and extractions.
- **Dynamic Adjacency List**: Built on-the-fly from the user's active React state snapshot, correctly incorporating:
  - `BIDIRECTIONAL` links: added in both directions ($u \to v$ and $v \to u$).
  - `ONE_WAY` links: added strictly in forward direction ($u \to v$).
- **Strict Tie-Handling**: Retains existing predecessor on equal cost to ensure deterministic results.
- **Execution Trace Preparation**: Emits sequential events (`INITIALIZE_NODE`, `SELECT_NODE`, `EXAMINE_EDGE`, `DISTANCE_UPDATED`, `DISTANCE_UNCHANGED`, `FINALIZE_NODE`, `ALGORITHM_COMPLETE`) ready for Module 3's visual step-by-step playback.
- **Path Highlighting**: Vibrantly highlights nodes and edges belonging to the calculated shortest path while subduing non-participating elements.
- **Dynamic Invalidation**: Modifying any router or link invalidates previous calculations and warns the user to recalculate.
- **Unreachable Destination Handling**: Gracefully handles disconnected graphs, returning `reachable: false`, `null` total cost, and `UNREACHABLE` distance table status.

### 2. Theoretical Complexity
- **Time Complexity**: $\mathcal{O}((V + E) \log V)$
  - Extracting each vertex from the min-heap: $\mathcal{O}(V \log V)$
  - Relaxing each edge and updating the min-heap: $\mathcal{O}(E \log V)$
- **Space Complexity**: $\mathcal{O}(V + E)$
  - Adjacency list: $\mathcal{O}(V + E)$
  - Min-heap, distance map, predecessor map: $\mathcal{O}(V)$

---

## API Endpoints

### 1. Algorithm Route
- `POST /api/algorithm/dijkstra`: Computes shortest path from current graph snapshot.
  ```json
  // Request
  {
    "sourceId": "S",
    "destinationId": "D",
    "nodes": [...],
    "edges": [...]
  }
  // Response
  {
    "success": true,
    "data": {
      "reachable": true,
      "shortestPath": ["S", "R1", "D"],
      "shortestPathEdges": ["e1", "e2"],
      "totalCost": 9,
      "distanceTable": [...],
      "visitedOrder": ["S", "R1", "D"],
      "steps": [...],
      "stats": { ... }
    }
  }
  ```

### 2. Topology Routes
- `GET /api/topology/current`: Retrieves active working topology.
- `PUT /api/topology/current`: Saves topology snapshot to MongoDB.
- `POST /api/topology/current/reset`: Resets graph preserving endpoints S and D.
- `POST /api/topology/example`: Loads 6-router sample mesh network.

---

## How to Run

### 1. Start MongoDB
```powershell
& "C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" --dbpath "D:\Network-Routing-Simulator\backend\data\db" --bind_ip 127.0.0.1 --port 27017
```

### 2. Start Backend Server
```powershell
cd backend
npm run dev
```
*Backend runs at `http://localhost:5000`.*

### 3. Start Frontend Client
```powershell
cd frontend
npm run dev
```
*Frontend runs at `http://localhost:3000`.*

---

## Running Automated Tests

Run the full automated test suite:
```powershell
cd backend
npm test
```
The suite executes:
1. `tests/test_dijkstra.js` (Binary Min-Heap & 10 Critical Edge Cases)
2. `tests/test_algorithm_api.js` (Algorithm Controller validation)
3. `tests/test_topology.js` (Topology Domain validation)
4. `tests/test_api_integration.js` (MongoDB persistence)
All test suites pass with 100% success.
