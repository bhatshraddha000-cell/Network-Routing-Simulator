import React, { useState } from 'react';
import {
  Route,
  Clock,
  Compass,
  CheckCircle2,
  XCircle,
  Table as TableIcon,
  RotateCcw,
  Layers,
  ChevronRight,
  Info,
  Zap,
} from 'lucide-react';

export const ShortestPathResult = ({
  result,
  isTopologyModified,
  onResetResult,
  onRecalculate,
}) => {
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'table' | 'info'

  if (!result && !isTopologyModified) return null;

  return (
    <div className="bg-[#111C2F] border-t border-[#24344D] p-4 select-none shadow-2xl animate-fade-in">
      {/* Topology Modified Warning Banner */}
      {isTopologyModified && (
        <div className="mb-3 px-3.5 py-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Network topology changed. Recalculate to obtain the updated shortest path.
            </span>
          </div>
          {onRecalculate && (
            <button
              onClick={onRecalculate}
              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition-colors"
            >
              Recalculate
            </button>
          )}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#24344D] pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30">
                <Route className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#F8FAFC]">
                    Dijkstra's Shortest Path Result
                  </h3>
                  {result.reachable ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      Destination Reachable
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                      <XCircle className="w-3 h-3" />
                      Unreachable
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#94A3B8]">
                  From Source <strong className="text-emerald-400">({result.sourceId})</strong> to Destination <strong className="text-orange-400">({result.destinationId})</strong>
                </p>
              </div>
            </div>

            {/* Tabs & Reset */}
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg bg-[#0B1220] p-0.5 border border-[#24344D]">
                <button
                  type="button"
                  onClick={() => setActiveTab('summary')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                    activeTab === 'summary'
                      ? 'bg-[#19263A] text-[#38BDF8]'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  Summary
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('table')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                    activeTab === 'table'
                      ? 'bg-[#19263A] text-[#38BDF8]'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  Distance Table
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('info')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                    activeTab === 'info'
                      ? 'bg-[#19263A] text-[#38BDF8]'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  Complexity & Stats
                </button>
              </div>

              <button
                type="button"
                onClick={onResetResult}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#19263A] hover:bg-rose-950/40 text-[#94A3B8] hover:text-rose-300 border border-[#24344D] hover:border-rose-800/60 text-xs font-medium transition-colors"
                title="Clear algorithm highlighting and results"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Result
              </button>
            </div>
          </div>

          {/* TAB 1: SUMMARY */}
          {activeTab === 'summary' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
              {/* Shortest Route Display */}
              <div className="md:col-span-2 p-3.5 bg-[#19263A] rounded-xl border border-[#24344D] space-y-2">
                <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                  Selected Shortest Route
                </span>

                {result.reachable && result.shortestPath.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-2 py-2">
                    {result.shortestPath.map((nodeId, idx) => {
                      const isSrc = nodeId === result.sourceId;
                      const isDst = nodeId === result.destinationId;

                      let nodeBadge = 'bg-[#3B82F6]/20 text-[#38BDF8] border-[#3B82F6]/40';
                      if (isSrc) nodeBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold';
                      if (isDst) nodeBadge = 'bg-orange-500/20 text-orange-300 border-orange-500/40 font-bold';

                      return (
                        <React.Fragment key={nodeId}>
                          <span
                            className={`px-3 py-1.5 rounded-lg border text-sm font-mono shadow-sm flex items-center gap-1.5 ${nodeBadge}`}
                          >
                            <span>{nodeId}</span>
                            <span className="text-[10px] opacity-75 font-sans">
                              {isSrc ? '(Source)' : isDst ? '(Dest)' : ''}
                            </span>
                          </span>
                          {idx < result.shortestPath.length - 1 && (
                            <ChevronRight className="w-4 h-4 text-[#38BDF8] animate-pulse" />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-2 text-rose-400 text-xs font-medium flex items-center gap-2">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>No path exists between Source and Destination. Destination is unreachable.</span>
                  </div>
                )}

                {/* Finalized Visit Sequence */}
                <div className="pt-2 border-t border-[#24344D]/70">
                  <div className="text-[10px] text-[#94A3B8] uppercase font-semibold mb-1">
                    Visited Router Sequence (Finalized Order):
                  </div>
                  <div className="flex flex-wrap items-center gap-1 text-xs font-mono text-[#F8FAFC]">
                    {result.visitedOrder.map((nodeId, idx) => (
                      <span key={nodeId} className="flex items-center gap-1">
                        <span className="bg-[#0B1220] px-2 py-0.5 rounded border border-[#24344D] text-[#38BDF8]">
                          {nodeId}
                        </span>
                        {idx < result.visitedOrder.length - 1 && (
                          <span className="text-[#94A3B8] text-[10px]">→</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Total Cost Metric */}
              <div className="p-3.5 bg-[#19263A] rounded-xl border border-[#24344D] flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                    Minimum Total Cost
                  </span>
                  <div className="mt-2">
                    {result.reachable && result.totalCost !== null ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-[#38BDF8] font-mono tracking-tight">
                          {result.totalCost}
                        </span>
                        <span className="text-xs text-[#94A3B8] font-medium uppercase">units</span>
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-rose-400 font-mono">
                        Infinite / Null
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#24344D]/70 text-[11px] text-[#94A3B8]">
                  <span>Hops: </span>
                  <strong className="text-[#F8FAFC]">
                    {result.shortestPath.length > 0 ? result.shortestPath.length - 1 : 0} links
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DISTANCE TABLE */}
          {activeTab === 'table' && (
            <div className="max-h-60 overflow-y-auto rounded-xl border border-[#24344D] bg-[#0B1220] animate-fade-in">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#19263A] text-[#94A3B8] uppercase tracking-wider font-semibold border-b border-[#24344D] sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Router</th>
                    <th className="py-2.5 px-3 text-right">Distance from S</th>
                    <th className="py-2.5 px-3">Predecessor</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Visit Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#19263A] font-mono">
                  {result.distanceTable.map((row) => {
                    const isSrc = row.nodeId === result.sourceId;
                    const isDst = row.nodeId === result.destinationId;
                    const onPath = result.shortestPath.includes(row.nodeId);

                    return (
                      <tr
                        key={row.nodeId}
                        className={`transition-colors ${
                          onPath
                            ? 'bg-[#38BDF8]/10 text-[#F8FAFC]'
                            : 'hover:bg-[#111C2F] text-[#94A3B8]'
                        }`}
                      >
                        <td className="py-2 px-3 font-bold flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isSrc
                                ? 'bg-emerald-400'
                                : isDst
                                ? 'bg-orange-400'
                                : 'bg-[#3B82F6]'
                            }`}
                          />
                          <span className={onPath ? 'text-[#38BDF8]' : 'text-[#F8FAFC]'}>
                            {row.label || row.nodeId}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-[#F8FAFC]">
                          {row.distance !== null ? row.distance : 'null (∞)'}
                        </td>
                        <td className="py-2 px-3 text-[#F8FAFC]">
                          {row.predecessor ? row.predecessor : '—'}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase ${
                              row.status === 'VISITED'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right text-[#F8FAFC]">
                          {row.visitOrder !== null ? `#${row.visitOrder}` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: COMPLEXITY & STATS */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs animate-fade-in">
              <div className="p-3 bg-[#19263A] rounded-xl border border-[#24344D]">
                <div className="text-[11px] text-[#94A3B8] uppercase font-semibold">Algorithm</div>
                <div className="font-bold text-[#F8FAFC] mt-0.5">Dijkstra's Shortest Path</div>
                <div className="text-[10px] text-[#38BDF8] mt-1 font-mono">Min-Heap + Adj List</div>
              </div>

              <div className="p-3 bg-[#19263A] rounded-xl border border-[#24344D]">
                <div className="text-[11px] text-[#94A3B8] uppercase font-semibold">Time Complexity</div>
                <div className="font-bold text-[#38BDF8] mt-0.5 font-mono">
                  {result.stats?.timeComplexity || 'O((V + E) log V)'}
                </div>
                <div className="text-[10px] text-[#94A3B8] mt-1">Binary Min-Heap Priority Queue</div>
              </div>

              <div className="p-3 bg-[#19263A] rounded-xl border border-[#24344D]">
                <div className="text-[11px] text-[#94A3B8] uppercase font-semibold">Space Complexity</div>
                <div className="font-bold text-[#38BDF8] mt-0.5 font-mono">
                  {result.stats?.spaceComplexity || 'O(V + E)'}
                </div>
                <div className="text-[10px] text-[#94A3B8] mt-1">Adjacency List & Heap State</div>
              </div>

              <div className="p-3 bg-[#19263A] rounded-xl border border-[#24344D]">
                <div className="text-[11px] text-[#94A3B8] uppercase font-semibold">Routers / Links</div>
                <div className="font-bold text-[#F8FAFC] mt-0.5 font-mono">
                  {result.stats?.totalRouters} routers, {result.stats?.totalLinks} links
                </div>
                <div className="text-[10px] text-emerald-400 mt-1">
                  {result.stats?.reachableRouters} reachable
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

