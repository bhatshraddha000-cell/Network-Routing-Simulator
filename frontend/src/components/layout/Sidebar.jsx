import React from 'react';
import {
  Network,
  PlusCircle,
  FolderOpen,
  Trash2,
  Radio,
  ShieldCheck,
  Flag,
  Layers,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { NetworkLegend } from '../network/NetworkLegend';

export const Sidebar = ({
  nodes,
  selectedNodeId,
  onSelectNode,
  onAddRouter,
  onLoadExample,
  onClearNetwork,
  onDeleteNode,
  onCalculateDijkstra,
  isCalculating,
}) => {
  const routerCount = nodes.length;
  const isLimitReached = routerCount >= 50;

  return (
    <aside className="w-72 bg-[#111C2F] border-r border-[#24344D] flex flex-col h-full z-10 select-none overflow-y-auto">
      {/* Brand & Logo */}
      <div className="p-4 border-b border-[#24344D] flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-[#38BDF8]/20 to-[#3B82F6]/20 border border-[#38BDF8]/30 text-[#38BDF8] shadow-md shadow-sky-950/30">
          <Network className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-base font-bold text-[#F8FAFC] tracking-tight">NetRoute</h1>
          <p className="text-[11px] text-[#94A3B8] font-medium">Network Routing Simulator</p>
        </div>
      </div>

      <div className="p-4 space-y-5 flex-1">
        {/* Dijkstra Primary Execution Box */}
        <div className="p-3 bg-[#19263A] rounded-xl border border-[#38BDF8]/30 space-y-2.5 shadow-lg shadow-sky-950/20">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#F8FAFC] flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#38BDF8] fill-current" />
              Routing Simulation
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">Dijkstra</span>
          </div>

          <button
            type="button"
            onClick={onCalculateDijkstra}
            disabled={isCalculating}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all shadow-md active:scale-[0.98] ${
              isCalculating
                ? 'bg-sky-800 text-sky-200 cursor-wait'
                : 'bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-slate-950 shadow-sky-500/20'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            {isCalculating ? 'Computing Paths...' : 'Calculate Shortest Path'}
          </button>
        </div>

        {/* Network Topology Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#38BDF8]" />
              Topology Controls
            </span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#19263A] text-[#38BDF8] border border-[#24344D]">
              {routerCount}/50 Routers
            </span>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={onAddRouter}
              disabled={isLimitReached}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold shadow-md transition-all ${
                isLimitReached
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-[#19263A] hover:bg-[#24344D] text-[#F8FAFC] border border-[#24344D] active:scale-[0.98]'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-[#38BDF8]" />
              Add Router (Hop)
            </button>

            {isLimitReached && (
              <p className="text-[11px] text-amber-400 text-center font-medium">
                Maximum network capacity reached (50 routers).
              </p>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={onLoadExample}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-[#19263A] hover:bg-[#24344D] text-[#F8FAFC] border border-[#24344D] text-xs font-medium transition-colors"
                title="Load sample editable network"
              >
                <FolderOpen className="w-3.5 h-3.5 text-[#38BDF8]" />
                Load Example
              </button>

              <button
                type="button"
                onClick={onClearNetwork}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-[#19263A] hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 border border-[#24344D] hover:border-rose-800/60 text-xs font-medium transition-colors"
                title="Reset network to starting endpoints only"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                Clear Network
              </button>
            </div>
          </div>
        </div>

        {/* Router List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#38BDF8]" />
              Active Routers
            </span>
            <span className="text-[10px] text-[#94A3B8] font-mono">
              {nodes.length} nodes
            </span>
          </div>

          <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isSource = node.id === 'S';
              const isDest = node.id === 'D';

              return (
                <div
                  key={node.id}
                  onClick={() => onSelectNode(node.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#19263A] border-[#38BDF8] text-[#38BDF8] font-semibold'
                      : 'bg-[#0B1220]/60 border-[#24344D] text-[#F8FAFC] hover:border-[#38BDF8]/50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isSource ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                    ) : isDest ? (
                      <Flag className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
                    ) : (
                      <Radio className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
                    )}
                    <span className="truncate">{node.data?.label || node.id}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isSource ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#22C55E]/15 text-[#22C55E]">
                        SRC
                      </span>
                    ) : isDest ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#F97316]/15 text-[#F97316]">
                        DST
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNode(node.id);
                        }}
                        className="text-[#94A3B8] hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 transition-colors"
                        title="Delete router"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                    <ChevronRight className={`w-3 h-3 text-[#94A3B8] ${isSelected ? 'text-[#38BDF8]' : ''}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <NetworkLegend />
      </div>
    </aside>
  );
};
