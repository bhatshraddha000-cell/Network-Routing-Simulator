import React from 'react';
import { Activity, Sparkles, CheckCircle2 } from 'lucide-react';

export const SimulationLegend = () => {
  return (
    <div className="p-3 bg-[#0B1220]/80 rounded-xl border border-[#24344D]/80 space-y-2 select-none">
      <div className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
        Simulation State Legend
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2 text-[#F8FAFC]">
          <span className="w-3 h-3 rounded-full bg-[#3B82F6] shrink-0" />
          <span>Unvisited Router</span>
        </div>

        <div className="flex items-center gap-2 text-[#38BDF8] font-semibold">
          <span className="w-3 h-3 rounded-full bg-[#38BDF8] shrink-0 animate-pulse" />
          <span>Current Extracted</span>
        </div>

        <div className="flex items-center gap-2 text-[#C084FC]">
          <span className="w-3 h-3 rounded-full bg-[#A855F7] shrink-0" />
          <span>Visited / Finalized</span>
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <span className="w-3 h-3 rounded-full bg-slate-600 shrink-0" />
          <span>Unreachable</span>
        </div>

        <div className="flex items-center gap-2 text-[#FBBF24]">
          <span className="w-3 h-1.5 rounded-full bg-[#FBBF24] shrink-0" />
          <span>Examining Link</span>
        </div>

        <div className="flex items-center gap-2 text-[#22C55E] font-bold">
          <span className="w-3 h-1.5 rounded-full bg-[#22C55E] shrink-0" />
          <span>Shortest Path</span>
        </div>
      </div>
    </div>
  );
};

