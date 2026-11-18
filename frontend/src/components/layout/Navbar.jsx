import React from 'react';
import {
  Save,
  RefreshCw,
  CheckCircle2,
  Maximize2,
  Zap,
  Play,
  RotateCcw,
  LogOut,
  LayoutDashboard,
  Network,
  Cpu,
  BarChart3,
  AlertCircle,
} from 'lucide-react';

export const Navbar = ({
  activeTab = 'topology',
  onSelectTab,
  hasUnsavedChanges,
  isSaving,
  isCalculating,
  isSimulating,
  isTopologyModified,
  onSave,
  onReload,
  onFitView,
  onCalculateDijkstra,
  onStartSimulation,
  onExitSimulation,
  hasAlgorithmResult,
  onResetAlgorithmResult,
}) => {
  const navTabs = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'topology', label: 'Topology Builder', icon: Network },
    { id: 'simulator', label: 'Algorithm Simulator', icon: Cpu },
    { id: 'results', label: 'Results & Reports', icon: BarChart3 },
  ];

  return (
    <header className="h-14 bg-[#111C2F] border-b border-[#24344D] px-4 md:px-6 flex items-center justify-between z-20 select-none print:hidden">
      {/* Left: Branding & Core Navigation Tabs */}
      <div className="flex items-center gap-4 lg:gap-6">
        <div
          onClick={() => onSelectTab && onSelectTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Go to Overview Dashboard"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#38BDF8] to-[#1D4ED8] flex items-center justify-center text-slate-950 font-black text-sm shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            NR
          </div>
          <div className="hidden sm:block">
            <span className="text-sm font-bold text-[#F8FAFC] tracking-tight group-hover:text-[#38BDF8] transition-colors">
              NetRoute
            </span>
            <span className="text-[10px] block text-[#94A3B8] -mt-1 font-mono">
              Dijkstra Routing
            </span>
          </div>
        </div>

        {/* Navigation Tabs Pill */}
        <nav className="flex items-center bg-[#0B1220] p-1 rounded-xl border border-[#24344D]">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.id === 'simulator' && !isSimulating && onStartSimulation) {
                    onStartSimulation();
                  } else if (onSelectTab) {
                    onSelectTab(tab.id);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#19263A] text-[#38BDF8] shadow-sm border border-[#38BDF8]/30'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111C2F]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#38BDF8]' : 'text-[#94A3B8]'}`} />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right: Status Pill & Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Status Pill Indicator */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[#0B1220] border border-[#24344D]">
          {isSimulating ? (
            <>
              <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse shrink-0" />
              <span className="text-[#38BDF8] font-bold">Simulator Active</span>
            </>
          ) : isTopologyModified ? (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              <span className="text-amber-300">Topology Modified</span>
            </>
          ) : hasUnsavedChanges ? (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <span className="text-amber-300">Unsaved Changes</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-emerald-300">Synchronized</span>
            </>
          )}
        </div>

        {/* View-Specific or Global Actions */}
        {activeTab === 'simulator' || isSimulating ? (
          <>
            <button
              type="button"
              onClick={onExitSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#19263A] hover:bg-[#24344D] text-[#F8FAFC] border border-[#24344D] text-xs font-bold transition-all active:scale-95"
              title="Exit simulation and return to topology editor"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Exit Simulation</span>
            </button>

            {onFitView && (
              <button
                type="button"
                onClick={onFitView}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#19263A] hover:bg-[#24344D] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#24344D] text-xs font-medium transition-colors"
                title="Fit view to canvas"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        ) : activeTab === 'topology' ? (
          <>
            <button
              type="button"
              onClick={onStartSimulation}
              disabled={isCalculating}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 ${
                isCalculating
                  ? 'bg-sky-800 text-sky-200 cursor-wait'
                  : 'bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-slate-950 shadow-sky-500/20'
              }`}
              title="Launch interactive step-by-step Dijkstra simulation"
            >
              {isCalculating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Preparing...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Simulation</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onCalculateDijkstra}
              disabled={isCalculating}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#19263A] hover:bg-[#24344D] text-[#F8FAFC] border border-[#24344D] text-xs font-medium transition-colors"
              title="Quick Dijkstra calculation"
            >
              <Zap className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Calculate</span>
            </button>

            {hasAlgorithmResult && (
              <button
                type="button"
                onClick={onResetAlgorithmResult}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#19263A] hover:bg-[#24344D] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#24344D] text-xs font-medium transition-colors"
                title="Clear shortest path highlighting"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            {onFitView && (
              <button
                type="button"
                onClick={onFitView}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#19263A] hover:bg-[#24344D] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#24344D] text-xs font-medium transition-colors"
                title="Fit view to canvas"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={onReload}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#19263A] hover:bg-[#24344D] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#24344D] text-xs font-medium transition-colors"
              title="Reload from MongoDB"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload</span>
            </button>

            <button
              type="button"
              onClick={onSave}
              disabled={isSaving || !hasUnsavedChanges}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${
                hasUnsavedChanges
                  ? 'bg-[#19263A] hover:bg-[#24344D] text-[#38BDF8] border border-[#38BDF8]/40 active:scale-95'
                  : 'bg-[#19263A] text-[#94A3B8] border border-[#24344D] cursor-default'
              }`}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : hasUnsavedChanges ? (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Saved</span>
                </>
              )}
            </button>
          </>
        ) : activeTab === 'results' ? (
          <>
            <button
              type="button"
              onClick={() => onSelectTab && onSelectTab('topology')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#19263A] hover:bg-[#24344D] text-[#F8FAFC] border border-[#24344D] text-xs font-semibold transition-colors"
            >
              <Network className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Edit Topology</span>
            </button>

            <button
              type="button"
              onClick={onStartSimulation}
              disabled={isCalculating}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-slate-950 text-xs font-bold shadow-md shadow-sky-500/20 transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Simulation</span>
            </button>
          </>
        ) : (
          /* Dashboard Tab Actions */
          <>
            <button
              type="button"
              onClick={() => onSelectTab && onSelectTab('topology')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#19263A] hover:bg-[#24344D] text-[#F8FAFC] border border-[#24344D] text-xs font-semibold transition-colors"
            >
              <Network className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Topology Builder</span>
            </button>

            <button
              type="button"
              onClick={onStartSimulation}
              disabled={isCalculating}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-slate-950 text-xs font-bold shadow-md shadow-sky-500/20 transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Simulation</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};
