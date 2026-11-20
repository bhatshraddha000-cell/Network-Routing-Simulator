import React from 'react';
import {
  Route,
  Activity,
  CheckCircle2,
  XCircle,
  Network,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Flag,
  Play,
  RotateCcw,
} from 'lucide-react';

import { RouteCostBreakdown } from '../components/results/RouteCostBreakdown';
import { DistanceAnalysis } from '../components/results/DistanceAnalysis';
import { ShortestPathTree } from '../components/results/ShortestPathTree';
import { NetworkAnalysis } from '../components/results/NetworkAnalysis';
import { DirectRouteComparison } from '../components/results/DirectRouteComparison';
import { SimulationReport } from '../components/results/SimulationReport';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

export const ResultsPage = ({
  result,
  nodes = [],
  edges = [],
  isTopologyModified = false,
  onNavigateToEditor,
  onNavigateToSimulator,
}) => {
  const nodeList = Array.isArray(nodes) ? nodes : [];
  const edgeList = Array.isArray(edges) ? edges : [];

  // Helper to extract edge weight and direction safely from React Flow or plain edges
  const getEdgeWeight = (e) => {
    const raw = e?.data?.weight ?? e?.weight;
    return raw !== undefined && raw !== null ? Number(raw) : 0;
  };

  const getEdgeDirection = (e) => e?.data?.direction || e?.direction || 'BIDIRECTIONAL';

  // State B & E: No simulation completed or outdated topology
  if (!result || isTopologyModified) {
    return (
      <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-8 text-center select-none bg-[#0B1220]">
        <div className="max-w-lg w-full bg-[#142136] border border-[#26364B] rounded-2xl p-8 space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#1B2B43] border border-[#26364B] text-[#38BDF8] flex items-center justify-center mx-auto shadow-inner">
            <Activity className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#F1F5F9]">
              {isTopologyModified ? 'Simulation Result Outdated' : 'No Simulation Results Available Yet'}
            </h2>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              {isTopologyModified
                ? 'The network topology was modified after the last calculation. Please recalculate to obtain an updated shortest path analysis.'
                : 'Run the Dijkstra shortest path simulator on your active network topology to generate detailed route breakdowns, shortest-path tree visualizations, and exportable reports.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              type="button"
              onClick={onNavigateToSimulator}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-slate-950 font-bold text-sm shadow-md shadow-sky-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Go to Algorithm Simulator</span>
            </button>
            <button
              type="button"
              onClick={onNavigateToEditor}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#1B2B43] hover:bg-[#26364B] text-[#F1F5F9] font-semibold text-sm border border-[#26364B] transition-colors cursor-pointer"
            >
              <Network className="w-4 h-4 text-[#38BDF8]" />
              <span>Edit Topology</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Safe destructuring of result
  const sourceId = result?.sourceId || 'S';
  const destinationId = result?.destinationId || 'D';
  const reachable = Boolean(result?.reachable);
  const shortestPath = Array.isArray(result?.shortestPath) ? result.shortestPath : [];
  const shortestPathTree = Array.isArray(result?.shortestPathTree) ? result.shortestPathTree : [];
  const totalCost = result?.totalCost !== null && result?.totalCost !== undefined ? Number(result.totalCost) : null;
  const distanceTable = Array.isArray(result?.distanceTable) ? result.distanceTable : [];
  const visitedOrder = Array.isArray(result?.visitedOrder) ? result.visitedOrder : [];

  const totalRouters = nodeList.length;
  const totalLinks = edgeList.length;
  const reachableCount = distanceTable.filter((r) => r && r.status === 'VISITED' && r.distance !== null && r.distance !== undefined).length;
  const unreachableCount = Math.max(0, totalRouters - reachableCount);
  const hopCount = shortestPath.length > 1 ? shortestPath.length - 1 : 0;
  const routersTraversed = shortestPath.length;

  return (
    <div className="flex-1 w-full h-full overflow-y-auto bg-[#0B1220] p-6 lg:p-8 space-y-6 select-none print:bg-white print:text-black print:p-0">
      {/* 1. Header Bar with Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#26364B] pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-[#F1F5F9] tracking-tight">
              Results & Network Analysis
            </h1>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${reachable
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                }`}
            >
              {reachable ? 'Target Reachable' : 'Target Unreachable'}
            </span>
          </div>
          <p className="text-sm text-[#94A3B8] mt-1">
            Analytical review of Dijkstra's algorithm execution across active network topology.
          </p>
        </div>

        <div className="flex items-center gap-3 print:hidden">
          <SimulationReport
            result={result}
            nodes={nodeList}
            edges={edgeList}
            sourceId={sourceId}
            destinationId={destinationId}
          />
        </div>
      </div>

      {/* 2. Key Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Metric 1: Minimum Cost */}
        <div className="p-4 bg-[#142136] rounded-xl border border-[#26364B] shadow-sm">
          <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Minimum Cost</span>
          <div className="text-2xl font-extrabold font-mono text-[#22C55E] mt-1.5 truncate">
            {reachable && totalCost !== null ? `${totalCost}` : 'No path'}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">{reachable ? 'Abstract units' : 'Disconnected'}</div>
        </div>

        {/* Metric 2: Route Hops */}
        <div className="p-4 bg-[#142136] rounded-xl border border-[#26364B] shadow-sm">
          <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Route Hops</span>
          <div className="text-2xl font-extrabold font-mono text-[#38BDF8] mt-1.5">
            {reachable ? hopCount : '0'}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">{hopCount === 1 ? 'Link connection' : 'Link connections'}</div>
        </div>

        {/* Metric 3: Routers Traversed */}
        <div className="p-4 bg-[#142136] rounded-xl border border-[#26364B] shadow-sm">
          <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Routers Traversed</span>
          <div className="text-2xl font-extrabold font-mono text-[#F1F5F9] mt-1.5">
            {reachable ? routersTraversed : '0'}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">{reachable ? 'Including S and D' : 'None traversed'}</div>
        </div>

        {/* Metric 4: Visited Routers */}
        <div className="p-4 bg-[#142136] rounded-xl border border-[#26364B] shadow-sm">
          <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Visited Routers</span>
          <div className="text-2xl font-extrabold font-mono text-purple-400 mt-1.5">
            {visitedOrder.length}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">Finalized by Dijkstra</div>
        </div>

        {/* Metric 5: Network Size */}
        <div className="p-4 bg-[#142136] rounded-xl border border-[#26364B] shadow-sm">
          <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Network Size</span>
          <div className="text-2xl font-extrabold font-mono text-[#F1F5F9] mt-1.5">
            {totalRouters} <span className="text-sm font-sans text-slate-400 font-normal">/ {totalLinks}</span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">{totalRouters} routers, {totalLinks} links</div>
        </div>

        {/* Metric 6: Network Reachability */}
        <div className="p-4 bg-[#142136] rounded-xl border border-[#26364B] shadow-sm">
          <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Reachability</span>
          <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-1.5">
            {reachableCount} <span className="text-sm font-sans text-slate-400 font-normal">/ {totalRouters}</span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">{unreachableCount} unreachable</div>
        </div>
      </div>

      {/* 3. Optimal Communication Route Visualizer (State A vs State C) */}
      <div className="p-5 bg-[#142136] rounded-xl border border-[#26364B] space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-[#26364B] pb-3">
          <div className="flex items-center gap-2.5">
            <Route className="w-5 h-5 text-[#22C55E]" />
            <h3 className="text-base font-bold text-[#F1F5F9] uppercase tracking-wider">
              Optimal Communication Route
            </h3>
          </div>
          <div className="text-sm font-mono text-[#94A3B8]">
            Source (<strong className="text-emerald-400">{sourceId}</strong>) ➔ Destination (<strong className="text-orange-400">{destinationId}</strong>)
          </div>
        </div>

        {reachable && shortestPath.length > 0 ? (
          <div className="p-5 bg-[#0B1220] rounded-xl border border-[#26364B] flex flex-wrap items-center justify-center gap-3.5">
            {shortestPath.map((nodeId, idx) => {
              const isSrc = nodeId === sourceId;
              const isDst = nodeId === destinationId;

              // Find link cost to next node safely
              let linkCost = null;
              if (idx < shortestPath.length - 1) {
                const nextId = shortestPath[idx + 1];
                const edge = edgeList.find((e) => {
                  const dir = getEdgeDirection(e);
                  if (e.source === nodeId && e.target === nextId) return true;
                  if (dir === 'BIDIRECTIONAL' && e.source === nextId && e.target === nodeId) return true;
                  return false;
                });
                linkCost = edge ? getEdgeWeight(edge) : null;
              }

              return (
                <React.Fragment key={nodeId}>
                  <div className="flex items-center gap-2">
                    <div
                      className={`px-4 py-2.5 rounded-xl border-2 shadow-lg flex items-center gap-2.5 ${isSrc
                          ? 'border-[#22C55E] bg-[#142136] text-[#22C55E]'
                          : isDst
                            ? 'border-[#F97316] bg-[#142136] text-[#F97316]'
                            : 'border-[#38BDF8] bg-[#142136] text-[#38BDF8]'
                        }`}
                    >
                      {isSrc ? (
                        <ShieldCheck className="w-5 h-5" />
                      ) : isDst ? (
                        <Flag className="w-5 h-5" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                      )}
                      <div>
                        <div className="text-sm font-bold text-[#F1F5F9]">{nodeId}</div>
                        <div className="text-[11px] uppercase text-slate-400 font-sans font-medium">
                          {isSrc ? 'Source' : isDst ? 'Destination' : `Hop #${idx}`}
                        </div>
                      </div>
                    </div>
                  </div>

                  {idx < shortestPath.length - 1 && (
                    <div className="flex flex-col items-center px-1.5">
                      <span className="text-xs font-mono font-bold text-amber-400 mb-0.5">
                        +{linkCost !== null ? linkCost : '—'}
                      </span>
                      <ArrowRight className="w-5 h-5 text-[#22C55E]" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          <div className="p-5 bg-rose-950/20 border border-rose-900/40 rounded-xl text-center space-y-1.5 text-rose-300">
            <div className="flex items-center justify-center gap-2 font-bold text-base text-rose-400">
              <XCircle className="w-5 h-5" />
              <span>No communication path exists between Source ({sourceId}) and Destination ({destinationId}).</span>
            </div>
            <p className="text-xs text-rose-300/80 max-w-md mx-auto">
              Dijkstra's algorithm exhausted all reachable nodes without discovering a link connection to Destination ({destinationId}).
              Check the Distance Analysis table below to see which routers were reached.
            </p>
          </div>
        )}
      </div>

      {/* 4. Route Cost Breakdown Table */}
      {reachable && shortestPath.length >= 2 && (
        <ErrorBoundary title="Route Cost Breakdown Error">
          <RouteCostBreakdown
            shortestPath={shortestPath}
            edges={edgeList}
            totalCost={totalCost}
          />
        </ErrorBoundary>
      )}

      {/* 5. Shortest Path Tree Visualization (Rooted at Source) */}
      <ErrorBoundary title="Shortest-Path Tree Error">
        <ShortestPathTree
          distanceTable={distanceTable}
          shortestPathTree={shortestPathTree}
          sourceId={sourceId}
          destinationId={destinationId}
          shortestPath={shortestPath}
        />
      </ErrorBoundary>

      {/* 6. Complete Distance Analysis Table */}
      <ErrorBoundary title="Distance Analysis Error">
        <DistanceAnalysis
          distanceTable={distanceTable}
          sourceId={sourceId}
          destinationId={destinationId}
          shortestPath={shortestPath}
        />
      </ErrorBoundary>

      {/* 7. Network Connectivity & Direct vs Optimal Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ErrorBoundary title="Network Analysis Error">
          <NetworkAnalysis
            nodes={nodeList}
            edges={edgeList}
            distanceTable={distanceTable}
            sourceId={sourceId}
            destinationId={destinationId}
          />
        </ErrorBoundary>

        <ErrorBoundary title="Direct Route Comparison Error">
          <DirectRouteComparison
            edges={edgeList}
            sourceId={sourceId}
            destinationId={destinationId}
            optimalCost={totalCost}
            shortestPath={shortestPath}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
};
