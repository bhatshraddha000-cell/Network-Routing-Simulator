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
  Play,
  Lock,
  PanelLeftClose,
} from 'lucide-react';
import { NetworkLegend } from '../network/NetworkLegend';
import { SimulationLegend } from '../simulation/SimulationLegend';

export const Sidebar = ({
  nodes,
  selectedNodeId,
  onSelectNode,
  onAddRouter,
  onLoadExample,
  onClearNetwork,
  onDeleteNode,
  onCalculateDijkstra,
  onStartSimulation,
  isCalculating,
  isSimulating,
  onCollapse,
  className = '',
  style = {},
}) => {
  const routerCount = nodes.length;
  const isLimitReached = routerCount >= 50;

  return (
    <aside
      style={style}
      className={`w-full bg-[#111C2F] flex flex-col h-full select-none overflow-y-auto ${className}`}
    >
      {/* Brand & Logo + Collapse Button */}
      <div className="p-4 border-b border-[#24344D] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-gradient-to-br from-[#38BDF8]/20 to-[#3B82F6]/20 border border-[#38BDF8]/30 text-[#38BDF8] shadow-md shadow-sky-950/30 shrink-0">
            <Network className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-[#F8FAFC] tracking-tight truncate">NetRoute</h1>
            <p className="text-xs text-[#94A3B8] font-medium truncate">
              {isSimulating ? 'Simulation Mode' : 'Routing Simulator'}
            </p>
          </div>
        </div>

        {onCollapse && (
          <button
            type="button"
            onClick={onCollapse}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#38BDF8] hover:bg-[#19263A] border border-transparent hover:border-[#24344D] transition-colors cursor-pointer shrink-0"
            title="Collapse sidebar (Ctrl+B)"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-5 flex-1">
        {/* Dijkstra Primary Execution Box */}
        <div className="p-3.5 bg-[#19263A] rounded-xl border border-[#38BDF8]/30 space-y-3 shadow-lg shadow-sky-950/20">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-[#F8FAFC] flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#38BDF8] fill-current" />
              Routing Simulation
            </span>
            <span className="text-xs text-emerald-400 font-mono font-bold">Dijkstra</span>
          </div>

          <button
            type="button"
            onClick={onStartSimulation}
            disabled={isCalculating || isSimulating}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
              isSimulating
                ? 'bg-sky-950/50 text-[#38BDF8] border border-[#38BDF8]/40 cursor-default'
                : isCalculating
                ? 'bg-sky-800 text-sky-200 cursor-wait'
                : 'bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-slate-950 shadow-sky-500/20'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>
              {isSimulating
                ? 'Simulation Running...'
                : isCalculating
                ? 'Preparing Simulation...'
                : 'Run Simulation'}
            </span>
          </button>
        </div>

        {/* Network Topology Controls (locked during simulation) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#38BDF8]" />
              Topology Controls
            </span>
            {isSimulating ? (
              <span className="text-xs font-mono text-amber-400 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Locked
              </span>
            ) : (
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-[#19263A] text-[#38BDF8] border border-[#24344D]">
                {routerCount}/50
              </span>
            )}
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={onAddRouter}
              disabled={isLimitReached || isSimulating}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold shadow-md transition-all cursor-pointer ${
                isSimulating || isLimitReached
                  ? 'bg-slate-800/60 text-slate-500 cursor-not-allowed border border-slate-700/50'
                  : 'bg-[#19263A] hover:bg-[#24344D] text-[#F8FAFC] border border-[#24344D] active:scale-95'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-[#38BDF8]" />
              <span>Add Router (Hop)</span>
            </button>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={onLoadExample}
                disabled={isSimulating}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                  isSimulating
                    ? 'bg-slate-800/40 text-slate-500 border-slate-800 cursor-not-allowed'
                    : 'bg-[#19263A] hover:bg-[#24344D] text-[#F8FAFC] border-[#24344D]'
                }`}
                title="Load sample editable network"
              >
                <FolderOpen className="w-4 h-4 text-[#38BDF8]" />
                <span>Example</span>
              </button>

              <button
                type="button"
                onClick={onClearNetwork}
                disabled={isSimulating}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                  isSimulating
                    ? 'bg-slate-800/40 text-slate-500 border-slate-800 cursor-not-allowed'
                    : 'bg-[#19263A] hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 border-[#24344D]'
                }`}
                title="Reset network to starting endpoints only"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>

        {/* Router List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-[#38BDF8]" />
              Active Routers
            </span>
            <span className="text-xs text-[#94A3B8] font-mono font-medium">
              {nodes.length} nodes
            </span>
          </div>

          <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isSource = node.id === 'S';
              const isDest = node.id === 'D';

              return (
                <div
                  key={node.id}
                  onClick={() => !isSimulating && onSelectNode(node.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-all ${
                    isSimulating
                      ? 'bg-[#0B1220]/40 border-[#24344D]/50 text-slate-400 cursor-default'
                      : isSelected
                      ? 'bg-[#19263A] border-[#38BDF8] text-[#38BDF8] font-semibold cursor-pointer'
                      : 'bg-[#0B1220]/60 border-[#24344D] text-[#F8FAFC] hover:border-[#38BDF8]/50 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isSource ? (
                      <ShieldCheck className="w-4 h-4 text-[#22C55E] shrink-0" />
                    ) : isDest ? (
                      <Flag className="w-4 h-4 text-[#F97316] shrink-0" />
                    ) : (
                      <Radio className="w-4 h-4 text-[#3B82F6] shrink-0" />
                    )}
                    <span className="truncate">{node.data?.label || node.id}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isSource ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#22C55E]/15 text-[#22C55E]">
                        SRC
                      </span>
                    ) : isDest ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F97316]/15 text-[#F97316]">
                        DST
                      </span>
                    ) : !isSimulating ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNode(node.id);
                        }}
                        className="text-[#94A3B8] hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 transition-colors"
                        title="Delete router"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : null}
                    {!isSimulating && (
                      <ChevronRight className={`w-3.5 h-3.5 text-[#94A3B8] ${isSelected ? 'text-[#38BDF8]' : ''}`} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        {isSimulating ? <SimulationLegend /> : <NetworkLegend />}
      </div>
    </aside>
  );
};
