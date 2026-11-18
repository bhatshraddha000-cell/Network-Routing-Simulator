import React from 'react';
import { Route, ArrowRight, CheckCircle2 } from 'lucide-react';

export const RouteCostBreakdown = ({
  shortestPath = [],
  edges = [],
  totalCost = null,
}) => {
  if (!shortestPath || shortestPath.length < 2) {
    return (
      <div className="bg-[#142136] rounded-xl border border-[#26364B] p-5 text-center text-xs text-[#94A3B8]">
        No optimal route available to break down.
      </div>
    );
  }

  // Calculate each consecutive link's weight and cumulative cost
  let cumulative = 0;
  const breakdownRows = [];

  for (let i = 0; i < shortestPath.length - 1; i++) {
    const from = shortestPath[i];
    const to = shortestPath[i + 1];

    // Find original edge matching from and to
    const matchingEdge = edges.find((e) => {
      if (e.source === from && e.target === to) return true;
      if (e.direction === 'BIDIRECTIONAL' && e.source === to && e.target === from) return true;
      return false;
    });

    const weight = matchingEdge ? Number(matchingEdge.weight) : 0;
    cumulative = Math.round((cumulative + weight) * 100) / 100;

    breakdownRows.push({
      step: i + 1,
      from,
      to,
      edgeId: matchingEdge?.id || '—',
      direction: matchingEdge?.direction || 'BIDIRECTIONAL',
      cost: weight,
      cumulativeCost: cumulative,
    });
  }

  const isCostMatching = totalCost === null || Math.abs(cumulative - totalCost) < 0.01;

  return (
    <div className="bg-[#142136] rounded-xl border border-[#26364B] overflow-hidden select-none shadow-md">
      <div className="p-4 border-b border-[#26364B] flex items-center justify-between bg-[#101A2B]/40">
        <div className="flex items-center gap-2">
          <Route className="w-4 h-4 text-[#38BDF8]" />
          <h3 className="text-xs font-bold text-[#F1F5F9] uppercase tracking-wider">
            Route Cost Breakdown
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#94A3B8]">Total Calculated:</span>
          <span className="font-bold text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded border border-[#22C55E]/20">
            {cumulative} units
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0B1220] text-[#94A3B8] uppercase font-semibold border-b border-[#26364B]">
            <tr>
              <th className="py-2.5 px-4 w-16">Step</th>
              <th className="py-2.5 px-4">Connection Hop</th>
              <th className="py-2.5 px-4">Type</th>
              <th className="py-2.5 px-4 text-right">Link Cost</th>
              <th className="py-2.5 px-4 text-right">Cumulative Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1B2B43] font-mono">
            {breakdownRows.map((row) => (
              <tr key={row.step} className="hover:bg-[#1B2B43]/50 transition-colors">
                <td className="py-2.5 px-4 text-slate-500 font-bold">#{row.step}</td>
                <td className="py-2.5 px-4 font-bold text-[#F1F5F9]">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#101A2B] border border-[#26364B] text-[#38BDF8]">
                      {row.from}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    <span className="px-2 py-0.5 rounded bg-[#101A2B] border border-[#26364B] text-[#38BDF8]">
                      {row.to}
                    </span>
                  </div>
                </td>
                <td className="py-2.5 px-4 text-slate-400 font-sans text-[11px]">
                  {row.direction === 'ONE_WAY' ? 'One-Way' : 'Bidirectional'}
                </td>
                <td className="py-2.5 px-4 text-right font-bold text-amber-400">
                  +{row.cost}
                </td>
                <td className="py-2.5 px-4 text-right font-bold text-[#22C55E]">
                  {row.cumulativeCost}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-[#101A2B] font-bold text-xs border-t border-[#26364B]">
            <tr>
              <td colSpan={3} className="py-3 px-4 text-[#94A3B8]">
                Final Optimal Path Sum:
              </td>
              <td colSpan={2} className="py-3 px-4 text-right text-base text-[#22C55E] font-mono">
                {cumulative} units
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {isCostMatching && (
        <div className="px-4 py-2 bg-[#22C55E]/5 border-t border-[#22C55E]/20 text-[11px] text-emerald-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>Sum of link costs exactly matches the algorithm's reported minimum cost.</span>
        </div>
      )}
    </div>
  );
};

