import React, { useState, useCallback, useRef } from 'react';
import { Navbar } from './components/layout/Navbar';
import { NetworkEditor } from './pages/NetworkEditor';
import { Dashboard } from './pages/Dashboard';
import { ResultsPage } from './pages/ResultsPage';
import { Toast } from './components/common/Toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { useTopology } from './hooks/useTopology';

function App() {
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const savedTab = sessionStorage.getItem('netroute_active_tab');
      return savedTab || 'topology';
    } catch {
      return 'topology';
    }
  }); // 'dashboard' | 'topology' | 'simulator' | 'results'

  const [toast, setToast] = useState(null);
  const fitViewRef = useRef(null);

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    setToast({ message, type, duration });
  }, []);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  const topology = useTopology(showToast);

  const changeTab = useCallback((newTab) => {
    setActiveTab(newTab);
    try {
      sessionStorage.setItem('netroute_active_tab', newTab);
    } catch { }
  }, []);

  const handleStartSimulation = useCallback(async () => {
    const ok = await topology.startSimulation();
    if (ok !== false) {
      changeTab('simulator');
    }
  }, [topology, changeTab]);

  const handleExitSimulation = useCallback(() => {
    topology.exitSimulation();
    changeTab('topology');
  }, [topology, changeTab]);

  const handleSelectTab = useCallback(
    (tabId) => {
      if (tabId === 'simulator') {
        if (!topology.isSimulating) {
          handleStartSimulation();
        } else {
          changeTab('simulator');
        }
      } else {
        changeTab(tabId);
      }
    },
    [topology.isSimulating, handleStartSimulation, changeTab]
  );

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0B1220] text-[#F8FAFC]">
      {/* Top Application Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        hasUnsavedChanges={topology.hasUnsavedChanges}
        isSaving={topology.isSaving}
        isCalculating={topology.isCalculating}
        isSimulating={topology.isSimulating}
        isTopologyModified={topology.isTopologyModified}
        onSave={topology.saveTopology}
        onReload={topology.fetchTopology}
        onFitView={() => fitViewRef.current?.()}
        onCalculateDijkstra={topology.calculateDijkstra}
        onStartSimulation={handleStartSimulation}
        onExitSimulation={handleExitSimulation}
        hasAlgorithmResult={Boolean(topology.dijkstraResult)}
        onResetAlgorithmResult={topology.resetAlgorithmResult}
      />

      {/* Main View Port Container - flex flex-col ensures flex-1 children expand to full height */}
      <main className="flex-1 w-full h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden relative">
        <ErrorBoundary onNavigateToDashboard={() => changeTab('dashboard')}>
          {/* View 1: Overview Dashboard */}
          {activeTab === 'dashboard' && (
            <Dashboard
              nodes={topology.nodes}
              edges={topology.edges}
              dijkstraResult={topology.dijkstraResult}
              isTopologyModified={topology.isTopologyModified}
              onNavigateToTopology={() => changeTab('topology')}
              onNavigateToSimulator={handleStartSimulation}
              onNavigateToResults={() => changeTab('results')}
            />
          )}

          {/* View 4: Results & Reports Analysis */}
          {activeTab === 'results' && (
            <ResultsPage
              result={topology.dijkstraResult}
              nodes={topology.nodes}
              edges={topology.edges}
              isTopologyModified={topology.isTopologyModified}
              onNavigateToEditor={() => changeTab('topology')}
              onNavigateToSimulator={handleStartSimulation}
            />
          )}

          {/* Views 2 & 3: Network Canvas (Topology Builder & Simulator) */}
          <div
            className={
              activeTab === 'topology' || activeTab === 'simulator'
                ? 'h-full w-full flex flex-1 overflow-hidden'
                : 'hidden'
            }
          >
            <NetworkEditor
              topology={topology}
              showToast={showToast}
              onNavigateToResults={() => changeTab('results')}
              onNavigateToTopology={() => changeTab('topology')}
              onRegisterFitView={(fn) => {
                fitViewRef.current = fn;
              }}
            />
          </div>
        </ErrorBoundary>
      </main>

      {/* Global Toast Notifications */}
      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}

export default App;
