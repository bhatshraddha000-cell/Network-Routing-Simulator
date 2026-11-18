import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Trash2,
  ArrowRightLeft,
  ArrowRight,
  Radio,
  Share2,
  Check,
  AlertCircle,
  Network,
} from 'lucide-react';

export const PropertiesPanel = ({
  selectedNode,
  selectedEdge,
  allNodes,
  allEdges,
  onUpdateEdgeWeight,
  onUpdateEdgeDirection,
  onDeleteEdge,
  onDeleteNode,
}) => {
  const [editWeight, setEditWeight] = useState('');
  const [weightError, setWeightError] = useState('');

  // Sync weight input when selected edge changes
  useEffect(() => {
    if (selectedEdge) {
      setEditWeight(String(selectedEdge.data?.weight ?? ''));
      setWeightError('');
    }
  }, [selectedEdge?.id, selectedEdge?.data?.weight]);

  // Network statistics
  const totalRouters = allNodes.length;
  const intermediateRouters = allNodes.filter((n) => n.id !== 'S' && n.id !== 'D').length;
  const totalLinks = allEdges.length;

  const handleWeightSubmit = (e) => {
    e.preventDefault();
    const num = parseFloat(editWeight);
    if (isNaN(num) || num <= 0) {
      setWeightError('Cost must be a positive number greater than 0');
      return;
    }
    const cleanWeight = Math.round(num * 100) / 100;
    onUpdateEdgeWeight(selectedEdge.id, cleanWeight);
    setWeightError('');
  };

  const getConnectedLinksCount = (nodeId) => {
    return allEdges.filter((e) => e.source === nodeId || e.target === nodeId).length;
  };

  return (
    <aside className="w-80 bg-[#111C2F] border-l border-[#24344D] flex flex-col h-full z-10 select-none overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-[#24344D] flex items-center gap-2">
        <Sliders className="w-4 h-4 text-[#38BDF8]" />
        <h2 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wider">
          Properties Inspector
        </h2>
      </div>

      <div className="p-4 space-y-6 flex-1">
        {/* Selection Details */}
        {selectedNode ? (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                Router Properties
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                  selectedNode.id === 'S'
                    ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30'
                    : selectedNode.id === 'D'
                    ? 'bg-[#F97316]/15 text-[#F97316] border-[#F97316]/30'
                    : 'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30'
                }`}
              >
                {selectedNode.data?.type || 'Router'}
              </span>
            </div>

            <div className="bg-[#19263A] p-4 rounded-xl border border-[#24344D] space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-[#0B1220] text-[#38BDF8]">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-[#94A3B8]">Router Identifier</div>
                  <div className="text-base font-bold text-[#F8FAFC]">
                    {selectedNode.data?.label || selectedNode.id}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#24344D]/60 text-xs">
                <div>
                  <span className="text-[#94A3B8]">Position X: </span>
                  <span className="font-mono text-[#F8FAFC]">
                    {Math.round(selectedNode.position?.x ?? 0)}
                  </span>
                </div>
                <div>
                  <span className="text-[#94A3B8]">Position Y: </span>
                  <span className="font-mono text-[#F8FAFC]">
                    {Math.round(selectedNode.position?.y ?? 0)}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[#94A3B8]">Active Links: </span>
                  <span className="font-semibold text-[#38BDF8]">
                    {getConnectedLinksCount(selectedNode.id)} connections
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons for node */}
            {selectedNode.id === 'S' || selectedNode.id === 'D' ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Permanent endpoint router. Required for Dijkstra simulation and cannot be removed or renamed.
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onDeleteNode(selectedNode.id)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-rose-600/15 border border-rose-500/30 text-rose-400 hover:bg-rose-600 hover:text-white transition-all text-xs font-semibold"
              >
                <Trash2 className="w-4 h-4" />
                Delete Router {selectedNode.id}
              </button>
            )}
          </div>
        ) : selectedEdge ? (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                Communication Link
              </span>
              <span className="text-[10px] font-mono text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-0.5 rounded border border-[#38BDF8]/20">
                {selectedEdge.id}
              </span>
            </div>

            <div className="bg-[#19263A] p-4 rounded-xl border border-[#24344D] space-y-3">
              <div className="flex items-center justify-between px-2 py-1 bg-[#0B1220] rounded-lg border border-[#24344D]/80">
                <span className="font-bold text-sm text-[#F8FAFC]">{selectedEdge.source}</span>
                <span className="text-xs text-[#38BDF8]">
                  {selectedEdge.data?.direction === 'ONE_WAY' ? '──►' : '◄──►'}
                </span>
                <span className="font-bold text-sm text-[#F8FAFC]">{selectedEdge.target}</span>
              </div>

              {/* Weight Form */}
              <form onSubmit={handleWeightSubmit} className="space-y-2 pt-1">
                <label className="block text-xs font-semibold text-[#94A3B8] uppercase">
                  Communication Cost (Weight)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    value={editWeight}
                    onChange={(e) => {
                      setEditWeight(e.target.value);
                      if (weightError) setWeightError('');
                    }}
                    className="flex-1 px-3 py-1.5 bg-[#0B1220] border border-[#24344D] rounded-lg text-sm text-[#F8FAFC] outline-none focus:border-[#38BDF8]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Save
                  </button>
                </div>
                {weightError && (
                  <p className="text-rose-400 text-xs font-medium">{weightError}</p>
                )}
              </form>

              {/* Direction selector */}
              <div className="space-y-1.5 pt-2 border-t border-[#24344D]/60">
                <label className="block text-xs font-semibold text-[#94A3B8] uppercase">
                  Direction
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => onUpdateEdgeDirection(selectedEdge.id, 'BIDIRECTIONAL')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors ${
                      selectedEdge.data?.direction === 'BIDIRECTIONAL'
                        ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8]'
                        : 'bg-[#0B1220] border-[#24344D] text-[#94A3B8]'
                    }`}
                  >
                    <ArrowRightLeft className="w-3 h-3" />
                    Two-Way
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateEdgeDirection(selectedEdge.id, 'ONE_WAY')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors ${
                      selectedEdge.data?.direction === 'ONE_WAY'
                        ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8]'
                        : 'bg-[#0B1220] border-[#24344D] text-[#94A3B8]'
                    }`}
                  >
                    <ArrowRight className="w-3 h-3" />
                    One-Way
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onDeleteEdge(selectedEdge.id)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-rose-600/15 border border-rose-500/30 text-rose-400 hover:bg-rose-600 hover:text-white transition-all text-xs font-semibold"
            >
              <Trash2 className="w-4 h-4" />
              Delete Communication Link
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#19263A]/40 border border-[#24344D]/50 text-center space-y-2 py-8">
            <Share2 className="w-8 h-8 text-[#94A3B8]/50 mx-auto" />
            <div className="text-xs font-medium text-[#F8FAFC]">No Element Selected</div>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              Click any router or communication link on the canvas to inspect its parameters and configure costs.
            </p>
          </div>
        )}

        {/* Network Statistics Section */}
        <div className="pt-4 border-t border-[#24344D] space-y-3">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-[#38BDF8]" />
            <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
              Network Metrics
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 bg-[#19263A] rounded-xl border border-[#24344D]">
              <div className="text-xl font-bold text-[#F8FAFC] font-mono">{totalRouters}</div>
              <div className="text-[11px] text-[#94A3B8] font-medium mt-0.5">Total Routers</div>
            </div>

            <div className="p-3 bg-[#19263A] rounded-xl border border-[#24344D]">
              <div className="text-xl font-bold text-[#38BDF8] font-mono">{totalLinks}</div>
              <div className="text-[11px] text-[#94A3B8] font-medium mt-0.5">Communication Links</div>
            </div>

            <div className="p-3 bg-[#19263A] rounded-xl border border-[#24344D]">
              <div className="text-xl font-bold text-[#3B82F6] font-mono">{intermediateRouters}</div>
              <div className="text-[11px] text-[#94A3B8] font-medium mt-0.5">Intermediate Routers</div>
            </div>

            <div className="p-3 bg-[#19263A] rounded-xl border border-[#24344D]">
              <div className="text-xl font-bold text-[#22C55E] font-mono">2</div>
              <div className="text-[11px] text-[#94A3B8] font-medium mt-0.5">Fixed Endpoints (S, D)</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

