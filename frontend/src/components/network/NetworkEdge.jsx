import React, { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
} from '@xyflow/react';
import { ArrowRight, ArrowRightLeft, Sparkles } from 'lucide-react';

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
  const isOnShortestPath = Boolean(data?.isOnShortestPath);
  const isAnyPathActive = Boolean(data?.isAnyPathActive);

  let strokeColor = '#64748B';
  let strokeWidth = 2;
  let opacity = 1;
  let filter = 'none';

  if (isOnShortestPath) {
    strokeColor = '#38BDF8';
    strokeWidth = 4.5;
    opacity = 1;
    filter = 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.7))';
  } else if (isAnyPathActive) {
    strokeColor = '#334155';
    strokeWidth = 1.5;
    opacity = 0.35;
  } else if (selected) {
    strokeColor = '#38BDF8';
    strokeWidth = 3.5;
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
          transition: 'stroke 0.25s ease, stroke-width 0.25s ease, opacity 0.25s ease',
          cursor: 'pointer',
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold cursor-pointer transition-all duration-200 border shadow-md ${
              isOnShortestPath
                ? 'bg-[#111C2F] border-[#38BDF8] text-[#38BDF8] ring-2 ring-[#38BDF8]/50 scale-110 shadow-[0_0_12px_rgba(56,189,248,0.5)]'
                : selected
                ? 'bg-[#19263A] border-[#38BDF8] text-[#38BDF8] ring-2 ring-[#38BDF8]/40 scale-105'
                : isAnyPathActive
                ? 'bg-[#0B1220]/75 border-[#24344D]/50 text-[#64748B] opacity-50'
                : 'bg-[#111C2F] border-[#24344D] text-[#F8FAFC] hover:border-[#38BDF8] hover:text-[#38BDF8]'
            }`}
            title={`Cost: ${weight} | Mode: ${direction === 'ONE_WAY' ? 'One-Way' : 'Bidirectional'}${
              isOnShortestPath ? ' (Shortest Route)' : ''
            }`}
          >
            {direction === 'ONE_WAY' ? (
              <ArrowRight
                className={`w-3 h-3 shrink-0 ${isOnShortestPath ? 'text-[#38BDF8]' : 'text-[#38BDF8]'}`}
              />
            ) : (
              <ArrowRightLeft
                className={`w-3 h-3 shrink-0 ${isOnShortestPath ? 'text-[#38BDF8]' : 'text-[#94A3B8]'}`}
              />
            )}
            <span>{weight}</span>
            {isOnShortestPath && <Sparkles className="w-2.5 h-2.5 text-[#38BDF8]" />}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export const NetworkEdge = memo(NetworkEdgeComponent);
