import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ReactFlowProvider, useReactFlow } from '@xyflow/react';
import {
  PanelLeftOpen,
  PanelLeft,
  Sliders,
  Activity,
  Layers,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { PropertiesPanel } from '../components/network/PropertiesPanel';
import { NetworkCanvas } from '../components/network/NetworkCanvas';
import { ConnectionWeightModal } from '../components/network/ConnectionWeightModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Toast } from '../components/common/Toast';
import { ShortestPathResult } from '../components/network/ShortestPathResult';
import { ResizeHandle } from '../components/layout/ResizeHandle';
import { ResponsiveDrawer } from '../components/layout/ResponsiveDrawer';

// Module 3 Simulation Components
import { SimulationControls } from '../components/simulation/SimulationControls';
import { DistanceTable } from '../components/simulation/DistanceTable';
import { PriorityQueuePanel } from '../components/simulation/PriorityQueuePanel';
import { AlgorithmExplanation } from '../components/simulation/AlgorithmExplanation';
import { ExecutionHistory } from '../components/simulation/ExecutionHistory';
import { FinalPathSummary } from '../components/simulation/FinalPathSummary';

import { useTopology } from '../hooks/useTopology';
import { useAlgorithmSimulation } from '../hooks/useAlgorithmSimulation';
import { useResizablePanels } from '../hooks/useResizablePanels';

const NetworkEditorContent = ({
  topology: externalTopology,
  showToast: externalShowToast,
  onNavigateToResults,
  onRegisterFitView,
}) => {
  const [internalToast, setInternalToast] = useState(null);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [activeSimulationTab, setActiveSimulationTab] = useState('state'); // 'state' | 'queue-history'

  const showToast = useCallback(
    (message, type = 'info', duration = 3500) => {
      if (externalShowToast) {
        externalShowToast(message, type, duration);
      } else {
        setInternalToast({ message, type, duration });
      }
    },
    [externalShowToast]
  );

  const closeToast = useCallback(() => {
    setInternalToast(null);
  }, []);

  const { fitView } = useReactFlow();

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.25, duration: 400 });
  }, [fitView]);

  useEffect(() => {
    if (onRegisterFitView) {
      onRegisterFitView(handleFitView);
    }
  }, [handleFitView, onRegisterFitView]);

  const fallbackTopology = useTopology(showToast);
  const topology = externalTopology || fallbackTopology;

  const {
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
  } = topology;

  // Module 3 Simulation Engine Hook
  const {
    currentSnapshot,
    currentStepIndex,
    totalSteps,
    isPlaying,
    playbackSpeed,
    isAtEnd,
    play,
    pause,
    nextStep,
    previousStep,
    goToStep,
    resetSimulation,
    restartSimulation,
    setSpeed,
  } = useAlgorithmSimulation(simulationSnapshots);

  // Responsive & Resizable Panels Hook
  const {
    leftWidth,
    rightWidth,
    isLeftCollapsed,
    isDraggingLeft,
    isDraggingRight,
    isDragging,
    isMobile,
    isLeftDrawerOpen,
    isRightDrawerOpen,
    openLeftDrawer,
    closeLeftDrawer,
    openRightDrawer,
    closeRightDrawer,
    startDraggingLeft,
    startDraggingRight,
    expandLeft,
    collapseLeft,
    resetLeftWidth,
    resetRightWidth,
  } = useResizablePanels();

  // Selected node & edge lookup for editor mode
  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  );

  const selectedEdge = useMemo(
    () => edges.find((e) => e.id === selectedEdgeId) || null,
    [edges, selectedEdgeId]
  );

  // Derive canvas nodes reflecting simulation states or editor selection
  const displayedNodes = useMemo(() => {
    if (isSimulating && currentSnapshot) {
      return nodes.map((node) => ({
        ...node,
        draggable: false,
        data: {
          ...node.data,
          simState: currentSnapshot.nodeStates[node.id] || 'unvisited',
          simDistance: currentSnapshot.distances[node.id],
          visitOrder: currentSnapshot.visitOrders[node.id],
          isSimulationActive: true,
        },
      }));
    }

    // Default editor mode with Module 2 path highlighting if active
    return nodes.map((node) => ({
      ...node,
      selected: node.id === selectedNodeId,
      data: {
        ...node.data,
        isOnShortestPath: dijkstraResult?.shortestPath?.includes(node.id) || false,
        isAnyPathActive: Boolean(dijkstraResult?.reachable),
      },
    }));
  }, [isSimulating, currentSnapshot, nodes, selectedNodeId, dijkstraResult]);

  // Derive canvas edges reflecting simulation states or editor selection
  const displayedEdges = useMemo(() => {
    if (isSimulating && currentSnapshot) {
      return edges.map((edge) => ({
        ...edge,
        data: {
          ...edge.data,
          simEdgeState: currentSnapshot.edgeStates[edge.id] || 'normal',
          isSimulationActive: true,
        },
      }));
    }

    // Default editor mode with Module 2 path highlighting if active
    const isPathActive = Boolean(dijkstraResult?.reachable);
    const pathEdgeSet = new Set(dijkstraResult?.shortestPathEdges || []);
    if (dijkstraResult?.reachable && Array.isArray(dijkstraResult.shortestPath)) {
      const p = dijkstraResult.shortestPath;
      for (let i = 0; i < p.length - 1; i++) {
        const u = p[i];
        const v = p[i + 1];
        const found = edges.find(
          (e) =>
            (e.source === u && e.target === v) ||
            (e.data?.direction === 'BIDIRECTIONAL' && e.source === v && e.target === u)
        );
        if (found) pathEdgeSet.add(found.id);
      }
    }

    return edges.map((edge) => ({
      ...edge,
      selected: edge.id === selectedEdgeId,
      data: {
        ...edge.data,
        isOnShortestPath: pathEdgeSet.has(edge.id),
        isAnyPathActive: isPathActive,
      },
    }));
  }, [isSimulating, currentSnapshot, edges, selectedEdgeId, dijkstraResult]);

  const handleNodeClick = useCallback(
    (_, node) => {
      if (isSimulating) return;
      setSelectedNodeId(node.id);
      setSelectedEdgeId(null);
    },
    [isSimulating, setSelectedNodeId, setSelectedEdgeId]
  );

  const handleEdgeClick = useCallback(
    (_, edge) => {
      if (isSimulating) return;
      setSelectedEdgeId(edge.id);
      setSelectedNodeId(null);
    },
    [isSimulating, setSelectedNodeId, setSelectedEdgeId]
  );

  const handlePaneClick = useCallback(() => {
    if (isSimulating) return;
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, [isSimulating, setSelectedNodeId, setSelectedEdgeId]);

  const handleSelectNodeFromSidebar = useCallback(
    (nodeId) => {
      if (isSimulating) return;
      setSelectedNodeId(nodeId);
      setSelectedEdgeId(null);
    },
    [isSimulating, setSelectedNodeId, setSelectedEdgeId]
  );

  const rightSidebarContent = isSimulating ? (
    <div className="w-full h-full flex flex-col bg-[#111C2F] select-none overflow-hidden">
      {/* Simulation Sidebar Tabs */}
      <div className="p-3 border-b border-[#24344D] flex items-center justify-between bg-[#19263A]/40 shrink-0">
        <span className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
          Simulation Inspector
        </span>
        <div className="flex rounded-lg bg-[#0B1220] p-0.5 border border-[#24344D]">
          <button
            type="button"
            onClick={() => setActiveSimulationTab('state')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${activeSimulationTab === 'state'
                ? 'bg-[#19263A] text-[#38BDF8]'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
          >
            Table & State
          </button>
          <button
            type="button"
            onClick={() => setActiveSimulationTab('queue-history')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${activeSimulationTab === 'queue-history'
                ? 'bg-[#19263A] text-[#38BDF8]'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
          >
            Queue & History
          </button>
        </div>
      </div>

      {/* Simulation Inspector Content Area */}
      {activeSimulationTab === 'state' ? (
        <div className="p-3.5 space-y-3.5 flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Final Summary Card when completed */}
          {currentSnapshot?.isCompleted && (
            <div className="shrink-0">
              <FinalPathSummary
                snapshot={currentSnapshot}
                sourceId="S"
                destinationId="D"
                totalRouters={nodes.length}
                onNavigateToResults={onNavigateToResults}
              />
            </div>
          )}

          {/* Step Explanation with Mathematical Breakdown */}
          <div className="shrink-0">
            <AlgorithmExplanation snapshot={currentSnapshot} />
          </div>

          {/* Dynamic Distance Table extending vertically to the bottom */}
          <DistanceTable
            nodes={nodes}
            distances={currentSnapshot?.distances || {}}
            predecessors={currentSnapshot?.predecessors || {}}
            nodeStates={currentSnapshot?.nodeStates || {}}
            visitOrders={currentSnapshot?.visitOrders || {}}
            activeNodeId={currentSnapshot?.activeNodeId}
            activeNeighborId={currentSnapshot?.activeNeighborId}
            sourceId="S"
            destinationId="D"
          />
        </div>
      ) : (
        <div className="p-3.5 space-y-4 flex-1 min-h-0 overflow-y-auto">
          <PriorityQueuePanel
            priorityQueue={currentSnapshot?.priorityQueue || []}
          />
          <ExecutionHistory
            snapshots={simulationSnapshots}
            currentStepIndex={currentStepIndex}
            onSelectStep={goToStep}
          />
        </div>
      )}
    </div>
  ) : (
    <PropertiesPanel
      selectedNode={selectedNode}
      selectedEdge={selectedEdge}
      allNodes={nodes}
      allEdges={edges}
      onUpdateEdgeWeight={updateEdgeWeight}
      onUpdateEdgeDirection={updateEdgeDirection}
      onDeleteEdge={deleteEdge}
      onDeleteNode={deleteNode}
    />
  );

  const editorBody = (
    <div className="flex flex-1 w-full h-full overflow-hidden select-none relative">
      {/* 1. Desktop Left Sidebar (Resizable & Collapsible) */}
      {!isLeftCollapsed && (
        <aside
          style={{
            width: `${leftWidth}px`,
            minWidth: `${leftWidth}px`,
            maxWidth: `${leftWidth}px`,
          }}
          className="hidden md:flex flex-col h-full bg-[#111C2F] shrink-0 overflow-hidden relative z-10"
        >
          <Sidebar
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={handleSelectNodeFromSidebar}
            onAddRouter={addRouter}
            onLoadExample={loadExample}
            onClearNetwork={() => setIsClearConfirmOpen(true)}
            onDeleteNode={deleteNode}
            onCalculateDijkstra={calculateDijkstra}
            onStartSimulation={startSimulation}
            isCalculating={isCalculating}
            isSimulating={isSimulating}
            onCollapse={collapseLeft}
          />
        </aside>
      )}

      {/* 2. Left Resize Handle (Desktop only, when left sidebar is expanded) */}
      {!isLeftCollapsed && (
        <ResizeHandle
          side="left"
          isDragging={isDraggingLeft}
          onPointerDown={startDraggingLeft}
          onDoubleClick={resetLeftWidth}
        />
      )}

      {/* 3. Center Canvas Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative min-w-[320px]">
        {/* Desktop Expand Button when Left Sidebar is Collapsed */}
        {isLeftCollapsed && (
          <button
            type="button"
            onClick={expandLeft}
            className="hidden md:flex absolute top-3 left-3 z-30 items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111C2F]/90 hover:bg-[#19263A] text-[#94A3B8] hover:text-[#38BDF8] border border-[#24344D] hover:border-[#38BDF8]/50 shadow-lg shadow-sky-950/40 backdrop-blur-md transition-all cursor-pointer group"
            title="Expand left sidebar (Ctrl+B)"
            aria-label="Expand left sidebar"
          >
            <PanelLeftOpen className="w-4 h-4 text-[#38BDF8] group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">Routers & Controls</span>
          </button>
        )}

        {/* Mobile Action Bar (Sticky top pills on small screens) */}
        <div className="md:hidden absolute top-3 left-3 right-3 z-30 flex items-center justify-between gap-2 pointer-events-none">
          <button
            type="button"
            onClick={openLeftDrawer}
            className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111C2F]/95 text-[#F8FAFC] text-xs font-semibold border border-[#24344D] shadow-lg backdrop-blur-md active:scale-95 cursor-pointer"
          >
            <PanelLeft className="w-4 h-4 text-[#38BDF8]" />
            <span>Controls</span>
          </button>

          <button
            type="button"
            onClick={openRightDrawer}
            className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111C2F]/95 text-[#F8FAFC] text-xs font-semibold border border-[#24344D] shadow-lg backdrop-blur-md active:scale-95 cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-[#38BDF8]" />
            <span>{isSimulating ? 'Inspector' : 'Properties'}</span>
          </button>
        </div>

        {/* Interactive React Flow Canvas */}
        <NetworkCanvas
          nodes={displayedNodes}
          edges={displayedEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          onPaneClick={handlePaneClick}
          isSimulationActive={isSimulating}
        />

        {/* Module 3 Simulation Controls Toolbar */}
        {isSimulating && (
          <SimulationControls
            isPlaying={isPlaying}
            currentStepIndex={currentStepIndex}
            totalSteps={totalSteps}
            playbackSpeed={playbackSpeed}
            isCompleted={currentSnapshot?.isCompleted || false}
            onPlay={play}
            onPause={pause}
            onNextStep={nextStep}
            onPreviousStep={previousStep}
            onReset={resetSimulation}
            onRestart={restartSimulation}
            onSpeedChange={setSpeed}
          />
        )}

        {/* Module 2 Shortest Path Results Drawer (in editor mode) */}
        {!isSimulating && (
          <ShortestPathResult
            result={dijkstraResult}
            isTopologyModified={isTopologyModified}
            onResetResult={resetAlgorithmResult}
            onRecalculate={calculateDijkstra}
          />
        )}
      </div>

      {/* 4. Right Resize Handle (Desktop only) */}
      <ResizeHandle
        side="right"
        isDragging={isDraggingRight}
        onPointerDown={startDraggingRight}
        onDoubleClick={resetRightWidth}
      />

      {/* 5. Desktop Right Sidebar (Resizable, Permanently Available on Desktop) */}
      <aside
        style={{
          width: `${rightWidth}px`,
          minWidth: `${rightWidth}px`,
          maxWidth: `${rightWidth}px`,
        }}
        className="hidden md:flex flex-col h-full bg-[#111C2F] shrink-0 overflow-hidden relative z-10"
      >
        {rightSidebarContent}
      </aside>

      {/* Dragging Transparent Barrier to prevent canvas pointer capture */}
      {isDragging && (
        <div className="fixed inset-0 z-50 cursor-col-resize select-none bg-transparent" />
      )}

      {/* Mobile Slide-in Left Drawer */}
      <ResponsiveDrawer
        isOpen={isLeftDrawerOpen}
        onClose={closeLeftDrawer}
        side="left"
        title="Network Controls"
      >
        <Sidebar
          nodes={nodes}
          selectedNodeId={selectedNodeId}
          onSelectNode={(id) => {
            handleSelectNodeFromSidebar(id);
            closeLeftDrawer();
          }}
          onAddRouter={addRouter}
          onLoadExample={() => {
            loadExample();
            closeLeftDrawer();
          }}
          onClearNetwork={() => {
            setIsClearConfirmOpen(true);
            closeLeftDrawer();
          }}
          onDeleteNode={deleteNode}
          onCalculateDijkstra={() => {
            calculateDijkstra();
            closeLeftDrawer();
          }}
          onStartSimulation={() => {
            startSimulation();
            closeLeftDrawer();
          }}
          isCalculating={isCalculating}
          isSimulating={isSimulating}
          onCollapse={closeLeftDrawer}
        />
      </ResponsiveDrawer>

      {/* Mobile Slide-in Right Drawer */}
      <ResponsiveDrawer
        isOpen={isRightDrawerOpen}
        onClose={closeRightDrawer}
        side="right"
        title={isSimulating ? 'Simulation Inspector' : 'Properties Inspector'}
      >
        {rightSidebarContent}
      </ResponsiveDrawer>

      {/* Connection Cost & Direction Modal */}
      <ConnectionWeightModal
        isOpen={Boolean(pendingConnection)}
        connectionData={pendingConnection}
        onConfirm={confirmConnection}
        onCancel={cancelConnection}
      />

      {/* Clear Topology Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isClearConfirmOpen}
        title="Clear Network Topology?"
        message="This action will remove all intermediate routers and all communication links. The permanent endpoints (Source S and Destination D) will be preserved."
        confirmText="Clear Network"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={() => {
          setIsClearConfirmOpen(false);
          clearNetwork();
        }}
        onCancel={() => setIsClearConfirmOpen(false)}
      />

      {/* Standalone fallback Toast */}
      {!externalShowToast && <Toast toast={internalToast} onClose={closeToast} />}
    </div>
  );

  // If used standalone without external App shell
  if (!externalTopology) {
    return (
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0B1220] text-[#F8FAFC]">
        <Navbar
          hasUnsavedChanges={hasUnsavedChanges}
          isSaving={isSaving}
          isCalculating={isCalculating}
          isSimulating={isSimulating}
          isTopologyModified={isTopologyModified}
          onSave={saveTopology}
          onReload={fetchTopology}
          onFitView={handleFitView}
          onCalculateDijkstra={calculateDijkstra}
          onStartSimulation={startSimulation}
          onExitSimulation={exitSimulation}
          hasAlgorithmResult={Boolean(dijkstraResult)}
          onResetAlgorithmResult={resetAlgorithmResult}
        />
        {editorBody}
      </div>
    );
  }

  return editorBody;
};

export const NetworkEditor = (props) => {
  return (
    <ReactFlowProvider>
      <NetworkEditorContent {...props} />
    </ReactFlowProvider>
  );
};
