import React from 'react';
import {
  Route,
  Activity,
  Layers,
  CheckCircle2,
  XCircle,
  Network,
  Share2,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Flag,
} from 'lucide-react';

import { RouteCostBreakdown } from '../components/results/RouteCostBreakdown';
import { DistanceAnalysis } from '../components/results/DistanceAnalysis';
import { ShortestPathTree } from '../components/results/ShortestPathTree';
import { NetworkAnalysis } from '../components/results/NetworkAnalysis';
import { DirectRouteComparison } from '../components/results/DirectRouteComparison';
import { AlgorithmInformation } from '../components/results/AlgorithmInformation';
import { SimulationReport } from '../components/results/SimulationReport';

export const ResultsPage = ({
  result,
  nodes = [],
  edges = [],
  isTopologyModified = false,
  onNavigateToEditor,
  onNavigateToSimulator,
}) => {
  // Empty State if no result or if graph modified
  if (!result || isTopologyModified) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none bg-[#0B1220]">
        <div className="max-w-md w-full bg-[#142136] border border-[#26364B] rounded-2xl p-8 space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#1B2B43] border border-[#26364B] text-[#38BDF8] flex items-center justify-center mx-auto shadow-inner">
            <Activity className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-[#F1F5F9]">
              {isTopologyModified ? 'Simulation Result Outdated' : 'No Simulation Results Available'}
            </h2>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              {isTopologyModified
                ? 'The network topology was modified after the last calculation. Please recalculate to obtain an updated shortest path analysis.'
                : 'Run the Dijkstra shortest path simulator on your active network topology to generate detailed route breakdowns, shortest-path tree visualizations, and exportable reports.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onNavigateToSimulator}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20 transition-all active:scale-95"
            >
              Run Simulation
            </button>
            <button
              onClick={onNavigateToEditor}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#1B2B43] hover:bg-[#26364B] text-[#F1F5F9] font-medium text-xs border border-[#26364B] transition-colors"
            >
              Edit Topology
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    sourceId = 'S',
    destinationId = 'D',
    reachable = false,
    shortestPath = [],
    shortestPathTree = [],
    totalCost = null,
    distanceTable = [],
    visitedOrder = [],
  } = result;

  const totalRouters = nodes.length;
  const totalLinks = edges.length;
  const reachableCount = distanceTable.filter((r) => r.status === 'VISITED' && r.distance !== null).length;
  const unreachableCount = totalRouters - reachableCount;
  const hopCount = shortestPath.length > 1 ? shortestPath.length - 1 : 0;
  const routersTraversed = shortestPath.length;

  return (
    <div className="flex-1 overflow-y-auto bg-[#0B1220] p-6 space-y-6 select-none print:bg-white print:text-black print:p-0">
      {/* 1. Header Bar with Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#26364B] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-extrabold text-[#F1F5F9] tracking-tight">
              Results & Network Analysis
            </h1>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                reachable
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
              }`}
            >
              {reachable ? 'Target Reachable' : 'Target Unreachable'}
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Analytical review of Dijkstra's algorithm execution across active network topology.
          </p>
        </div>

        <div className="flex items-center gap-2.5 print:hidden">
          <SimulationReport
            result={result}
            nodes={nodes}
            edges={edges}
            sourceId={sourceId}
            destinationId={destinationId}
          />
        </div>
      </div>

      {/* 2. Key Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: Minimum Cost */}
        <div className="p-3.5 bg-[#142136] rounded-xl border border-[#26364B] shadow-sm">
          <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Minimum Cost</span>
          <div className="text-2xl font-extrabold font-mono text-[#22C55E] mt-1">
            {reachable && totalCost !== null ? `${totalCost}` : 'No path'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{reachable ? 'Abstract units' : 'Disconnected'}</div>
        </div>

        {/* Metric 2: Route Hops */}
        <div className="p-3.5 bg-[#142136] rounded-xl border border-[#26364B] shadow-sm">
          <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Route Hops</span>
          <div className="text-2xl font-extrabold font-mono text-[#38BDF8] mt-1">
            {hopCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{hopCount === 1 ? 'Link connection' : 'Link connections'}</div>
        </div>

        {/* Metric 3: Routers Traversed */}
        <div className="p-3.5 bg-[#142136] rounded-xl border border-[#26364B] shadow-sm">
          <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Routers Traversed</span>
          <div className="text-2xl font-extrabold font-mono text-[#F1F5F9] mt-1">
            {routersTraversed}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Including S and D</div>
        </div>

        {/* Metric 4: Visited Routers */}
        <div className="p-3.5 bg-[#142136] rounded-xl border border-[#26364B] shadow-sm">
          <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Visited Routers</span>
          <div className="text-2xl font-extrabold font-mono text-purple-400 mt-1">
            {visitedOrder.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Finalized by Dijkstra</div>
        </div>

        {/* Metric 5: Network Size */}
        <div className="p-3.5 bg-[#142136] rounded-xl border border-[#26364B] shadow-sm">
          <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Network Size</span>
          <div className="text-2xl font-extrabold font-mono text-[#F1F5F9] mt-1">
            {totalRouters} <span className="text-xs font-sans text-slate-400 font-normal">/ {totalLinks}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{totalRouters} routers, {totalLinks} links</div>
        </div>

        {/* Metric 6: Network Reachability */}
        <div className="p-3.5 bg-[#142136] rounded-xl border border-[#26364B] shadow-sm">
          <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Reachability</span>
          <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-1">
            {reachableCount} <span className="text-xs font-sans text-slate-400 font-normal">/ {totalRouters}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{unreachableCount} unreachable</div>
        </div>
      </div>

      {/* 3. Optimal Communication Route Visualizer */}
      <div className="p-4 bg-[#142136] rounded-xl border border-[#26364B] space-y-3 shadow-md">
        <div className="flex items-center justify-between border-b border-[#26364B] pb-2.5">
          <div className="flex items-center gap-2">
            <Route className="w-4 h-4 text-[#22C55E]" />
            <h3 className="text-xs font-bold text-[#F1F5F9] uppercase tracking-wider">
              Optimal Communication Route
            </h3>
          </div>
          <div className="text-xs font-mono text-[#94A3B8]">
            Source ({sourceId}) ➔ Destination ({destinationId})
          </div>
        </div>

        {reachable && shortestPath.length > 0 ? (
          <div className="p-4 bg-[#0B1220] rounded-xl border border-[#26364B] flex flex-wrap items-center justify-center gap-3">
            {shortestPath.map((nodeId, idx) => {
              const isSrc = nodeId === sourceId;
              const isDst = nodeId === destinationId;

              // Find link cost to next node
              let linkCost = null;
              if (idx < shortestPath.length - 1) {
                const nextId = shortestPath[idx + 1];
                const edge = edges.find(
                  (e) =>
                    (e.source === nodeId && e.target === nextId) ||
                    (e.direction === 'BIDIRECTIONAL' && e.source === nextId && e.target === nodeId)
                );
                linkCost = edge ? Number(edge.weight) : null;
              }

              return (
                <React.Fragment key={nodeId}>
                  <div className="flex items-center gap-2">
                    <div
                      className={`px-4 py-2.5 rounded-xl border-2 shadow-lg flex items-center gap-2 ${
                        isSrc
                          ? 'border-[#22C55E] bg-[#142136] text-[#22C55E]'
                          : isDst
                          ? 'border-[#F97316] bg-[#142136] text-[#F97316]'
                          : 'border-[#38BDF8] bg-[#142136] text-[#38BDF8]'
                      }`}
                    >
                      {isSrc ? (
                        <ShieldCheck className="w-4 h-4" />
                      ) : isDst ? (
                        <Flag className="w-4 h-4" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                      )}
                      <div>
                        <div className="text-xs font-bold text-[#F1F5F9]">{nodeId}</div>
                        <div className="text-[9px] uppercase text-slate-400 font-sans">
                          {isSrc ? 'Source' : isDst ? 'Destination' : `Hop #${idx}`}
                        </div>
                      </div>
                    </div>
                  </div>

                  {idx < shortestPath.length - 1 && (
                    <div className="flex flex-col items-center px-1">
                      <span className="text-[11px] font-mono font-bold text-amber-400 mb-0.5">
                        +{linkCost}
                      </span>
                      <ArrowRight className="w-5 h-5 text-[#22C55E]" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          <div className="p-4 bg-rose-950/20 border border-rose-900/40 rounded-xl text-center text-xs text-rose-300">
            No communication route connects Source ({sourceId}) to Destination ({destinationId}).
          </div>
        )}
      </div>

      {/* 4. Route Cost Breakdown Table */}
      <RouteCostBreakdown
        shortestPath={shortestPath}
        edges={edges}
        totalCost={totalCost}
      />

      {/* 5. Shortest Path Tree Visualization (Rooted at Source) */}
      <ShortestPathTree
        distanceTable={distanceTable}
        shortestPathTree={shortestPathTree}
        sourceId={sourceId}
        destinationId={destinationId}
        shortestPath={shortestPath}
      />

      {/* 6. Complete Distance Analysis Table */}
      <DistanceAnalysis
        distanceTable={distanceTable}
        sourceId={sourceId}
        destinationId={destinationId}
        shortestPath={shortestPath}
      />

      {/* 7. Network Connectivity & Direct vs Optimal Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NetworkAnalysis
          nodes={nodes}
          edges={edges}
          distanceTable={distanceTable}
          sourceId={sourceId}
          destinationId={destinationId}
        />

        <DirectRouteComparison
          edges={edges}
          sourceId={sourceId}
          destinationId={destinationId}
          optimalCost={totalCost}
          shortestPath={shortestPath}
        />
      </div>

      {/* 8. Algorithm Information & Complexity */}
      <AlgorithmInformation
        sourceId={sourceId}
        destinationId={destinationId}
        totalRouters={totalRouters}
        totalLinks={totalLinks}
      />
    </div>
  );
};

