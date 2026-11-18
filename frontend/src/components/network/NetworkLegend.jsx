import React from 'react';
import { ArrowRight, ArrowRightLeft, Sparkles } from 'lucide-react';

export const NetworkLegend = () => {
  return (
    <div className="p-3.5 bg-[#0B1220]/70 rounded-xl border border-[#24344D]/80 space-y-2.5">
      <div className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
        Topology Legend
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2 text-[#F8FAFC]">
          <span className="w-3 h-3 rounded-full bg-[#22C55E] shrink-0 shadow-sm shadow-emerald-500/50" />
          <span className="font-medium">Source Router (S)</span>
          <span className="text-[10px] text-[#94A3B8] ml-auto">Start</span>
        </div>

        <div className="flex items-center gap-2 text-[#F8FAFC]">
          <span className="w-3 h-3 rounded-full bg-[#F97316] shrink-0 shadow-sm shadow-orange-500/50" />
          <span className="font-medium">Destination Router (D)</span>
          <span className="text-[10px] text-[#94A3B8] ml-auto">Target</span>
        </div>

        <div className="flex items-center gap-2 text-[#F8FAFC]">
          <span className="w-3 h-3 rounded-full bg-[#3B82F6] shrink-0 shadow-sm shadow-blue-500/50" />
          <span className="font-medium">Intermediate Router (R#)</span>
          <span className="text-[10px] text-[#94A3B8] ml-auto">Hop</span>
        </div>

        <div className="flex items-center gap-2 text-[#F8FAFC]">
          <span className="w-3 h-3 rounded-full bg-[#38BDF8] shrink-0 shadow-sm shadow-sky-500/50 animate-pulse" />
          <span className="font-medium text-[#38BDF8]">Shortest Path Route</span>
          <Sparkles className="w-3 h-3 text-[#38BDF8] ml-auto" />
        </div>

        <div className="pt-2 border-t border-[#19263A] space-y-1.5">
          <div className="flex items-center gap-2 text-[#94A3B8]">
            <ArrowRightLeft className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Bidirectional (Both Ways)</span>
          </div>
          <div className="flex items-center gap-2 text-[#94A3B8]">
            <ArrowRight className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>One-Way Directed Link</span>
          </div>
        </div>
      </div>
    </div>
  );
};
