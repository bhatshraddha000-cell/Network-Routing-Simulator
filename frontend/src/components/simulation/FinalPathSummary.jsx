import React from 'react';
import { Route, CheckCircle2, XCircle, Sparkles, ChevronRight, Layers } from 'lucide-react';

export const FinalPathSummary = ({
  snapshot,
  sourceId = 'S',
  destinationId = 'D',
  totalRouters = 0,
  onNavigateToResults,
}) => {
  if (!snapshot || !snapshot.isCompleted) return null;

  const { reachable, shortestPath = [], totalCost, visitedList = [] } = snapshot;

  return (
    <div className="bg-[#111C2F] rounded-xl border border-[#22C55E]/40 p-4 select-none space-y-4 shadow-2xl animate-fade-in ring-1 ring-[#22C55E]/30">
      <div className="flex items-center justify-between border-b border-[#24344D] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <Route className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F8FAFC]">
              Dijkstra Simulation Result
            </h3>
            <p className="text-[11px] text-[#94A3B8]">
              Origin: <strong className="text-emerald-400">{sourceId}</strong> ➔ Target:{' '}
              <strong className="text-orange-400">{destinationId}</strong>
            </p>
          </div>
        </div>

        {reachable ? (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Optimal Path Discovered
          </span>
        ) : (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold shadow-sm">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            Destination Unreachable
          </span>
        )}
      </div>

      {reachable && shortestPath.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Path Sequence */}
          <div className="md:col-span-2 p-3 bg-[#0B1220] rounded-lg border border-[#24344D] space-y-2">
            <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Minimum-Cost Route Sequence
            </div>

            <div className="flex flex-wrap items-center gap-2 py-1">
              {shortestPath.map((nodeId, idx) => {
                const isSrc = nodeId === sourceId;
                const isDst = nodeId === destinationId;

                let badgeColor = 'bg-[#3B82F6]/20 text-[#38BDF8] border-[#3B82F6]/40';
                if (isSrc) badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold';
                if (isDst) badgeColor = 'bg-orange-500/20 text-orange-300 border-orange-500/50 font-bold';

                return (
                  <React.Fragment key={nodeId}>
                    <span
                      className={`px-3 py-1.5 rounded-lg border text-xs font-mono shadow-sm flex items-center gap-1 ${badgeColor}`}
                    >
                      <span>{nodeId}</span>
                      <span className="text-[9px] opacity-75 font-sans">
                        {isSrc ? '(Source)' : isDst ? '(Dest)' : ''}
                      </span>
                    </span>
                    {idx < shortestPath.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-emerald-400" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Minimum Total Cost */}
          <div className="p-3 bg-[#0B1220] rounded-lg border border-[#24344D] flex flex-col justify-between">
            <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
              Total Minimum Cost
            </div>
            <div className="my-1">
              <span className="text-3xl font-extrabold text-emerald-400 font-mono">
                {totalCost}
              </span>
              <span className="text-xs text-[#94A3B8] font-medium ml-1">units</span>
            </div>
            <div className="text-[10px] text-[#94A3B8]">
              {shortestPath.length - 1} communication {shortestPath.length - 1 === 1 ? 'link' : 'links'}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-lg text-xs text-rose-300 flex items-center gap-2">
          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>No communication path exists connecting Source ({sourceId}) to Destination ({destinationId}).</span>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#24344D] text-xs">
        <div className="p-2 bg-[#19263A] rounded-lg text-center">
          <div className="text-base font-bold text-[#F8FAFC] font-mono">
            {shortestPath.length > 0 ? shortestPath.length : 0}
          </div>
          <div className="text-[10px] text-[#94A3B8]">Routers in Path</div>
        </div>

        <div className="p-2 bg-[#19263A] rounded-lg text-center">
          <div className="text-base font-bold text-[#38BDF8] font-mono">
            {visitedList.length}
          </div>
          <div className="text-[10px] text-[#94A3B8]">Visited Routers</div>
        </div>

        <div className="p-2 bg-[#19263A] rounded-lg text-center">
          <div className="text-base font-bold text-[#F8FAFC] font-mono">
            {totalRouters}
          </div>
          <div className="text-[10px] text-[#94A3B8]">Total Network Routers</div>
        </div>
      </div>

      {onNavigateToResults && (
        <button
          type="button"
          onClick={onNavigateToResults}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-slate-950 text-xs font-bold shadow-md shadow-sky-500/20 transition-all active:scale-95 cursor-pointer"
        >
          <span>View Detailed Analysis & Reports</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

