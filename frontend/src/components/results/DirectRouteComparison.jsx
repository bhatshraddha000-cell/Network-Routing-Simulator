import React from 'react';
import { GitCompare, TrendingDown, CheckCircle2, Info } from 'lucide-react';

export const DirectRouteComparison = ({
  edges = [],
  sourceId = 'S',
  destinationId = 'D',
  optimalCost = null,
  shortestPath = [],
}) => {
  // Check for direct edge connecting S and D
  const directEdge = edges.find((e) => {
    if (e.source === sourceId && e.target === destinationId) return true;
    if (e.direction === 'BIDIRECTIONAL' && e.source === destinationId && e.target === sourceId) return true;
    return false;
  });

  const hasDirectEdge = Boolean(directEdge);
  const directCost = hasDirectEdge ? Number(directEdge.weight) : null;

  return (
    <div className="bg-[#142136] rounded-xl border border-[#26364B] p-4 select-none shadow-md space-y-3">
      <div className="flex items-center justify-between border-b border-[#26364B] pb-2.5">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-[#38BDF8]" />
          <h3 className="text-xs font-bold text-[#F1F5F9] uppercase tracking-wider">
            Direct Link vs. Optimal Multi-Hop Route
          </h3>
        </div>
      </div>

      {hasDirectEdge ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-[#0B1220] rounded-xl border border-[#26364B]">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Direct Connection (S ➔ D)</span>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                {directCost} <span className="text-xs font-sans text-slate-500 font-normal">units</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Single-hop direct link</div>
            </div>

            <div className="p-3 bg-[#0B1220] rounded-xl border border-[#26364B]">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Calculated Optimal Route</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {optimalCost !== null ? optimalCost : '—'}{' '}
                <span className="text-xs font-sans text-slate-500 font-normal">units</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {shortestPath.length > 0 ? `${shortestPath.length - 1} hops (${shortestPath.join(' → ')})` : 'No path'}
              </div>
            </div>

            <div className="p-3 bg-[#0B1220] rounded-xl border border-[#26364B]">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Routing Optimization</span>
              {optimalCost !== null && directCost > optimalCost ? (
                <>
                  <div className="text-2xl font-bold font-mono text-[#38BDF8] mt-1 flex items-center gap-1">
                    <TrendingDown className="w-5 h-5 text-emerald-400" />
                    {(directCost - optimalCost).toFixed(2).replace(/\.00$/, '')} saved
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">
                    {Math.round(((directCost - optimalCost) / directCost) * 100)}% cheaper via intermediate hops
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xl font-bold font-mono text-slate-300 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    Direct is Optimal
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Direct connection has minimal cost</div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="px-3.5 py-3 rounded-lg bg-[#0B1220] border border-[#26364B] text-xs text-[#94A3B8] flex items-center gap-2">
          <Info className="w-4 h-4 text-[#38BDF8] shrink-0" />
          <span>
            No direct connection exists between Source ({sourceId}) and Destination ({destinationId}). All network packets must route through intermediate router hops.
          </span>
        </div>
      )}
    </div>
  );
};

