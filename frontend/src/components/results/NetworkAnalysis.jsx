import React from 'react';
import {
  Network,
  ArrowRightLeft,
  ArrowRight,
  ShieldCheck,
  Flag,
  Share2,
  Info,
} from 'lucide-react';

export const NetworkAnalysis = ({
  nodes = [],
  edges = [],
  distanceTable = [],
  sourceId = 'S',
  destinationId = 'D',
}) => {
  const totalRouters = nodes.length;
  const totalLinks = edges.length;

  const bidirectionalCount = edges.filter(
    (e) => (e.direction || 'BIDIRECTIONAL') === 'BIDIRECTIONAL'
  ).length;
  const oneWayCount = edges.filter((e) => e.direction === 'ONE_WAY').length;

  const reachableCount = distanceTable.filter(
    (r) => r.status === 'VISITED' && r.distance !== null
  ).length;
  const unreachableCount = totalRouters - reachableCount;

  // Source outgoing links (where source is either sourceId, or bidirectional connecting to sourceId)
  const sourceOutgoing = edges.filter(
    (e) => e.source === sourceId || ((e.direction || 'BIDIRECTIONAL') === 'BIDIRECTIONAL' && e.target === sourceId)
  ).length;

  // Destination incoming links (where target is destinationId, or bidirectional connecting to destinationId)
  const destIncoming = edges.filter(
    (e) => e.target === destinationId || ((e.direction || 'BIDIRECTIONAL') === 'BIDIRECTIONAL' && e.source === destinationId)
  ).length;

  return (
    <div className="bg-[#142136] rounded-xl border border-[#26364B] p-4 select-none shadow-md space-y-4">
      <div className="flex items-center justify-between border-b border-[#26364B] pb-3">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-[#38BDF8]" />
          <h3 className="text-xs font-bold text-[#F1F5F9] uppercase tracking-wider">
            Network Connectivity & Topology Analysis
          </h3>
        </div>
        <span className="text-[11px] font-mono text-[#38BDF8]">
          Graph Density: {(totalLinks / Math.max(1, (totalRouters * (totalRouters - 1)) / 2)).toFixed(2)}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-[#0B1220] rounded-xl border border-[#26364B]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Total Topology</span>
            <Network className="w-3.5 h-3.5 text-[#38BDF8]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#F1F5F9] mt-1">
            {totalRouters} <span className="text-xs font-sans text-slate-500 font-normal">nodes</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{totalLinks} communication links</div>
        </div>

        <div className="p-3 bg-[#0B1220] rounded-xl border border-[#26364B]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Link Directions</span>
            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-[#F1F5F9] mt-1">
            {bidirectionalCount} <span className="text-xs font-sans text-slate-500 font-normal">2-way</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{oneWayCount} one-way links</div>
        </div>

        <div className="p-3 bg-[#0B1220] rounded-xl border border-[#26364B]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Reachable Vertices</span>
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {reachableCount} <span className="text-xs font-sans text-slate-500 font-normal">/ {totalRouters}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{unreachableCount} unreachable</div>
        </div>

        <div className="p-3 bg-[#0B1220] rounded-xl border border-[#26364B]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Endpoints Degree</span>
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <Flag className="w-3 h-3 text-orange-400" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-[#F1F5F9] mt-1">
            {sourceOutgoing} <span className="text-xs font-sans text-slate-500 font-normal">out (S)</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{destIncoming} incoming (D)</div>
        </div>
      </div>

      <div className="px-3.5 py-2.5 rounded-lg bg-[#101A2B] border border-[#26364B] text-[11px] text-[#94A3B8] flex items-start gap-2">
        <Info className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
        <span>
          Reachability is measured strictly from Source router ({sourceId}) respecting all one-way and bidirectional link orientations.
          All communication weights represent abstract network cost metrics (transmission latency or administrative distance).
        </span>
      </div>
    </div>
  );
};

