import React from 'react';
import {
  Network,
  Play,
  FileText,
  Route,
  Zap,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Flag,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { ReactFlow, ReactFlowProvider, Background } from '@xyflow/react';
import { RouterNode } from '../components/network/RouterNode';
import { NetworkEdge } from '../components/network/NetworkEdge';

const previewNodeTypes = {
  router: RouterNode,
};

const previewEdgeTypes = {
  networkEdge: NetworkEdge,
};

export const Dashboard = ({
  nodes = [],
  edges = [],
  dijkstraResult = null,
  isTopologyModified = false,
  onNavigateToTopology,
  onNavigateToSimulator,
  onNavigateToResults,
}) => {
  const totalRouters = nodes.length;
  const totalLinks = edges.length;
  const isSimulationValid = dijkstraResult !== null && !isTopologyModified;

  const reachableCount = isSimulationValid
    ? (dijkstraResult.distanceTable || []).filter((r) => r.status === 'VISITED' && r.distance !== null).length
    : '—';

  const lastCost = isSimulationValid
    ? dijkstraResult.reachable && dijkstraResult.totalCost !== null
      ? `${dijkstraResult.totalCost} units`
      : 'Unreachable'
    : 'Not Calculated';

  return (
    <div className="flex-1 overflow-y-auto bg-[#0B1220] p-6 space-y-6 select-none">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#26364B] pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#F1F5F9] tracking-tight">
            Network Routing Overview
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Design, simulate, and analyze weighted shortest path routes using Dijkstra's algorithm.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onNavigateToTopology}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#142136] hover:bg-[#1B2B43] text-[#F1F5F9] text-xs font-semibold border border-[#26364B] transition-all active:scale-95"
          >
            <Network className="w-3.5 h-3.5 text-[#38BDF8]" />
            Build Network
          </button>

          <button
            onClick={onNavigateToSimulator}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-slate-950 text-xs font-bold shadow-md shadow-sky-500/20 transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Run Simulation
          </button>

          <button
            onClick={onNavigateToResults}
            disabled={!isSimulationValid}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95 ${
              isSimulationValid
                ? 'bg-[#142136] hover:bg-[#1B2B43] text-[#F1F5F9] border-[#26364B]'
                : 'bg-[#101A2B]/40 text-slate-600 border-[#26364B]/40 cursor-not-allowed'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#22C55E]" />
            View Results
          </button>
        </div>
      </div>

      {/* 4 Live Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#142136] rounded-xl border border-[#26364B] shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Routers</span>
            <Network className="w-4 h-4 text-[#38BDF8]" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-[#F1F5F9] mt-2">
            {totalRouters}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">2 permanent (S, D)</div>
        </div>

        <div className="p-4 bg-[#142136] rounded-xl border border-[#26364B] shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Communication Links</span>
            <Share2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-[#F1F5F9] mt-2">
            {totalLinks}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Weighted graph channels</div>
        </div>

        <div className="p-4 bg-[#142136] rounded-xl border border-[#26364B] shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Reachable Routers</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-2">
            {reachableCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">From Source (S)</div>
        </div>

        <div className="p-4 bg-[#142136] rounded-xl border border-[#26364B] shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Last Minimum Cost</span>
            <Zap className="w-4 h-4 text-[#38BDF8]" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-[#38BDF8] mt-2 truncate">
            {lastCost}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Source S ➔ Destination D</div>
        </div>
      </div>

      {/* Main Row: Recent Simulation & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Simulation Card */}
        <div className="bg-[#142136] rounded-xl border border-[#26364B] p-5 shadow-md flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-[#26364B] pb-3">
            <div className="flex items-center gap-2">
              <Route className="w-4 h-4 text-[#38BDF8]" />
              <h2 className="text-xs font-bold text-[#F1F5F9] uppercase tracking-wider">
                Latest Simulation State
              </h2>
            </div>
            {isSimulationValid ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Valid
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Awaiting Run
              </span>
            )}
          </div>

          {isSimulationValid ? (
            <div className="space-y-4 flex-1">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                  Optimal Shortest Route:
                </span>
                {dijkstraResult.reachable && dijkstraResult.shortestPath?.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {dijkstraResult.shortestPath.map((nodeId, idx) => (
                      <React.Fragment key={nodeId}>
                        <span className="px-2.5 py-1 rounded-lg bg-[#0B1220] border border-[#26364B] font-mono font-bold text-xs text-[#38BDF8]">
                          {nodeId}
                        </span>
                        {idx < dijkstraResult.shortestPath.length - 1 && (
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-rose-400 mt-1 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" /> Destination is unreachable from Source.
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#26364B]">
                <div className="p-3 bg-[#0B1220] rounded-lg">
                  <div className="text-[10px] text-slate-400 uppercase">Optimal Cost</div>
                  <div className="text-xl font-bold font-mono text-[#22C55E]">
                    {dijkstraResult.totalCost !== null ? `${dijkstraResult.totalCost} units` : 'N/A'}
                  </div>
                </div>

                <div className="p-3 bg-[#0B1220] rounded-lg">
                  <div className="text-[10px] text-slate-400 uppercase">Hops Count</div>
                  <div className="text-xl font-bold font-mono text-[#38BDF8]">
                    {dijkstraResult.shortestPath?.length > 1 ? dijkstraResult.shortestPath.length - 1 : 0} links
                  </div>
                </div>
              </div>

              <button
                onClick={onNavigateToResults}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#1B2B43] hover:bg-[#26364B] text-[#38BDF8] border border-[#26364B] text-xs font-bold transition-all"
              >
                <span>View Full Analysis & Export Reports</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="py-8 text-center space-y-3 flex-1 flex flex-col justify-center">
              <div className="w-12 h-12 rounded-xl bg-[#0B1220] border border-[#26364B] flex items-center justify-center mx-auto text-slate-500">
                <Route className="w-6 h-6" />
              </div>
              <div className="text-xs text-slate-400 max-w-xs mx-auto">
                No active simulation result available. Run Dijkstra's algorithm to analyze the shortest path.
              </div>
              <div>
                <button
                  onClick={onNavigateToSimulator}
                  className="px-4 py-2 rounded-lg bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  Start Simulation
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Read-Only Miniature Topology Preview */}
        <div className="bg-[#142136] rounded-xl border border-[#26364B] p-5 shadow-md flex flex-col space-y-3 h-[320px]">
          <div className="flex items-center justify-between border-b border-[#26364B] pb-2.5">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-[#38BDF8]" />
              <h2 className="text-xs font-bold text-[#F1F5F9] uppercase tracking-wider">
                Active Topology Snapshot
              </h2>
            </div>
            <button
              onClick={onNavigateToTopology}
              className="flex items-center gap-1 text-xs font-semibold text-[#38BDF8] hover:underline"
            >
              <span>Edit Canvas</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 w-full h-full rounded-lg overflow-hidden border border-[#26364B] relative bg-[#0B1220]">
            <ReactFlowProvider>
              <ReactFlow
                nodes={nodes.map((n) => ({ ...n, draggable: false }))}
                edges={edges}
                nodeTypes={previewNodeTypes}
                edgeTypes={previewEdgeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                panOnDrag={false}
                zoomOnScroll={false}
              >
                <Background color="#1B2B43" gap={16} size={1} />
              </ReactFlow>
            </ReactFlowProvider>
          </div>
        </div>
      </div>
    </div>
  );
};
