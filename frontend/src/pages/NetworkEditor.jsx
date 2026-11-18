import React, { useState, useCallback, useMemo } from 'react';
import { ReactFlowProvider, useReactFlow } from '@xyflow/react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { PropertiesPanel } from '../components/network/PropertiesPanel';
import { NetworkCanvas } from '../components/network/NetworkCanvas';
import { ConnectionWeightModal } from '../components/network/ConnectionWeightModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Toast } from '../components/common/Toast';
import { ShortestPathResult } from '../components/network/ShortestPathResult';
import { useTopology } from '../hooks/useTopology';

const NetworkEditorContent = () => {
  const [toast, setToast] = useState(null);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    setToast({ message, type, duration });
  }, []);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  const { fitView } = useReactFlow();

  const {
    nodes,
    rawNodes,
    edges,
    rawEdges,
    selectedNodeId,
    selectedEdgeId,
    hasUnsavedChanges,
    isLoading,
    isSaving,
    isCalculating,
    dijkstraResult,
    isTopologyModified,
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
    resetAlgorithmResult,
  } = useTopology(showToast);

  // Selected node & edge lookup
  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  );

  const selectedEdge = useMemo(
    () => edges.find((e) => e.id === selectedEdgeId) || null,
    [edges, selectedEdgeId]
  );

  const handleNodeClick = useCallback(
    (_, node) => {
      setSelectedNodeId(node.id);
      setSelectedEdgeId(null);
    },
    [setSelectedNodeId, setSelectedEdgeId]
  );

  const handleEdgeClick = useCallback(
    (_, edge) => {
      setSelectedEdgeId(edge.id);
      setSelectedNodeId(null);
    },
    [setSelectedNodeId, setSelectedEdgeId]
  );

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, [setSelectedNodeId, setSelectedEdgeId]);

  const handleSelectNodeFromSidebar = useCallback(
    (nodeId) => {
      setSelectedNodeId(nodeId);
      setSelectedEdgeId(null);
    },
    [setSelectedNodeId, setSelectedEdgeId]
  );

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.25, duration: 400 });
  }, [fitView]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0B1220] text-[#F8FAFC]">
      {/* Top Navigation */}
      <Navbar
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        isCalculating={isCalculating}
        onSave={saveTopology}
        onReload={fetchTopology}
        onFitView={handleFitView}
        onCalculateDijkstra={calculateDijkstra}
        hasAlgorithmResult={Boolean(dijkstraResult)}
        onResetAlgorithmResult={resetAlgorithmResult}
      />

      {/* Main Studio Body */}
      <div className="flex flex-1 w-full h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* Left Sidebar: Controls & List */}
        <Sidebar
          nodes={nodes}
          selectedNodeId={selectedNodeId}
          onSelectNode={handleSelectNodeFromSidebar}
          onAddRouter={addRouter}
          onLoadExample={loadExample}
          onClearNetwork={() => setIsClearConfirmOpen(true)}
          onDeleteNode={deleteNode}
          onCalculateDijkstra={calculateDijkstra}
          isCalculating={isCalculating}
        />

        {/* Center: Canvas and Results Drawer */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          <NetworkCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            onEdgeClick={handleEdgeClick}
            onPaneClick={handlePaneClick}
          />

          {/* Shortest Path Results Panel (Dijkstra Engine Output) */}
          <ShortestPathResult
            result={dijkstraResult}
            isTopologyModified={isTopologyModified}
            onResetResult={resetAlgorithmResult}
            onRecalculate={calculateDijkstra}
          />
        </div>

        {/* Right Sidebar: Properties & Metrics */}
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
      </div>

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

      {/* Toast Feedback */}
      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
};

export const NetworkEditor = () => {
  return (
    <ReactFlowProvider>
      <NetworkEditorContent />
    </ReactFlowProvider>
  );
};
