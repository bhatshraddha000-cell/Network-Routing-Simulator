import React from 'react';
import { Save, RefreshCw, CheckCircle2, Maximize2, Zap, RotateCcw } from 'lucide-react';

export const Navbar = ({
  hasUnsavedChanges,
  isSaving,
  isCalculating,
  onSave,
  onReload,
  onFitView,
  onCalculateDijkstra,
  hasAlgorithmResult,
  onResetAlgorithmResult,
}) => {
  return (
    <header className="h-14 bg-[#111C2F] border-b border-[#24344D] px-6 flex items-center justify-between z-20 select-none">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#F8FAFC]">
            NetRoute – Network Simulator
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#19263A] text-[#38BDF8] border border-[#24344D] font-mono">
            Module 2: Dijkstra Engine
          </span>
        </div>

        {/* Unsaved changes indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[#0B1220] border border-[#24344D]">
          {hasUnsavedChanges ? (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <span className="text-amber-300">Unsaved Changes</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-emerald-300">Synchronized</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Calculate Shortest Path Primary Action Button */}
        <button
          type="button"
          onClick={onCalculateDijkstra}
          disabled={isCalculating}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-[0.98] ${
            isCalculating
              ? 'bg-sky-800 text-sky-200 cursor-wait'
              : 'bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-slate-950 shadow-sky-500/20'
          }`}
          title="Run Dijkstra's algorithm from Source S to Destination D"
        >
          {isCalculating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 fill-current" />
              Calculate Shortest Path
            </>
          )}
        </button>

        {hasAlgorithmResult && (
          <button
            type="button"
            onClick={onResetAlgorithmResult}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#19263A] hover:bg-[#24344D] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#24344D] text-xs font-medium transition-colors"
            title="Clear algorithm highlighting and results"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Result
          </button>
        )}

        <button
          type="button"
          onClick={onFitView}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#19263A] hover:bg-[#24344D] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#24344D] text-xs font-medium transition-colors"
          title="Fit network view to screen"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          Fit View
        </button>

        <button
          type="button"
          onClick={onReload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#19263A] hover:bg-[#24344D] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#24344D] text-xs font-medium transition-colors"
          title="Reload topology from server"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reload
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || !hasUnsavedChanges}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${
            hasUnsavedChanges
              ? 'bg-[#19263A] hover:bg-[#24344D] text-[#38BDF8] border border-[#38BDF8]/40 active:scale-[0.98]'
              : 'bg-[#19263A] text-[#94A3B8] border border-[#24344D] cursor-default'
          }`}
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Saving...
            </>
          ) : hasUnsavedChanges ? (
            <>
              <Save className="w-3.5 h-3.5" />
              Save
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Saved
            </>
          )}
        </button>
      </div>
    </header>
  );
};
