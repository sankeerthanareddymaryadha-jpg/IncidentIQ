/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopBar } from './components/TopBar';
import { LoginScreen } from './components/LoginScreen';
import { DashboardView } from './components/DashboardView';
import { ReportIncidentView } from './components/ReportIncidentView';
import { InvestigationView } from './components/InvestigationView';
import { RunbooksView } from './components/RunbooksView';
import { AgentMemoryView } from './components/AgentMemoryView';
import { HistoryView } from './components/HistoryView';
import { PostMortemView } from './components/PostMortemView';
import { SettingsView } from './components/SettingsView';
import { HistoricalIncidentModal } from './components/HistoricalIncidentModal';

const AppContent: React.FC = () => {
  const { isLoggedIn, activeTab } = useApp();

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <TopBar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'report' && <ReportIncidentView />}
        {activeTab === 'investigation' && <InvestigationView />}
        {activeTab === 'runbooks' && <RunbooksView />}
        {activeTab === 'memory' && <AgentMemoryView />}
        {activeTab === 'history' && <HistoryView />}
        {activeTab === 'post-mortem' && <PostMortemView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      <footer className="border-t border-slate-900 py-4 px-6 text-center text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Incident IQ · Autonomous incident memory & guided resolution</span>
          <span className="font-mono text-slate-600">All dangerous production actions require authorized human confirmation</span>
        </div>
      </footer>

      {/* Global Historical Incident Drawer Modal */}
      <HistoricalIncidentModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
