import React, { useState, useMemo } from 'react';
import {
  Table,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const DistanceAnalysis = ({
  distanceTable = [],
  sourceId = 'S',
  destinationId = 'D',
  shortestPath = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'VISITED' | 'UNREACHABLE'
  const [sortField, setSortField] = useState('distance'); // 'distance' | 'nodeId' | 'visitOrder'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setSortField('distance');
    setSortDirection('asc');
  };

  // Filter and sort the distance table
  const filteredRows = useMemo(() => {
    return distanceTable
      .filter((row) => {
        // Search filter
        const matchSearch =
          row.nodeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (row.label && row.label.toLowerCase().includes(searchTerm.toLowerCase()));
        if (!matchSearch) return false;

        // Status filter
        if (statusFilter === 'VISITED' && row.status !== 'VISITED') return false;
        if (statusFilter === 'UNREACHABLE' && row.status !== 'UNREACHABLE') return false;

        return true;
      })
      .sort((a, b) => {
        let valA, valB;

        if (sortField === 'distance') {
          valA = a.distance === null || a.distance === undefined ? Infinity : a.distance;
          valB = b.distance === null || b.distance === undefined ? Infinity : b.distance;
        } else if (sortField === 'visitOrder') {
          valA = a.visitOrder === null || a.visitOrder === undefined ? Infinity : a.visitOrder;
          valB = b.visitOrder === null || b.visitOrder === undefined ? Infinity : b.visitOrder;
        } else {
          valA = a.nodeId;
          valB = b.nodeId;
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [distanceTable, searchTerm, statusFilter, sortField, sortDirection]);

  return (
    <div className="bg-[#142136] rounded-xl border border-[#26364B] overflow-hidden select-none shadow-md space-y-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#26364B] pb-3">
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4 text-[#38BDF8]" />
          <h3 className="text-xs font-bold text-[#F1F5F9] uppercase tracking-wider">
            Complete Distance Analysis
          </h3>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search router..."
              className="pl-8 pr-3 py-1.5 rounded-lg bg-[#0B1220] border border-[#26364B] text-xs text-[#F1F5F9] placeholder-slate-500 outline-none focus:border-[#38BDF8] w-36 transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-[#0B1220] rounded-lg p-0.5 border border-[#26364B] text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-[#1B2B43] text-[#38BDF8]'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
            >
              All ({distanceTable.length})
            </button>
            <button
              onClick={() => setStatusFilter('VISITED')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                statusFilter === 'VISITED'
                  ? 'bg-[#1B2B43] text-emerald-400'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
            >
              Reachable
            </button>
            <button
              onClick={() => setStatusFilter('UNREACHABLE')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                statusFilter === 'UNREACHABLE'
                  ? 'bg-[#1B2B43] text-rose-400'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
            >
              Unreachable
            </button>
          </div>

          {/* Reset Filters */}
          {(searchTerm || statusFilter !== 'ALL' || sortField !== 'distance' || sortDirection !== 'asc') && (
            <button
              onClick={handleClearFilters}
              className="p-1.5 rounded-lg bg-[#1B2B43] hover:bg-[#26364B] text-[#94A3B8] hover:text-[#F1F5F9] text-xs"
              title="Clear all filters and sorting"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-[#26364B] bg-[#0B1220]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#101A2B] text-[#94A3B8] uppercase font-semibold border-b border-[#26364B]">
            <tr>
              {/* Router ID Header */}
              <th
                onClick={() => handleSort('nodeId')}
                className="py-2.5 px-4 cursor-pointer hover:text-[#F1F5F9] transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Router</span>
                  {sortField === 'nodeId' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#38BDF8]" /> : <ArrowDown className="w-3 h-3 text-[#38BDF8]" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-40" />
                  )}
                </div>
              </th>

              {/* Distance Header */}
              <th
                onClick={() => handleSort('distance')}
                className="py-2.5 px-4 text-right cursor-pointer hover:text-[#F1F5F9] transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Final Distance</span>
                  {sortField === 'distance' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#38BDF8]" /> : <ArrowDown className="w-3 h-3 text-[#38BDF8]" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-40" />
                  )}
                </div>
              </th>

              <th className="py-2.5 px-4 text-center">Predecessor</th>

              {/* Visit Order Header */}
              <th
                onClick={() => handleSort('visitOrder')}
                className="py-2.5 px-4 text-center cursor-pointer hover:text-[#F1F5F9] transition-colors"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Visit Order</span>
                  {sortField === 'visitOrder' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#38BDF8]" /> : <ArrowDown className="w-3 h-3 text-[#38BDF8]" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-40" />
                  )}
                </div>
              </th>

              <th className="py-2.5 px-4 text-center">Reachability Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1B2B43] font-mono">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-500 font-sans">
                  No routers match the selected filter criteria.
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => {
                const isSrc = row.nodeId === sourceId;
                const isDst = row.nodeId === destinationId;
                const onPath = shortestPath.includes(row.nodeId);

                return (
                  <tr
                    key={row.nodeId}
                    className={`hover:bg-[#1B2B43]/50 transition-colors ${
                      onPath ? 'bg-[#22C55E]/10 font-bold' : ''
                    }`}
                  >
                    <td className="py-2.5 px-4 font-bold flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          isSrc
                            ? 'bg-[#22C55E]'
                            : isDst
                            ? 'bg-[#F97316]'
                            : onPath
                            ? 'bg-[#22C55E]'
                            : 'bg-[#3B82F6]'
                        }`}
                      />
                      <span className={onPath ? 'text-[#22C55E]' : 'text-[#F1F5F9]'}>
                        {row.label || row.nodeId}
                      </span>
                      {isSrc && <span className="text-[10px] text-emerald-400 font-sans">(Source)</span>}
                      {isDst && <span className="text-[10px] text-orange-400 font-sans">(Destination)</span>}
                    </td>

                    <td className="py-2.5 px-4 text-right font-bold">
                      {row.distance !== null ? (
                        <span className={onPath ? 'text-[#22C55E]' : 'text-[#F1F5F9]'}>
                          {Number(row.distance).toFixed(2).replace(/\.00$/, '')} units
                        </span>
                      ) : (
                        <span className="text-slate-600 font-normal">∞ (Unreachable)</span>
                      )}
                    </td>

                    <td className="py-2.5 px-4 text-center">
                      {row.predecessor ? (
                        <span className="px-2 py-0.5 rounded bg-[#101A2B] border border-[#26364B] text-[#38BDF8]">
                          {row.predecessor}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    <td className="py-2.5 px-4 text-center text-slate-400">
                      {row.visitOrder ? `#${row.visitOrder}` : '—'}
                    </td>

                    <td className="py-2.5 px-4 text-center font-sans">
                      {row.status === 'VISITED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Reachable
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          <XCircle className="w-3 h-3" />
                          Unreachable
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

