import React from 'react';
import { Cpu, Terminal, Layers, Clock, Zap } from 'lucide-react';

export const AlgorithmInformation = ({
  sourceId = 'S',
  destinationId = 'D',
  totalRouters = 0,
  totalLinks = 0,
}) => {
  return (
    <div className="bg-[#142136] rounded-xl border border-[#26364B] p-4 select-none shadow-md space-y-4">
      <div className="flex items-center justify-between border-b border-[#26364B] pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#38BDF8]" />
          <h3 className="text-xs font-bold text-[#F1F5F9] uppercase tracking-wider">
            Algorithm Architecture & Complexity
          </h3>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#101A2B] text-[#38BDF8] border border-[#26364B]">
          Dijkstra (1959)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-[#0B1220] rounded-xl border border-[#26364B] space-y-2">
          <div className="text-[11px] font-bold text-[#38BDF8] flex items-center gap-1.5 uppercase">
            <Clock className="w-3.5 h-3.5" />
            Time Complexity: O((V + E) log V)
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Where <strong>V = {totalRouters}</strong> (vertices/routers) and <strong>E = {totalLinks}</strong> (communication links).
            Each vertex is extracted from the binary min-heap at most once: $\mathcal{O}(V \log V)$.
            Each edge relaxation inserts into the min-heap in $\mathcal{O}(\log V)$, totaling $\mathcal{O}(E \log V)$.
          </p>
        </div>

        <div className="p-3 bg-[#0B1220] rounded-xl border border-[#26364B] space-y-2">
          <div className="text-[11px] font-bold text-[#38BDF8] flex items-center gap-1.5 uppercase">
            <Layers className="w-3.5 h-3.5" />
            Space Complexity: O(V + E)
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            The adjacency list stores $V$ router lists with $2E$ directed edge entries.
            The distance map, predecessor map, and binary min-heap each require $\mathcal{O}(V)$ auxiliary memory space.
          </p>
        </div>
      </div>

      <div className="p-3 bg-[#101A2B] rounded-xl border border-[#26364B] space-y-2 text-xs">
        <div className="text-[11px] font-bold text-[#F1F5F9] flex items-center gap-1.5 uppercase">
          <Terminal className="w-3.5 h-3.5 text-[#22C55E]" />
          Why a Binary Min-Heap Priority Queue is Essential
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          Without a priority queue, searching for the unvisited node with minimal tentative distance requires a linear scan of $\mathcal{O}(V)$,
          resulting in an inefficient $\mathcal{O}(V^2)$ overall time.
          By structuring the frontier as a <strong>Binary Min-Heap</strong>, the minimum tentative distance node is extracted in $\mathcal{O}(\log V)$,
          guaranteeing optimal performance even for large-scale enterprise network meshes.
        </p>
      </div>
    </div>
  );
};

