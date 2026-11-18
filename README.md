# NetRoute – Network Routing Simulator

A Computer Networks interactive simulation and analysis platform built with the **MERN** stack and **React Flow**, focusing on dynamic network topology visualization, Dijkstra's Shortest Path routing algorithm, interactive step-by-step algorithm animation, and comprehensive network analytics with exportable reports.

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
│   │   └── dijkstraService.js           # Dijkstra engine, adjacency list, SPT, & execution trace
│   ├── utils/
│   │   └── MinPriorityQueue.js          # Binary Min-Heap Priority Queue implementation
│   ├── tests/
│   │   ├── test_dijkstra.js             # Module 2 unit tests (Min-Heap & 10 Edge Cases)
│   │   ├── test_simulation.js           # Module 3 simulation engine tests (10 Test Cases)
│   │   ├── test_algorithm_api.js        # Algorithm Controller validation tests
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
│   │   │   │   ├── Navbar.jsx           # Top navbar with 4-tab navigation & contextual controls
│   │   │   │   └── Sidebar.jsx          # Left control sidebar & router list
│   │   │   ├── network/
│   │   │   │   ├── ConnectionWeightModal.jsx # Edge weight & direction modal
│   │   │   │   ├── NetworkCanvas.jsx    # React Flow canvas with custom nodes/edges
│   │   │   │   ├── NetworkEdge.jsx      # Custom edge with simulation color states
│   │   │   │   ├── NetworkLegend.jsx    # Visual legend with shortest-path indicator
│   │   │   │   ├── PropertiesPanel.jsx  # Right sidebar inspector for node/edge properties
│   │   │   │   ├── RouterNode.jsx       # Custom router node with simulation states
│   │   │   │   └── ShortestPathResult.jsx # Shortest path display drawer & metrics
│   │   │   ├── results/
│   │   │   │   ├── AlgorithmInformation.jsx # O((V+E) log V) complexity & theory reference
│   │   │   │   ├── DirectRouteComparison.jsx# Multi-hop optimal route vs direct link comparison
│   │   │   │   ├── DistanceAnalysis.jsx     # Searchable, filterable, sortable distance table
│   │   │   │   ├── NetworkAnalysis.jsx      # Network connectivity & density metrics
│   │   │   │   ├── RouteCostBreakdown.jsx   # Detailed hop-by-hop breakdown table
│   │   │   │   ├── ShortestPathTree.jsx     # React Flow Shortest-Path Tree (SPT) rooted at S
│   │   │   │   └── SimulationReport.jsx     # CSV export, JSON export, and PDF print generator
│   │   │   └── simulation/
│   │   │       ├── AlgorithmExplanation.jsx  # Step-by-step mathematical breakdown
│   │   │       ├── DistanceTable.jsx         # Dynamic step-by-step distance table
│   │   │       ├── ExecutionHistory.jsx      # Interactive event timeline with step jumping
│   │   │       ├── FinalPathSummary.jsx      # Final optimal path summary card
│   │   │       ├── PriorityQueuePanel.jsx    # Live binary min-heap priority queue display
│   │   │       ├── SimulationControls.jsx    # Play, Pause, Next, Prev, Speed, Progress
│   │   │       └── SimulationLegend.jsx      # Visual state color guide for simulator
│   │   ├── hooks/
│   │   │   ├── useAlgorithmSimulation.js # Step-by-step playback & timer engine
│   │   │   └── useTopology.js            # Graph state, Dijkstra execution & invalidation
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx             # Overview dashboard with live metrics & preview
│   │   │   ├── NetworkEditor.jsx         # Dual-mode topology editor & simulation workspace
│   │   │   └── ResultsPage.jsx           # Dedicated Results, Network Analysis & Reports page
│   │   ├── services/
│   │   │   ├── algorithmService.js       # Client API service for Dijkstra endpoint
│   │   │   └── topologyService.js        # Client API service for Topology endpoints
│   │   ├── utils/
│   │   │   └── simulationHelpers.js      # Deterministic state snapshots generator
│   │   ├── App.jsx                       # Top-level shell coordinating navigation & state
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

- **Fixed Endpoints**: Permanent **Source (S)** in green (`#22C55E`) and **Destination (D)** in orange (`#F97316`) with fixed positions.
- **Dynamic Routers**: Add intermediate routers (**R1, R2, R3...**) in blue (`#38BDF8`) with drag-and-drop repositioning.
- **Sequential IDs**: Unique sequential IDs generated dynamically without duplicates even after deletions.
- **Communication Links**: Connect router handles and assign positive communication costs/weights (including decimals).
- **Link Directions**: Support for both **Bidirectional** and **One-Way** links with directed arrow markers.
- **MongoDB Persistence**: Real-time synchronization and database storage.

---

## Module 2: Dijkstra Algorithm Engine

- **Binary Min-Heap Priority Queue**: Custom `MinPriorityQueue` providing $\mathcal{O}(\log V)$ insertions and extractions.
- **Dynamic Adjacency List**: Built on-the-fly from the active React state snapshot.
- **Strict Tie-Handling**: Retains existing predecessor on equal cost for deterministic outcomes.
- **Execution Trace Preparation**: Emits sequential events with full priority queue snapshots.
- **Theoretical Complexity**: Time $\mathcal{O}((V + E) \log V)$, Space $\mathcal{O}(V + E)$.

---

## Module 3: Step-by-Step Dijkstra Algorithm Visualization

### 1. Interactive Simulation Features
- **Deterministic State Reconstruction**: Precomputes complete simulation snapshots from the backend execution trace, allowing instantaneous stepping forward (**Next Step**) and backward (**Previous Step**) with 100% fidelity.
- **Safe Graph Locking**: During simulation, all topology mutations (adding/dragging/deleting nodes, editing links) are safely locked while zoom and pan remain interactive.
- **Visual Node States**:
  - `Unvisited`: Blue node with tentative distance $d: \text{val}$ or $\infty$.
  - `Currently Selected`: Cyan border with pulsating glow, `CURRENT` badge, prominent tentative distance.
  - `Visited / Finalized`: Purple border and badge, checkmark, confirmed optimal distance.
  - `Unreachable`: Muted grey/red, marked `UNREACHABLE` with distance $\infty$.
  - `Shortest Route`: Bright green border, route badge, sparkling accent.
- **Visual Edge States**:
  - `Normal`: Muted slate grey ($2\text{px}$).
  - `Examining Link`: Glowing amber/yellow ($4.5\text{px}$) with active link badge.
  - `Relaxed Link`: Vibrant cyan ($4.5\text{px}$) indicating successful distance improvement.
  - `Shortest Path Link`: Bright green ($5\text{px}$) with glowing shadow.
- **Dynamic Distance Table**:
  - Displays real-time tentative distances, predecessor, status, and visit order as the algorithm progresses.
- **Live Priority Queue Panel**:
  - Renders the exact binary min-heap contents at each step, marking the top entry with `Min (Next)`.
- **Mathematical Explanation Panel**:
  - Displays dynamic calculations for each step (e.g. $\text{dist}[S] + \text{cost} = 0 + 4 = 4 < \infty \implies \text{Update}$).
- **Interactive Execution Timeline**:
  - Scrollable event history; clicking any past event jumps directly to that step.
- **Playback & Speed Controls**:
  - Play, Pause, Next Step, Previous Step, Reset, and Restart.
  - Playback speed selection: `0.5x` ($1600\text{ms}$), `1x` ($900\text{ms}$), `1.5x` ($500\text{ms}$), `2x` ($250\text{ms}$).

---

## Module 4: Results, Network Analysis & Reports

### 1. Dedicated Results & Analysis Page (`ResultsPage.jsx`)
- Accessible directly from the top navigation bar and via the 1-click **"View Detailed Analysis & Reports"** button when a simulation finishes.
- **Top Metric Cards**:
  1. `Path Status`: Reachable vs. Unreachable with status badges.
  2. `Total Optimal Cost`: Exact numerical cost calculated by the backend Dijkstra engine.
  3. `Total Hops`: Number of communication links traversed.
  4. `Routers Traversed`: Total vertices along the shortest path.
  5. `Reachable Routers`: Count of all vertices reached from Source $S$.
  6. `Unreachable Routers`: Count of isolated/unreachable vertices.

### 2. Comprehensive Analytics Components
- **Visual Optimal Route Bar**: Step-by-step badge chain showing each router and intermediate link cost.
- **Hop-by-Hop Route Breakdown (`RouteCostBreakdown.jsx`)**:
  - Step number, Link ($u \to v$), Link Cost, Cumulative Cost, Link Type, and Cumulative Percentage.
- **Distance Analysis Table (`DistanceAnalysis.jsx`)**:
  - Instant live search by Router ID or Label.
  - Status filter buttons: `All`, `Shortest Path Only`, `Reachable`, `Unreachable`.
  - Column sorting by Router ID, Final Distance, Status, or Visit Order.
  - Full path reconstruction from Source $S$ to every individual router.
- **Shortest-Path Tree (SPT) Visualization (`ShortestPathTree.jsx`)**:
  - Dedicated interactive React Flow tree rooted at Source $S$.
  - Highlights branches leading to Destination $D$ in emerald green (`#22C55E`).
  - Reachable tree branches highlighted in sky blue (`#38BDF8`).
- **Network Connectivity Analysis (`NetworkAnalysis.jsx`)**:
  - Total Routers ($V$), Total Links ($E$), Link Density %, Average Node Degree.
  - Direction breakdown: Bidirectional vs. One-Way channels.
  - Network reachability percentage ($\frac{V_{\text{reachable}}}{V} \times 100\%$).
- **Direct Link vs. Shortest Path Comparison (`DirectRouteComparison.jsx`)**:
  - Automatically compares direct link $S \to D$ against the multi-hop optimal route.
  - Calculates cost savings, percentage improvement, and trade-off analysis.
- **Algorithm Information & Complexity (`AlgorithmInformation.jsx`)**:
  - Explains time complexity $\mathcal{O}((V + E) \log V)$ with binary min-heap.
  - Space complexity $\mathcal{O}(V + E)$.
  - Precondition and property details (non-negative edge weights, greedy choice property, optimal substructure).

### 3. Simulation Reports & Export (`SimulationReport.jsx`)
- **CSV Export**: Downloads a CSV file with simulation summary, optimal path, hop-by-hop breakdown, and complete routing table.
- **JSON Export**: Downloads the complete simulation result payload (including adjacency data, execution trace, distance table, and graph snapshot).
- **Print / PDF Export**: Trigger browser print dialog styled for professional clean document output with `print:hidden` on UI controls.

### 4. Overview Dashboard (`Dashboard.jsx`)
- 4 live network metric cards (Total Routers, Total Links, Reachable Destinations, Last Minimum Cost).
- Quick action buttons (Build Network, Run Simulation, View Results).
- Read-only real-time network preview using React Flow.
- Workflow and getting-started guide.

### 5. Topology Invalidation & State Synchronization
- Single source of truth across all views (`useTopology`).
- Any graph edit (adding/moving/deleting a node, adding/modifying an edge) automatically invalidates existing simulation results:
  - Sets `dijkstraResult = null` and `isTopologyModified = true`.
  - `ResultsPage` displays an informative outdated message with action buttons to re-simulate or edit topology.

---

## How to Run

### 1. Start MongoDB
```powershell
& "C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" --dbpath "D:\Network-Routing-Simulator\backend\data\db" --bind_ip 127.0.0.1 --port 27017
```

### 2. Start Backend Server
```powershell
cd D:\Network-Routing-Simulator\backend
npm run dev
```
*API runs at `http://localhost:5000`.*

### 3. Start Frontend Client
```powershell
cd D:\Network-Routing-Simulator\frontend
npm run dev
```
*Frontend runs at `http://localhost:3000`.*

---

## Running Automated Tests

Run all unit, integration, and simulation test suites:
```powershell
cd D:\Network-Routing-Simulator\backend
npm test
```
The test suite executes:
1. `tests/test_dijkstra.js` (Min-Heap & 10 Critical Edge Cases)
2. `tests/test_simulation.js` (Module 3 Step-by-Step Simulation Verification)
3. `tests/test_algorithm_api.js` (Algorithm Controller validation)
4. `tests/test_topology.js` (Module 1 Domain validation)
5. `tests/test_api_integration.js` (MongoDB Database persistence)

All test suites pass with 100% success.
