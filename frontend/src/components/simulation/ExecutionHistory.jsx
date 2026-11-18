import React, { useEffect, useRef } from 'react';
import { History, ChevronRight, Check } from 'lucide-react';

export const ExecutionHistory = ({
  snapshots = [],
  currentStepIndex = 0,
  onSelectStep,
}) => {
  const activeItemRef = useRef(null);

  // Auto-scroll active event into view
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentStepIndex]);

  return (
    <div className="bg-[#111C2F] rounded-xl border border-[#24344D] overflow-hidden flex flex-col h-full select-none">
      <div className="p-3 border-b border-[#24344D] flex items-center justify-between bg-[#19263A]/40">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#38BDF8]" />
          <span className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
            Execution Timeline
          </span>
        </div>
        <span className="text-[10px] text-[#94A3B8] font-mono">
          {snapshots.length} Events
        </span>
      </div>

      <div className="p-2 flex-1 overflow-y-auto max-h-56 space-y-1">
        {snapshots.map((snap, idx) => {
          const isActive = idx === currentStepIndex;
          const isPast = idx < currentStepIndex;

          return (
            <div
              key={snap.sequence || idx}
              ref={isActive ? activeItemRef : null}
              onClick={() => onSelectStep(idx)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                isActive
                  ? 'bg-[#38BDF8]/20 border border-[#38BDF8] text-[#F8FAFC] font-semibold ring-1 ring-[#38BDF8]/40 shadow-sm'
                  : isPast
                  ? 'bg-[#19263A]/40 text-[#94A3B8] hover:bg-[#19263A] hover:text-[#F8FAFC]'
                  : 'text-slate-600 hover:bg-[#19263A]/20'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span className="font-mono text-[10px] text-slate-500 w-5 shrink-0">
                  #{idx + 1}
                </span>
                <span className="truncate">{snap.operation}</span>
              </div>

              <div className="shrink-0 flex items-center gap-1">
                {isPast && <Check className="w-3 h-3 text-emerald-400" />}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#38BDF8] animate-pulse" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

