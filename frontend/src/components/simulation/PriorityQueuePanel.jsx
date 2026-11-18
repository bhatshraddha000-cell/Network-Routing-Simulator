import React from 'react';
import { Layers, ArrowDownNarrowWide, Sparkles } from 'lucide-react';

export const PriorityQueuePanel = ({ priorityQueue = [] }) => {
  return (
    <div className="bg-[#111C2F] rounded-xl border border-[#24344D] overflow-hidden flex flex-col h-full select-none">
      <div className="p-3 border-b border-[#24344D] flex items-center justify-between bg-[#19263A]/40">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#38BDF8]" />
          <span className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
            Binary Min-Heap Priority Queue
          </span>
        </div>
        <span className="text-[10px] text-[#94A3B8] font-mono">
          {priorityQueue.length} {priorityQueue.length === 1 ? 'element' : 'elements'}
        </span>
      </div>

      <div className="p-3 flex-1 overflow-y-auto max-h-56 space-y-1.5">
        {priorityQueue.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#94A3B8]/60 space-y-1">
            <ArrowDownNarrowWide className="w-6 h-6 mx-auto text-slate-600 mb-1" />
            <div>Queue is Empty</div>
            <div className="text-[10px] text-slate-600">All reachable vertices have been extracted</div>
          </div>
        ) : (
          priorityQueue.map((item, idx) => {
            const isMin = idx === 0;

            return (
              <div
                key={`${item.nodeId}-${item.distance}-${idx}`}
                className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-mono transition-all ${
                  isMin
                    ? 'bg-[#38BDF8]/15 border-[#38BDF8] text-[#F8FAFC] shadow-sm shadow-sky-950/40 ring-1 ring-[#38BDF8]/40'
                    : 'bg-[#0B1220]/70 border-[#24344D] text-[#94A3B8]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-sans font-bold w-4">
                    #{idx + 1}
                  </span>
                  <span className={`font-bold ${isMin ? 'text-[#38BDF8]' : 'text-[#F8FAFC]'}`}>
                    {item.nodeId}
                  </span>
                  {isMin && (
                    <span className="text-[9px] font-sans font-extrabold px-1.5 py-0.2 rounded bg-[#38BDF8] text-slate-950 uppercase flex items-center gap-0.5">
                      <Sparkles className="w-2 h-2" />
                      Min (Next)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 font-bold">
                  <span className="text-[10px] text-slate-500 font-sans">dist:</span>
                  <span className={isMin ? 'text-[#38BDF8]' : 'text-[#F8FAFC]'}>
                    {item.distance}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

