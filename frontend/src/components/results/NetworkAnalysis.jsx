import React from 'react';
import {
  Network,
  ArrowRightLeft,
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
  const nodeList = Array.isArray(nodes) ? nodes : [];
  const edgeList = Array.isArray(edges) ? edges : [];
  const table = Array.isArray(distanceTable) ? distanceTable : [];

  const totalRouters = nodeList.length;
  const totalLinks = edgeList.length;

  const bidirectionalCount = edgeList.filter((e) => {
    const dir = e?.data?.direction || e?.direction || 'BIDIRECTIONAL';
    return dir === 'BIDIRECTIONAL';
  }).length;

  const oneWayCount = edgeList.filter((e) => {
    const dir = e?.data?.direction || e?.direction;
    return dir === 'ONE_WAY';
  }).length;

  const reachableCount = table.filter(
    (r) => r && r.status === 'VISITED' && r.distance !== null && r.distance !== undefined
  ).length;
  const unreachableCount = Math.max(0, totalRouters - reachableCount);

  // Source outgoing links (where source is sourceId, or bidirectional connecting to sourceId)
  const sourceOutgoing = edgeList.filter((e) => {
    const dir = e?.data?.direction || e?.direction || 'BIDIRECTIONAL';
    return e.source === sourceId || (dir === 'BIDIRECTIONAL' && e.target === sourceId);
  }).length;

  // Destination incoming links (where target is destinationId, or bidirectional connecting to destinationId)
  const destIncoming = edgeList.filter((e) => {
    const dir = e?.data?.direction || e?.direction || 'BIDIRECTIONAL';
    return e.target === destinationId || (dir === 'BIDIRECTIONAL' && e.source === destinationId);
  }).length;

  const maxPossibleLinks = totalRouters > 1 ? (totalRouters * (totalRouters - 1)) / 2 : 1;
  const density = totalRouters > 1 ? (totalLinks / maxPossibleLinks).toFixed(2) : '0.00';

  return (
    <div className="bg-[#142136] rounded-xl border border-[#26364B] p-5 select-none shadow-md space-y-4">
      <div className="flex items-center justify-between border-b border-[#26364B] pb-3">
        <div className="flex items-center gap-2.5">
          <Network className="w-5 h-5 text-[#38BDF8]" />
          <h3 className="text-base font-bold text-[#F1F5F9] uppercase tracking-wider">
            Network Connectivity & Topology Analysis
          </h3>
        </div>
        <span className="text-xs font-mono font-semibold text-[#38BDF8] bg-[#38BDF8]/10 px-2.5 py-1 rounded border border-[#38BDF8]/20">
          Graph Density: {density}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-3.5 bg-[#0B1220] rounded-xl border border-[#26364B]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Topology</span>
            <Network className="w-4 h-4 text-[#38BDF8]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#F1F5F9] mt-1.5">
            {totalRouters} <span className="text-xs font-sans text-slate-500 font-normal">nodes</span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">{totalLinks} communication links</div>
        </div>

        <div className="p-3.5 bg-[#0B1220] rounded-xl border border-[#26364B]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Link Directions</span>
            <ArrowRightLeft className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#F1F5F9] mt-1.5">
            {bidirectionalCount} <span className="text-xs font-sans text-slate-500 font-normal">2-way</span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">{oneWayCount} one-way links</div>
        </div>

        <div className="p-3.5 bg-[#0B1220] rounded-xl border border-[#26364B]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Reachable Vertices</span>
            <Share2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1.5">
            {reachableCount} <span className="text-xs font-sans text-slate-500 font-normal">/ {totalRouters}</span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">{unreachableCount} unreachable</div>
        </div>

        <div className="p-3.5 bg-[#0B1220] rounded-xl border border-[#26364B]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Endpoints Degree</span>
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <Flag className="w-3.5 h-3.5 text-orange-400" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#F1F5F9] mt-1.5">
            {sourceOutgoing} <span className="text-xs font-sans text-slate-500 font-normal">out (S)</span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">{destIncoming} incoming (D)</div>
        </div>
      </div>

      <div className="px-4 py-3 rounded-lg bg-[#101A2B] border border-[#26364B] text-xs text-[#94A3B8] flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          Reachability is measured strictly from Source router ({sourceId}) respecting all one-way and bidirectional link orientations.
          All communication weights represent positive communication costs (latency or administrative distance).
        </span>
      </div>
    </div>
  );
};
