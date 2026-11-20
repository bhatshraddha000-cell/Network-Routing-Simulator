import React from 'react';
import { GitCompare, TrendingDown, CheckCircle2, Info } from 'lucide-react';

export const DirectRouteComparison = ({
  edges = [],
  sourceId = 'S',
  destinationId = 'D',
  optimalCost = null,
  shortestPath = [],
}) => {
  const edgeList = Array.isArray(edges) ? edges : [];
  const path = Array.isArray(shortestPath) ? shortestPath : [];

  // Check for direct edge connecting S and D defensively
  const directEdge = edgeList.find((e) => {
    const dir = e?.data?.direction || e?.direction || 'BIDIRECTIONAL';
    if (e.source === sourceId && e.target === destinationId) return true;
    if (dir === 'BIDIRECTIONAL' && e.source === destinationId && e.target === sourceId) return true;
    return false;
  });

  const hasDirectEdge = Boolean(directEdge);
  const rawWeight = directEdge?.data?.weight ?? directEdge?.weight ?? null;
  const directCost = hasDirectEdge && rawWeight !== null ? Number(rawWeight) : null;
  const numericOptimal = optimalCost !== null && optimalCost !== undefined ? Number(optimalCost) : null;

  return (
    <div className="bg-[#142136] rounded-xl border border-[#26364B] p-5 select-none shadow-md space-y-4">
      <div className="flex items-center justify-between border-b border-[#26364B] pb-3">
        <div className="flex items-center gap-2.5">
          <GitCompare className="w-5 h-5 text-[#38BDF8]" />
          <h3 className="text-base font-bold text-[#F1F5F9] uppercase tracking-wider">
            Direct Link vs. Optimal Multi-Hop Route
          </h3>
        </div>
      </div>

      {hasDirectEdge ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-sm">
            <div className="p-3.5 bg-[#0B1220] rounded-xl border border-[#26364B]">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Direct Link (S ➔ D)</span>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1.5">
                {directCost} <span className="text-xs font-sans text-slate-500 font-normal">units</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Single-hop direct link</div>
            </div>

            <div className="p-3.5 bg-[#0B1220] rounded-xl border border-[#26364B]">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Optimal Route</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1.5">
                {numericOptimal !== null ? numericOptimal : '—'}{' '}
                <span className="text-xs font-sans text-slate-500 font-normal">units</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {path.length > 0 ? `${path.length - 1} hops (${path.join(' → ')})` : 'No path'}
              </div>
            </div>

            <div className="p-3.5 bg-[#0B1220] rounded-xl border border-[#26364B]">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Routing Optimization</span>
              {numericOptimal !== null && directCost !== null && directCost > numericOptimal ? (
                <>
                  <div className="text-2xl font-bold font-mono text-[#38BDF8] mt-1.5 flex items-center gap-1.5">
                    <TrendingDown className="w-5 h-5 text-emerald-400" />
                    {(directCost - numericOptimal).toFixed(2).replace(/\.00$/, '')} saved
                  </div>
                  <div className="text-xs text-emerald-400 mt-0.5 font-medium">
                    {Math.round(((directCost - numericOptimal) / directCost) * 100)}% cheaper via intermediate hops
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xl font-bold font-mono text-slate-300 mt-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    Direct is Optimal
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Direct connection offers minimal cost</div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3.5 rounded-lg bg-[#0B1220] border border-[#26364B] text-sm text-[#94A3B8] flex items-center gap-2.5">
          <Info className="w-4 h-4 text-[#38BDF8] shrink-0" />
          <span className="leading-relaxed">
            No direct connection exists between Source ({sourceId}) and Destination ({destinationId}). All network traffic must route through intermediate router hops.
          </span>
        </div>
      )}
    </div>
  );
};
