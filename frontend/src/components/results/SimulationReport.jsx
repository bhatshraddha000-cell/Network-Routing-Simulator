import React, { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileCode,
  Printer,
  ChevronDown,
  Check,
} from 'lucide-react';

export const SimulationReport = ({
  result,
  nodes = [],
  edges = [],
  sourceId = 'S',
  destinationId = 'D',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!result) return null;

  const timestamp = new Date().toISOString();
  const readableDate = new Date().toLocaleString();

  // 1. Export CSV
  const handleExportCSV = () => {
    let csv = `NetRoute Simulation Report\n`;
    csv += `Generated At: ${readableDate}\n`;
    csv += `Source: ${sourceId}, Destination: ${destinationId}\n`;
    csv += `Optimal Route: ${result.shortestPath?.join(' -> ') || 'None'}\n`;
    csv += `Total Cost: ${result.totalCost !== null ? result.totalCost : 'Unreachable'}\n\n`;

    // Distance Table Section
    csv += `--- FINAL DISTANCE TABLE ---\n`;
    csv += `Router ID,Final Distance,Predecessor,Visit Order,Status\n`;
    (result.distanceTable || []).forEach((row) => {
      const dist = row.distance !== null ? row.distance : 'Infinity';
      const pred = row.predecessor || 'None';
      const order = row.visitOrder || 'N/A';
      csv += `"${row.nodeId}","${dist}","${pred}","${order}","${row.status}"\n`;
    });

    csv += `\n--- ROUTE COST BREAKDOWN ---\n`;
    csv += `Step,From,To,Link Cost,Cumulative Cost\n`;
    let cumulative = 0;
    const path = result.shortestPath || [];
    for (let i = 0; i < path.length - 1; i++) {
      const from = path[i];
      const to = path[i + 1];
      const edge = edges.find(
        (e) => (e.source === from && e.target === to) || (e.direction === 'BIDIRECTIONAL' && e.source === to && e.target === from)
      );
      const weight = edge ? Number(edge.weight) : 0;
      cumulative = Math.round((cumulative + weight) * 100) / 100;
      csv += `${i + 1},"${from}","${to}",${weight},${cumulative}\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `netroute_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsOpen(false);
  };

  // 2. Export JSON
  const handleExportJSON = () => {
    const reportData = {
      project: 'NetRoute - Network Routing Simulator',
      generatedAt: timestamp,
      endpoints: {
        source: sourceId,
        destination: destinationId,
      },
      results: {
        reachable: result.reachable,
        shortestPath: result.shortestPath,
        shortestPathEdges: result.shortestPathEdges,
        totalCost: result.totalCost,
        hopCount: result.shortestPath?.length > 1 ? result.shortestPath.length - 1 : 0,
        routersTraversed: result.shortestPath?.length || 0,
        visitedOrder: result.visitedOrder,
      },
      distanceTable: result.distanceTable,
      shortestPathTree: result.shortestPathTree || [],
      graphSnapshot: {
        totalRouters: nodes.length,
        totalLinks: edges.length,
        nodes: nodes.map((n) => ({
          id: n.id,
          label: n.data?.label || n.id,
          type: n.data?.type || 'intermediate',
        })),
        edges: edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          weight: Number(e.weight || e.data?.weight || 1),
          direction: e.direction || e.data?.direction || 'BIDIRECTIONAL',
        })),
      },
      algorithmMetadata: {
        name: "Dijkstra's Shortest Path Algorithm",
        priorityQueue: 'Binary Min-Heap',
        timeComplexity: 'O((V + E) log V)',
        spaceComplexity: 'O(V + E)',
      },
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(reportData, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `netroute_simulation_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setIsOpen(false);
  };

  // 3. Print / Save as PDF
  const handlePrintPDF = () => {
    setIsOpen(false);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20 transition-all active:scale-95"
      >
        <Download className="w-3.5 h-3.5" />
        Export Report
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-52 rounded-xl bg-[#142136] border border-[#26364B] shadow-2xl z-50 py-1 divide-y divide-[#1B2B43] animate-fade-in text-xs font-medium">
            <button
              onClick={handleExportCSV}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[#F1F5F9] hover:bg-[#1B2B43] transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export as CSV Table</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[#F1F5F9] hover:bg-[#1B2B43] transition-colors"
            >
              <FileCode className="w-4 h-4 text-[#38BDF8]" />
              <span>Export as JSON Data</span>
            </button>

            <button
              onClick={handlePrintPDF}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[#F1F5F9] hover:bg-[#1B2B43] transition-colors"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

