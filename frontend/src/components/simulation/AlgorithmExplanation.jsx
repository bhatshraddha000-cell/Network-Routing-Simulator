import React from 'react';
import { HelpCircle, Calculator, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

export const AlgorithmExplanation = ({ snapshot }) => {
  if (!snapshot) {
    return (
      <div className="bg-[#111C2F] rounded-xl border border-[#24344D] p-4 text-xs text-[#94A3B8] text-center select-none">
        Simulation waiting to start. Click "Play" or "Next" to begin.
      </div>
    );
  }

  const { operation, explanation, mathBreakdown, eventType, activeNodeId, activeNeighborId } = snapshot;

  return (
    <div className="bg-[#111C2F] rounded-xl border border-[#24344D] p-4 select-none space-y-3 shadow-lg">
      <div className="flex items-center justify-between border-b border-[#24344D] pb-2">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#38BDF8]" />
          <h4 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
            Step Explanation
          </h4>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#19263A] text-[#38BDF8] border border-[#24344D]">
          {eventType}
        </span>
      </div>

      <div>
        <div className="text-sm font-bold text-[#F8FAFC]">{operation}</div>
        <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
          {explanation}
        </p>
      </div>

      {/* Dynamic Mathematical Breakdown */}
      {mathBreakdown && (
        <div className="p-3 bg-[#0B1220] rounded-lg border border-[#24344D] space-y-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-[#38BDF8] font-bold text-[11px] font-sans">
            <Calculator className="w-3.5 h-3.5" />
            Edge Relaxation Calculation
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-500">Current dist[{activeNodeId}]: </span>
              <span className="text-[#F8FAFC] font-bold">{mathBreakdown.currentDistance}</span>
            </div>
            <div>
              <span className="text-slate-500">Link weight: </span>
              <span className="text-amber-400 font-bold">{mathBreakdown.edgeWeight}</span>
            </div>
            <div className="col-span-2 pt-1 border-t border-[#19263A]">
              <span className="text-slate-500">Candidate distance: </span>
              <span className="text-[#F8FAFC]">
                {mathBreakdown.currentDistance} + {mathBreakdown.edgeWeight} ={' '}
                <strong className="text-[#38BDF8]">{mathBreakdown.candidateDistance}</strong>
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500">Previous dist[{activeNeighborId}]: </span>
              <span className="text-[#F8FAFC] font-bold">{mathBreakdown.previousDistance}</span>
            </div>
          </div>

          {/* Verdict */}
          <div className="pt-1.5 border-t border-[#19263A] flex items-center gap-1.5 text-[11px] font-sans font-semibold">
            {mathBreakdown.candidateDistance < (parseFloat(mathBreakdown.previousDistance) || Infinity) ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {mathBreakdown.candidateDistance} &lt; {mathBreakdown.previousDistance} → Distance Updated
              </span>
            ) : (
              <span className="text-slate-400 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" />
                {mathBreakdown.candidateDistance} &ge; {mathBreakdown.previousDistance} → Distance Retained
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

