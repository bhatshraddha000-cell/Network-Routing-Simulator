import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  ConnectionMode,
} from '@xyflow/react';
import { RouterNode } from './RouterNode';
import { NetworkEdge } from './NetworkEdge';

const nodeTypes = {
  router: RouterNode,
};

const edgeTypes = {
  networkEdge: NetworkEdge,
};

export const NetworkCanvas = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onEdgeClick,
  onPaneClick,
  isSimulationActive = false,
}) => {
  // MiniMap node color mapper reflecting simulation state
  const nodeColor = useCallback((node) => {
    const simState = node.data?.simState;
    if (simState === 'shortestPath' || node.data?.isOnShortestPath) return '#22C55E';
    if (simState === 'current') return '#38BDF8';
    if (simState === 'visited') return '#A855F7';
    if (simState === 'unreachable') return '#64748B';
    if (node.id === 'S' || node.data?.type === 'source') return '#22C55E';
    if (node.id === 'D' || node.data?.type === 'destination') return '#F97316';
    return '#3B82F6';
  }, []);

  // Format edges with custom type and marker settings
  const formattedEdges = useMemo(() => {
    return edges.map((edge) => {
      const isOneWay = edge.data?.direction === 'ONE_WAY';
      const simEdgeState = edge.data?.simEdgeState;
      const isOnPath = Boolean(edge.data?.isOnShortestPath);
      const isSelected = Boolean(edge.selected);

      let markerColor = '#64748B';
      if (simEdgeState === 'shortestPath' || isOnPath) {
        markerColor = '#22C55E';
      } else if (simEdgeState === 'examining') {
        markerColor = '#FBBF24';
      } else if (simEdgeState === 'relaxed') {
        markerColor = '#38BDF8';
      } else if (isSelected) {
        markerColor = '#38BDF8';
      } else if (edge.data?.isAnyPathActive || isSimulationActive) {
        markerColor = '#334155';
      }

      return {
        ...edge,
        type: 'networkEdge',
        markerEnd: isOneWay
          ? {
              type: MarkerType.ArrowClosed,
              width: 16,
              height: 16,
              color: markerColor,
            }
          : undefined,
      };
    });
  }, [edges, isSimulationActive]);

  return (
    <div className="flex-1 h-full w-full relative bg-[#0B1220]">
      <ReactFlow
        nodes={nodes}
        edges={formattedEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={isSimulationActive ? undefined : onNodesChange}
        onEdgesChange={isSimulationActive ? undefined : onEdgesChange}
        onConnect={isSimulationActive ? undefined : onConnect}
        onNodeClick={isSimulationActive ? undefined : onNodeClick}
        onEdgeClick={isSimulationActive ? undefined : onEdgeClick}
        onPaneClick={onPaneClick}
        nodesDraggable={!isSimulationActive}
        nodesConnectable={!isSimulationActive}
        elementsSelectable={!isSimulationActive}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2.5}
        defaultEdgeOptions={{
          type: 'networkEdge',
        }}
      >
        <Background color="#24344D" gap={20} size={1.5} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={nodeColor}
          nodeStrokeWidth={2}
          maskColor="rgba(11, 18, 32, 0.75)"
          className="!bottom-4 !right-4"
          zoomable
          pannable
        />
      </ReactFlow>
    </div>
  );
};
