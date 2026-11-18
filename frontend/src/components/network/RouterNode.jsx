import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Radio, ShieldCheck, Flag, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

const RouterNodeComponent = ({ id, data, selected }) => {
  const isSource = id === 'S' || data?.type === 'source';
  const isDestination = id === 'D' || data?.type === 'destination';

  // Simulation visual state: 'unvisited' | 'current' | 'visited' | 'unreachable' | 'shortestPath'
  const simState = data?.simState || (data?.isOnShortestPath ? 'shortestPath' : 'unvisited');
  const simDistance = data?.simDistance; // number, null (infinity), or undefined
  const visitOrder = data?.visitOrder;
  const isSimulationActive = Boolean(data?.isSimulationActive);

  // Base styling depending on endpoint vs intermediate router
  let baseColorClass = 'border-[#3B82F6] bg-[#111C2F] text-[#3B82F6]';
  let badgeColorClass = 'bg-[#3B82F6]/20 text-[#38BDF8] border-[#3B82F6]/30';
  let typeLabel = isSource ? 'Source' : isDestination ? 'Destination' : 'Router';
  let Icon = isSource ? ShieldCheck : isDestination ? Flag : Radio;

  if (isSource) {
    baseColorClass = 'border-[#22C55E] bg-[#111C2F] text-[#22C55E]';
    badgeColorClass = 'bg-[#22C55E]/20 text-emerald-300 border-[#22C55E]/30';
  } else if (isDestination) {
    baseColorClass = 'border-[#F97316] bg-[#111C2F] text-[#F97316]';
    badgeColorClass = 'bg-[#F97316]/20 text-orange-300 border-[#F97316]/30';
  }

  // Dynamic simulation state overrides
  let stateEffectClass = '';
  let statusBadge = null;

  if (isSimulationActive) {
    switch (simState) {
      case 'current': {
        stateEffectClass = 'ring-4 ring-[#38BDF8] shadow-[0_0_24px_rgba(56,189,248,0.7)] border-[#38BDF8] scale-110 z-20';
        statusBadge = (
          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-[#38BDF8] text-slate-950 uppercase animate-pulse">
            CURRENT
          </span>
        );
        break;
      }

      case 'visited': {
        // Purple appearance for finalized routers, preserving endpoint hues
        if (isSource) {
          stateEffectClass = 'border-[#22C55E] ring-2 ring-[#A855F7]/70 shadow-[0_0_12px_rgba(168,85,247,0.35)]';
        } else if (isDestination) {
          stateEffectClass = 'border-[#F97316] ring-2 ring-[#A855F7]/70 shadow-[0_0_12px_rgba(168,85,247,0.35)]';
        } else {
          stateEffectClass = 'border-[#A855F7] ring-2 ring-[#A855F7]/50 shadow-[0_0_12px_rgba(168,85,247,0.3)] text-[#C084FC]';
        }
        statusBadge = (
          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#A855F7]/25 text-[#E9D5FF] border border-[#A855F7]/40 flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5 text-[#C084FC]" />
            VISITED {visitOrder ? `#${visitOrder}` : ''}
          </span>
        );
        break;
      }

      case 'unreachable': {
        stateEffectClass = 'border-slate-700 bg-[#0B1220]/80 opacity-60 text-slate-500';
        statusBadge = (
          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-950/40 text-rose-400 border border-rose-900/40 flex items-center gap-1">
            <AlertCircle className="w-2.5 h-2.5" />
            UNREACHABLE
          </span>
        );
        break;
      }

      case 'shortestPath': {
        if (isSource) {
          stateEffectClass = 'border-[#22C55E] ring-4 ring-[#22C55E]/80 shadow-[0_0_24px_rgba(34,197,94,0.6)] scale-105';
        } else if (isDestination) {
          stateEffectClass = 'border-[#22C55E] ring-4 ring-[#22C55E]/80 shadow-[0_0_24px_rgba(34,197,94,0.6)] scale-105';
        } else {
          stateEffectClass = 'border-[#22C55E] ring-4 ring-[#22C55E]/80 shadow-[0_0_24px_rgba(34,197,94,0.6)] text-[#22C55E] scale-105';
        }
        statusBadge = (
          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-[#22C55E] text-slate-950 uppercase flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            ROUTE
          </span>
        );
        break;
      }

      default: {
        // unvisited
        stateEffectClass = 'hover:scale-[1.02]';
      }
    }
  } else if (data?.isOnShortestPath) {
    stateEffectClass = 'ring-4 ring-[#22C55E]/60 shadow-[0_0_20px_rgba(34,197,94,0.4)] scale-105 border-[#22C55E]';
    statusBadge = (
      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#22C55E]/20 text-emerald-300 border border-[#22C55E]/30 flex items-center gap-1">
        <Sparkles className="w-2.5 h-2.5" />
        PATH
      </span>
    );
  } else if (data?.isAnyPathActive) {
    stateEffectClass = 'opacity-40 grayscale-[25%] transition-opacity duration-300';
  }

  // Display distance text during simulation
  const distDisplay = simDistance !== undefined
    ? simDistance === null
      ? '∞'
      : simDistance
    : null;

  return (
    <div
      className={`relative rounded-xl border-2 px-3.5 py-2.5 min-w-[136px] transition-all duration-200 select-none shadow-lg ${baseColorClass} ${stateEffectClass} ${
        selected && !isSimulationActive
          ? 'ring-2 ring-[#38BDF8] ring-offset-2 ring-offset-[#0B1220] scale-105'
          : ''
      }`}
    >
      {/* Handles on 4 sides */}
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        className="!bg-[#38BDF8] !w-3 !h-3 !border-2 !border-[#0B1220]"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!bg-[#38BDF8] !w-3 !h-3 !border-2 !border-[#0B1220]"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!bg-[#38BDF8] !w-3 !h-3 !border-2 !border-[#0B1220]"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        className="!bg-[#38BDF8] !w-3 !h-3 !border-2 !border-[#0B1220]"
      />

      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-[#19263A]/90 shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="font-bold text-sm tracking-wide text-[#F8FAFC] truncate">
              {data?.label || id}
            </span>
            {distDisplay !== null && (
              <span
                className={`text-[11px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                  simState === 'current'
                    ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8]'
                    : simState === 'shortestPath'
                    ? 'bg-[#22C55E]/20 border-[#22C55E] text-[#22C55E]'
                    : 'bg-[#0B1220] border-[#24344D] text-[#94A3B8]'
                }`}
                title={`Current Tentative Distance: ${distDisplay}`}
              >
                d: {distDisplay}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            {statusBadge || (
              <span
                className={`inline-block text-[9px] font-semibold px-1.5 py-0.2 rounded border tracking-wide uppercase ${badgeColorClass}`}
              >
                {typeLabel}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const RouterNode = memo(RouterNodeComponent);
