import React, { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
} from '@xyflow/react';
import { ArrowRight, ArrowRightLeft, Sparkles, Activity } from 'lucide-react';

const NetworkEdgeComponent = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
  markerStart,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const weight = data?.weight ?? 1;
  const direction = data?.direction || 'BIDIRECTIONAL';
  const simEdgeState = data?.simEdgeState; // 'examining' | 'relaxed' | 'unrelaxed' | 'shortestPath' | 'normal'
  const isSimulationActive = Boolean(data?.isSimulationActive);

  let strokeColor = '#64748B';
  let strokeWidth = 2;
  let opacity = 1;
  let filter = 'none';
  let badgeStyle = 'bg-[#111C2F] border-[#24344D] text-[#F8FAFC]';
  let BadgeIcon = null;

  if (isSimulationActive && simEdgeState) {
    switch (simEdgeState) {
      case 'examining': {
        strokeColor = '#FBBF24'; // Yellow
        strokeWidth = 4.5;
        filter = 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))';
        badgeStyle = 'bg-[#19263A] border-[#FBBF24] text-[#FBBF24] ring-2 ring-[#FBBF24]/50 scale-110 shadow-[0_0_12px_rgba(251,191,36,0.6)] animate-pulse';
        BadgeIcon = Activity;
        break;
      }

      case 'relaxed': {
        strokeColor = '#38BDF8'; // Cyan
        strokeWidth = 4.5;
        filter = 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.8))';
        badgeStyle = 'bg-[#111C2F] border-[#38BDF8] text-[#38BDF8] ring-2 ring-[#38BDF8]/60 scale-115 shadow-[0_0_12px_rgba(56,189,248,0.6)]';
        BadgeIcon = Sparkles;
        break;
      }

      case 'unrelaxed': {
        strokeColor = '#94A3B8';
        strokeWidth = 2.5;
        badgeStyle = 'bg-[#111C2F] border-slate-600 text-slate-300';
        break;
      }

      case 'shortestPath': {
        strokeColor = '#22C55E'; // Green
        strokeWidth = 5;
        filter = 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.9))';
        badgeStyle = 'bg-[#111C2F] border-[#22C55E] text-[#22C55E] ring-2 ring-[#22C55E]/60 scale-115 shadow-[0_0_14px_rgba(34,197,94,0.7)]';
        BadgeIcon = Sparkles;
        break;
      }

      default: {
        // normal during simulation
        strokeColor = '#334155';
        strokeWidth = 1.5;
        opacity = 0.35;
        badgeStyle = 'bg-[#0B1220]/80 border-[#24344D]/50 text-[#64748B] opacity-40';
      }
    }
  } else if (data?.isOnShortestPath) {
    strokeColor = '#22C55E';
    strokeWidth = 4.5;
    filter = 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.7))';
    badgeStyle = 'bg-[#111C2F] border-[#22C55E] text-[#22C55E] ring-2 ring-[#22C55E]/50 scale-110 shadow-[0_0_12px_rgba(34,197,94,0.5)]';
    BadgeIcon = Sparkles;
  } else if (data?.isAnyPathActive) {
    strokeColor = '#334155';
    strokeWidth = 1.5;
    opacity = 0.35;
    badgeStyle = 'bg-[#0B1220]/75 border-[#24344D]/50 text-[#64748B] opacity-50';
  } else if (selected) {
    strokeColor = '#38BDF8';
    strokeWidth = 3.5;
    badgeStyle = 'bg-[#19263A] border-[#38BDF8] text-[#38BDF8] ring-2 ring-[#38BDF8]/40 scale-105';
  }

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={{
          stroke: strokeColor,
          strokeWidth,
          opacity,
          filter,
          transition: 'stroke 0.2s ease, stroke-width 0.2s ease, opacity 0.2s ease',
          cursor: isSimulationActive ? 'default' : 'pointer',
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: isSimulationActive ? 'none' : 'all',
          }}
          className="nodrag nopan"
        >
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold transition-all duration-200 border shadow-md ${badgeStyle}`}
            title={`Cost: ${weight} | Mode: ${direction === 'ONE_WAY' ? 'One-Way' : 'Bidirectional'}`}
          >
            {direction === 'ONE_WAY' ? (
              <ArrowRight className="w-3 h-3 shrink-0" />
            ) : (
              <ArrowRightLeft className="w-3 h-3 shrink-0" />
            )}
            <span>{weight}</span>
            {BadgeIcon && <BadgeIcon className="w-2.5 h-2.5" />}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export const NetworkEdge = memo(NetworkEdgeComponent);
