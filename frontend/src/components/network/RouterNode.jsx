import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Radio, ShieldCheck, Flag, Sparkles } from 'lucide-react';

const RouterNodeComponent = ({ id, data, selected }) => {
  const isSource = id === 'S' || data?.type === 'source';
  const isDestination = id === 'D' || data?.type === 'destination';
  const isOnShortestPath = Boolean(data?.isOnShortestPath);
  const isAnyPathActive = Boolean(data?.isAnyPathActive);

  let nodeColorClass = 'border-[#3B82F6] bg-[#111C2F] text-[#3B82F6]';
  let badgeColorClass = 'bg-[#3B82F6]/20 text-[#38BDF8] border-[#3B82F6]/30';
  let badgeText = 'Router';
  let Icon = Radio;

  if (isSource) {
    nodeColorClass = 'border-[#22C55E] bg-[#111C2F] text-[#22C55E]';
    badgeColorClass = 'bg-[#22C55E]/20 text-emerald-300 border-[#22C55E]/30';
    badgeText = 'Source';
    Icon = ShieldCheck;
  } else if (isDestination) {
    nodeColorClass = 'border-[#F97316] bg-[#111C2F] text-[#F97316]';
    badgeColorClass = 'bg-[#F97316]/20 text-orange-300 border-[#F97316]/30';
    badgeText = 'Destination';
    Icon = Flag;
  }

  // Visual styling adjustments for shortest path
  let pathEffectClass = '';
  if (isOnShortestPath) {
    if (isSource) {
      pathEffectClass = 'ring-4 ring-[#22C55E]/60 shadow-[0_0_20px_rgba(34,197,94,0.4)] scale-105';
    } else if (isDestination) {
      pathEffectClass = 'ring-4 ring-[#F97316]/60 shadow-[0_0_20px_rgba(249,115,22,0.4)] scale-105';
    } else {
      pathEffectClass = 'ring-4 ring-[#38BDF8]/70 shadow-[0_0_20px_rgba(56,189,248,0.45)] border-[#38BDF8] scale-105';
    }
  } else if (isAnyPathActive) {
    pathEffectClass = 'opacity-40 grayscale-[25%] transition-opacity duration-300';
  }

  return (
    <div
      className={`relative rounded-xl border-2 px-4 py-3 min-w-[130px] transition-all duration-200 select-none shadow-lg ${nodeColorClass} ${pathEffectClass} ${
        selected ? 'ring-2 ring-[#38BDF8] ring-offset-2 ring-offset-[#0B1220] scale-105' : 'hover:scale-[1.02]'
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
        <div className="p-1.5 rounded-lg bg-[#19263A]/80 shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="font-bold text-sm tracking-wide text-[#F8FAFC] truncate">
              {data?.label || id}
            </span>
            {isOnShortestPath && (
              <Sparkles className="w-3.5 h-3.5 text-[#38BDF8] shrink-0 animate-pulse" />
            )}
          </div>
          <span
            className={`inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded border tracking-wide uppercase mt-0.5 ${badgeColorClass}`}
          >
            {badgeText}
          </span>
        </div>
      </div>
    </div>
  );
};

export const RouterNode = memo(RouterNodeComponent);
