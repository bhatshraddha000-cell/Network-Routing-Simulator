import React, { useMemo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MarkerType,
  Handle,
  Position,
} from '@xyflow/react';
import { GitFork, Sparkles, ShieldCheck, Flag, Radio } from 'lucide-react';

// Custom compact node for the Shortest Path Tree
const TreeNode = ({ data }) => {
  const isSource = data.isSource;
  const isDestination = data.isDestination;
  const onDestPath = data.isDestinationPath;

  let borderColor = 'border-[#38BDF8]';
  let badgeColor = 'bg-[#38BDF8]/20 text-[#38BDF8]';
  let Icon = Radio;

  if (isSource) {
    borderColor = 'border-[#22C55E] ring-2 ring-[#22C55E]/40';
    badgeColor = 'bg-emerald-500/20 text-emerald-400';
    Icon = ShieldCheck;
  } else if (isDestination) {
    borderColor = 'border-[#F97316] ring-2 ring-[#F97316]/40';
    badgeColor = 'bg-orange-500/20 text-orange-400';
    Icon = Flag;
  } else if (onDestPath) {
    borderColor = 'border-[#22C55E] ring-2 ring-[#22C55E]/30';
    badgeColor = 'bg-emerald-500/20 text-emerald-400';
  }

  return (
    <div
      className={`px-3 py-2 rounded-xl bg-[#142136] border-2 shadow-xl select-none min-w-[120px] transition-all ${borderColor}`}
    >
      <Handle type="target" position={Position.Left} className="!bg-[#38BDF8] !w-2 !h-2" />
      <Handle type="source" position={Position.Right} className="!bg-[#38BDF8] !w-2 !h-2" />

      <div className="flex items-center gap-2">
        <div className="p-1 rounded bg-[#0B1220] text-[#38BDF8] shrink-0">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="font-bold text-xs text-[#F1F5F9] truncate">{data.label}</span>
            {onDestPath && <Sparkles className="w-2.5 h-2.5 text-[#22C55E] shrink-0" />}
          </div>
          <div className="flex items-center justify-between gap-1 mt-0.5">
            <span className={`text-[9px] px-1 py-0.2 rounded font-sans uppercase font-bold ${badgeColor}`}>
              {isSource ? 'Root (S)' : isDestination ? 'Dest (D)' : 'Hop'}
            </span>
            <span className="text-[10px] font-mono text-[#F1F5F9] font-bold">
              d: {data.distance}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const treeNodeTypes = {
  treeNode: TreeNode,
};

export const ShortestPathTree = ({
  distanceTable = [],
  shortestPathTree = [],
  sourceId = 'S',
  destinationId = 'D',
  shortestPath = [],
}) => {
  // Build tree layout dynamically from predecessors
  const { nodes, edges } = useMemo(() => {
    const reachableTable = distanceTable.filter(
      (r) => r.distance !== null && r.distance !== undefined && r.status === 'VISITED'
    );

    if (reachableTable.length === 0) {
      return { nodes: [], edges: [] };
    }

    // Map parent -> children
    const childrenMap = new Map();
    reachableTable.forEach((r) => childrenMap.set(r.nodeId, []));
    reachableTable.forEach((r) => {
      if (r.predecessor && childrenMap.has(r.predecessor)) {
        childrenMap.get(r.predecessor).push(r.nodeId);
      }
    });

    // Compute depth / level from root
    const levels = new Map();
    const queue = [{ id: sourceId, level: 0 }];
    levels.set(sourceId, 0);

    while (queue.length > 0) {
      const { id, level } = queue.shift();
      const children = childrenMap.get(id) || [];
      children.forEach((cId) => {
        if (!levels.has(cId)) {
          levels.set(cId, level + 1);
          queue.push({ id: cId, level: level + 1 });
        }
      });
    }

    // Group by level for vertical distribution
    const levelGroups = new Map();
    levels.forEach((lvl, nId) => {
      if (!levelGroups.has(lvl)) levelGroups.set(lvl, []);
      levelGroups.get(lvl).push(nId);
    });

    // Create positioned nodes
    const flowNodes = [];
    const destPathSet = new Set(shortestPath);

    levelGroups.forEach((nodeList, lvl) => {
      const totalInLvl = nodeList.length;
      nodeList.forEach((nId, idx) => {
        const row = reachableTable.find((r) => r.nodeId === nId);
        const ySpacing = 90;
        const startY = 150 - ((totalInLvl - 1) * ySpacing) / 2;
        const posX = 60 + lvl * 210;
        const posY = startY + idx * ySpacing;

        flowNodes.push({
          id: nId,
          type: 'treeNode',
          position: { x: posX, y: posY },
          data: {
            label: row?.label || nId,
            distance: row?.distance ?? 0,
            isSource: nId === sourceId,
            isDestination: nId === destinationId,
            isDestinationPath: destPathSet.has(nId),
          },
        });
      });
    });

    // Create directed tree edges
    const flowEdges = shortestPathTree.map((e) => {
      const isPathBranch = Boolean(e.isDestinationPath);

      return {
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'smoothstep',
        label: `${e.weight}`,
        labelStyle: {
          fill: isPathBranch ? '#22C55E' : '#38BDF8',
          fontWeight: 700,
          fontFamily: 'monospace',
          fontSize: 11,
        },
        labelBgStyle: {
          fill: '#101A2B',
          stroke: isPathBranch ? '#22C55E' : '#26364B',
          strokeWidth: 1,
          rx: 4,
        },
        style: {
          stroke: isPathBranch ? '#22C55E' : '#38BDF8',
          strokeWidth: isPathBranch ? 3.5 : 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isPathBranch ? '#22C55E' : '#38BDF8',
          width: 14,
          height: 14,
        },
      };
    });

    return { nodes: flowNodes, edges: flowEdges };
  }, [distanceTable, shortestPathTree, sourceId, destinationId, shortestPath]);

  return (
    <div className="bg-[#142136] rounded-xl border border-[#26364B] overflow-hidden select-none shadow-md flex flex-col h-[340px]">
      <div className="p-3.5 border-b border-[#26364B] flex items-center justify-between bg-[#101A2B]/40">
        <div className="flex items-center gap-2">
          <GitFork className="w-4 h-4 text-[#38BDF8]" />
          <h3 className="text-xs font-bold text-[#F1F5F9] uppercase tracking-wider">
            Shortest-Path Tree (SPT) Rooted at Source
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-[#22C55E] rounded-full inline-block" />
            <span className="text-emerald-400 font-semibold">Optimal Destination Route</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-[#38BDF8] rounded-full inline-block" />
            <span>Reachable Tree Branches</span>
          </span>
        </div>
      </div>

      <div className="flex-1 w-full h-full relative bg-[#0B1220]">
        {nodes.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs text-[#94A3B8]">
            No reachable routers found in the shortest path tree.
          </div>
        ) : (
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={treeNodeTypes}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              minZoom={0.3}
              maxZoom={2}
            >
              <Background color="#1B2B43" gap={16} size={1} />
              <Controls showInteractive={false} />
            </ReactFlow>
          </ReactFlowProvider>
        )}
      </div>
    </div>
  );
};
