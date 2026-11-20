import React from 'react';
import { Table, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export const DistanceTable = ({
  nodes = [],
  distances = {},
  predecessors = {},
  nodeStates = {},
  visitOrders = {},
  activeNodeId = null,
  activeNeighborId = null,
  sourceId = 'S',
  destinationId = 'D',
}) => {
  return (
    <div className="bg-[#111C2F] rounded-xl border border-[#24344D] overflow-hidden flex flex-col h-full select-none">
      <div className="p-3.5 border-b border-[#24344D] flex items-center justify-between bg-[#19263A]/40">
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4 text-[#38BDF8]" />
          <span className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wider">
            Dynamic Distance Table
          </span>
        </div>
        <span className="text-xs text-[#94A3B8] font-mono">
          {nodes.length} Routers
        </span>
      </div>

      <div className="flex-1 overflow-y-auto max-h-72">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0B1220] text-[#94A3B8] uppercase text-xs tracking-wider font-semibold border-b border-[#24344D] sticky top-0 z-10">
            <tr>
              <th className="py-2.5 px-3">Router</th>
              <th className="py-2.5 px-3 text-right">Tentative Distance</th>
              <th className="py-2.5 px-3 text-center">Predecessor</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3 text-right">Order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#19263A] font-mono text-sm">
            {nodes.map((node) => {
              const id = node.id;
              const isSrc = id === sourceId;
              const isDst = id === destinationId;
              const dist = distances[id];
              const pred = predecessors[id];
              const state = nodeStates[id] || 'unvisited';
              const order = visitOrders[id];
              const isCurrent = id === activeNodeId;
              const isNeighbor = id === activeNeighborId;

              // Row background styling
              let rowBg = 'hover:bg-[#19263A]/50 text-[#94A3B8]';
              if (state === 'shortestPath') {
                rowBg = 'bg-[#22C55E]/15 text-[#F8FAFC] font-semibold';
              } else if (isCurrent) {
                rowBg = 'bg-[#38BDF8]/20 text-[#F8FAFC] ring-1 ring-inset ring-[#38BDF8]/60 font-semibold';
              } else if (isNeighbor) {
                rowBg = 'bg-amber-500/15 text-[#F8FAFC]';
              } else if (state === 'visited') {
                rowBg = 'bg-[#A855F7]/10 text-[#F8FAFC]';
              }

              // Status badge
              let statusElem = (
                <span className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold uppercase bg-slate-800 text-slate-400">
                  UNVISITED
                </span>
              );

              if (state === 'shortestPath') {
                statusElem = (
                  <span className="px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40 flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    ROUTE
                  </span>
                );
              } else if (state === 'current' || isCurrent) {
                statusElem = (
                  <span className="px-2 py-0.5 rounded text-[10px] font-sans font-extrabold uppercase bg-[#38BDF8] text-slate-950 animate-pulse">
                    CURRENT
                  </span>
                );
              } else if (state === 'visited') {
                statusElem = (
                  <span className="px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase bg-[#A855F7]/20 text-[#D8B4FE] border border-[#A855F7]/40 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#C084FC]" />
                    VISITED
                  </span>
                );
              } else if (state === 'unreachable') {
                statusElem = (
                  <span className="px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase bg-rose-950/40 text-rose-300 border border-rose-900/40">
                    UNREACHABLE
                  </span>
                );
              }

              return (
                <tr key={id} className={`transition-colors ${rowBg}`}>
                  <td className="py-2.5 px-3 font-bold text-[#F8FAFC]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{id}</span>
                      {isSrc && (
                        <span className="text-[10px] font-sans text-emerald-400 font-semibold">(S)</span>
                      )}
                      {isDst && (
                        <span className="text-[10px] font-sans text-orange-400 font-semibold">(D)</span>
                      )}
                    </div>
                  </td>

                  <td className="py-2.5 px-3 text-right font-bold text-sm">
                    {dist === Infinity || dist === undefined || dist === null ? (
                      <span className="text-slate-600 font-normal">∞</span>
                    ) : (
                      <span className={state === 'shortestPath' ? 'text-[#22C55E]' : isCurrent ? 'text-[#38BDF8]' : 'text-[#F8FAFC]'}>
                        {dist}
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-center">
                    {pred ? (
                      <span className="px-2 py-0.5 rounded bg-[#19263A] text-[#38BDF8] border border-[#24344D] text-xs font-semibold">
                        {pred}
                      </span>
                    ) : (
                      <span className="text-slate-600 font-normal">—</span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-center">{statusElem}</td>

                  <td className="py-2.5 px-3 text-right text-slate-400 text-xs">
                    {order ? `#${order}` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
