import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Incident, IncidentSeverity, IncidentStatus } from '../types/incident';
import {
  AlertTriangle,
  Flame,
  Search,
  CheckCircle,
  Plus,
  ArrowRight,
  Clock,
  ExternalLink,
  Brain,
  BookOpen,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    incidents,
    setActiveTab,
    setSelectedIncidentId,
    currentUser,
    setViewHistoricalModalIncident,
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'active' | 'critical' | 'resolved' | 'mine'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Metrics
  const activeIncidents = incidents.filter((i) => i.status !== 'resolved' && i.status !== 'closed');
  const criticalIncidents = activeIncidents.filter((i) => i.severity === 'critical');
  const investigatingIncidents = activeIncidents.filter((i) => i.status === 'investigating');
  const resolvedIncidents = incidents.filter((i) => i.status === 'resolved' || i.status === 'closed');

  // Filtered incidents
  const displayedIncidents = incidents.filter((inc) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        inc.id.toLowerCase().includes(q) ||
        inc.title.toLowerCase().includes(q) ||
        inc.description.toLowerCase().includes(q) ||
        inc.affectedService.toLowerCase().includes(q) ||
        (inc.rootCause && inc.rootCause.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (filter === 'active') return inc.status !== 'resolved' && inc.status !== 'closed';
    if (filter === 'critical') return inc.severity === 'critical';
    if (filter === 'resolved') return inc.status === 'resolved' || inc.status === 'closed';
    if (filter === 'mine') return inc.reportedBy.email === currentUser.email || inc.assignedTo?.email === currentUser.email;
    return true;
  });

  const getSeverityColor = (sev: IncidentSeverity) => {
    switch (sev) {
      case 'critical':
        return 'text-rose-400 font-semibold';
      case 'high':
        return 'text-amber-400 font-medium';
      case 'medium':
        return 'text-yellow-300 font-medium';
      case 'low':
        return 'text-emerald-400 font-medium';
    }
  };

  const getStatusDisplay = (status: IncidentStatus) => {
    switch (status) {
      case 'reported':
        return 'Reported';
      case 'investigating':
        return 'Investigating';
      case 'fix_applied':
        return 'Fix Applied';
      case 'monitoring':
        return 'Monitoring';
      case 'resolved':
        return 'Resolved';
      case 'closed':
        return 'Closed';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome with Call to Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Production Incident Overview</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time status of services and AI-guided incident response memories.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('report')}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 rounded-lg text-xs transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>+ Report Incident</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Incidents */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Incidents</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">
            {activeIncidents.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {activeIncidents.length > 0 ? 'Requires team attention' : 'All systems normal'}
          </p>
        </div>

        {/* Critical Incidents */}
        <div className={`border p-4 rounded-xl ${
          criticalIncidents.length > 0
            ? 'bg-rose-950/20 border-rose-800/40 text-rose-300'
            : 'bg-slate-900 border-slate-800 text-slate-400'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">Critical Priority</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">
            {criticalIncidents.length}
          </div>
          <p className="text-[11px] mt-1 text-slate-400">
            {criticalIncidents.length > 0 ? 'Direct customer impact' : '0 critical blockers'}
          </p>
        </div>

        {/* Investigating */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">AI Investigating</span>
            <Search className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">
            {investigatingIncidents.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Active diagnostic sessions
          </p>
        </div>

        {/* Resolved Today */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Resolved Incidents</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">
            {resolvedIncidents.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Avg resolution: <span className="tabular-nums font-mono text-emerald-400">13 min</span>
          </p>
        </div>
      </div>

      {/* Prominent Active Incident Investigation Banner if any active exists */}
      {activeIncidents.length > 0 && (
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
                <span>ACTIVE INVESTIGATION</span>
                <span aria-hidden="true">·</span>
                <span>{activeIncidents[0].id}</span>
                <span aria-hidden="true">·</span>
                <span className="capitalize">{activeIncidents[0].affectedService}</span>
              </div>
              <h2 className="text-sm font-semibold text-white mt-0.5">
                {activeIncidents[0].title}
              </h2>
              <p className="text-xs text-slate-300 mt-1 line-clamp-1 max-w-2xl">
                {activeIncidents[0].description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setSelectedIncidentId(activeIncidents[0].id);
                setActiveTab('investigation');
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer"
            >
              <span>Join Investigation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Incident Feed / Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {/* Table controls & filter tabs */}
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Interactive filter tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 overflow-x-auto">
            {[
              { id: 'all', label: 'All Incidents' },
              { id: 'active', label: `Active (${activeIncidents.length})` },
              { id: 'critical', label: `Critical (${criticalIncidents.length})` },
              { id: 'resolved', label: `Resolved (${resolvedIncidents.length})` },
              { id: 'mine', label: 'My Incidents' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  filter === tab.id
                    ? 'bg-slate-800 text-emerald-400 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search incidents, services..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Incident List */}
        <div className="divide-y divide-slate-800/80">
          {displayedIncidents.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No incidents found matching current filter or search criteria.
            </div>
          ) : (
            displayedIncidents.map((incident) => {
              const isResolved = incident.status === 'resolved' || incident.status === 'closed';

              return (
                <div
                  key={incident.id}
                  className="p-4 hover:bg-slate-850/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    {/* Clean unboxed metadata with typographic separators per Section 1.A */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="font-mono text-slate-300 font-medium">{incident.id}</span>
                      <span aria-hidden="true">·</span>
                      <span className={getSeverityColor(incident.severity)}>
                        {incident.severity.toUpperCase()}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-300">{incident.affectedService}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize text-slate-400">{getStatusDisplay(incident.status)}</span>
                      {incident.durationMinutes && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-400 tabular-nums">
                            {incident.durationMinutes} min to resolve
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="text-sm font-semibold text-white truncate">
                      {incident.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-1">
                      {incident.description}
                    </p>

                    {incident.rootCause && (
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-0.5">
                        <span className="text-slate-500 font-medium">Why did this happen:</span>
                        <span className="text-slate-300 truncate">{incident.rootCause}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isResolved ? (
                      <button
                        onClick={() => setViewHistoricalModalIncident(incident)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Past Fix</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedIncidentId(incident.id);
                          setActiveTab('investigation');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium transition-colors cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Investigate</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setActiveTab('memory')}
          className="bg-slate-900 border border-slate-800 p-4 rounded-xl hover:border-slate-700 transition-colors cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-3">
            <Brain className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
            Agent Memory Bank
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Browse verified historical root causes and past fixes stored in memory.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('runbooks')}
          className="bg-slate-900 border border-slate-800 p-4 rounded-xl hover:border-slate-700 transition-colors cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3">
            <BookOpen className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
            Fixing Guides (Runbooks)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Standard operating recovery checklists for payment, database, and API issues.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('report')}
          className="bg-slate-900 border border-slate-800 p-4 rounded-xl hover:border-slate-700 transition-colors cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
            <Plus className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
            Report New Incident
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Submit a plain-language summary and let the AI find matching past fixes.
          </p>
        </div>
      </div>
    </div>
  );
};
