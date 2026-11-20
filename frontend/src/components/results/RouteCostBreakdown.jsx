import React from 'react';
import { Route, ArrowRight } from 'lucide-react';

export const RouteCostBreakdown = ({
  shortestPath = [],
  edges = [],
  totalCost = null,
}) => {
  const path = Array.isArray(shortestPath) ? shortestPath : [];
  const edgeList = Array.isArray(edges) ? edges : [];

  if (path.length < 2) {
    return (
      <div className="bg-[#142136] rounded-xl border border-[#26364B] p-5 text-center text-sm text-[#94A3B8]">
        No optimal route available to break down.
      </div>
    );
  }

  // Calculate each consecutive link's weight and cumulative cost
  let cumulative = 0;
  const breakdownRows = [];

  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];

    // Find original edge matching from and to, supporting both top-level and data.* properties
    const matchingEdge = edgeList.find((e) => {
      const dir = e?.data?.direction || e?.direction || 'BIDIRECTIONAL';
      if (e.source === from && e.target === to) return true;
      if (dir === 'BIDIRECTIONAL' && e.source === to && e.target === from) return true;
      return false;
    });

    const rawWeight = matchingEdge?.data?.weight ?? matchingEdge?.weight ?? 0;
    const weight = Number(rawWeight) || 0;
    cumulative = Math.round((cumulative + weight) * 100) / 100;

    const direction = matchingEdge?.data?.direction || matchingEdge?.direction || 'BIDIRECTIONAL';

    breakdownRows.push({
      step: i + 1,
      from,
      to,
      edgeId: matchingEdge?.id || '—',
      direction,
      cost: weight,
      cumulativeCost: cumulative,
    });
  }

  return (
    <div className="bg-[#142136] rounded-xl border border-[#26364B] overflow-hidden select-none shadow-md">
      <div className="p-4 border-b border-[#26364B] flex items-center justify-between bg-[#101A2B]/40">
        <div className="flex items-center gap-2.5">
          <Route className="w-5 h-5 text-[#38BDF8]" />
          <h3 className="text-base font-bold text-[#F1F5F9] uppercase tracking-wider">
            Route Cost Breakdown
          </h3>
        </div>
        <div className="flex items-center gap-2 text-sm font-mono">
          <span className="text-[#94A3B8]">Total Calculated:</span>
          <span className="font-bold text-[#22C55E] bg-[#22C55E]/10 px-2.5 py-0.5 rounded border border-[#22C55E]/20 text-sm">
            {cumulative} units
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0B1220] text-[#94A3B8] uppercase text-xs font-semibold border-b border-[#26364B]">
            <tr>
              <th className="py-3 px-4 w-20">Step</th>
              <th className="py-3 px-4">Connection Hop</th>
              <th className="py-3 px-4">Link Type</th>
              <th className="py-3 px-4 text-right">Link Cost</th>
              <th className="py-3 px-4 text-right">Cumulative Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1B2B43] font-mono text-sm">
            {breakdownRows.map((row) => (
              <tr key={row.step} className="hover:bg-[#1B2B43]/50 transition-colors">
                <td className="py-3 px-4 text-slate-500 font-bold">#{row.step}</td>
                <td className="py-3 px-4 font-bold text-[#F1F5F9]">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-[#101A2B] border border-[#26364B] text-[#38BDF8] text-sm">
                      {row.from}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                    <span className="px-2.5 py-0.5 rounded bg-[#101A2B] border border-[#26364B] text-[#38BDF8] text-sm">
                      {row.to}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-400 font-sans text-xs">
                  {row.direction === 'ONE_WAY' ? 'One-Way Link' : 'Bidirectional Link'}
                </td>
                <td className="py-3 px-4 text-right font-bold text-amber-400">
                  +{row.cost}
                </td>
                <td className="py-3 px-4 text-right font-bold text-[#22C55E]">
                  {row.cumulativeCost}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
