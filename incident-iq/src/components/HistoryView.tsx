import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Incident, IncidentSeverity, IncidentStatus } from '../types/incident';
import {
  History,
  Search,
  Filter,
  ExternalLink,
  Clock,
  Sparkles,
  Download,
  AlertTriangle,
} from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { incidents, setViewHistoricalModalIncident } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const services = Array.from(new Set(incidents.map((i) => i.affectedService)));

  const filteredIncidents = incidents.filter((inc) => {
    // Service filter
    if (selectedService !== 'all' && inc.affectedService !== selectedService) {
      return false;
    }
    // Severity filter
    if (selectedSeverity !== 'all' && inc.severity !== selectedSeverity) {
      return false;
    }
    // Status filter
    if (selectedStatus !== 'all' && inc.status !== selectedStatus) {
      return false;
    }

    // Search query matching ID, name, service, root cause, error description, date
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        inc.id.toLowerCase().includes(q) ||
        inc.title.toLowerCase().includes(q) ||
        inc.affectedService.toLowerCase().includes(q) ||
        inc.description.toLowerCase().includes(q) ||
        (inc.rootCause && inc.rootCause.toLowerCase().includes(q)) ||
        (inc.resolutionNotes && inc.resolutionNotes.toLowerCase().includes(q)) ||
        inc.createdAt.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const getSeverityStyle = (sev: IncidentSeverity) => {
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

  const exportCsv = () => {
    const headers = ['ID', 'Title', 'Service', 'Severity', 'Status', 'Root Cause', 'DurationMinutes', 'Created'];
    const rows = filteredIncidents.map((i) => [
      i.id,
      `"${i.title.replace(/"/g, '""')}"`,
      `"${i.affectedService}"`,
      i.severity,
      i.status,
      `"${(i.rootCause || '').replace(/"/g, '""')}"`,
      i.durationMinutes || '',
      i.createdAt,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `incident_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            <span>Searchable Incident History</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Query previous production incidents, root causes, duration metrics, and proven remediation records.
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Multi-field search & filters */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
        {/* Main Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search: "payment database", error message, ID, or root cause...'
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
          />
        </div>

        {/* Quick query chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] text-slate-500 font-medium">Quick Queries:</span>
          {['payment database', '504 gateway timeout', 'connection pool', 'lock contention', 'crash'].map((term) => (
            <button
              key={term}
              onClick={() => setSearchQuery(term)}
              className="text-[11px] px-2.5 py-1 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              "{term}"
            </button>
          ))}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[11px] text-rose-400 hover:underline cursor-pointer ml-1"
            >
              Clear Search
            </button>
          )}
        </div>

        {/* Filters dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800 text-xs">
          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">
              Service
            </label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
            >
              <option value="all">All Services</option>
              {services.map((svc) => (
                <option key={svc} value={svc}>
                  {svc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">
              Severity
            </label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
            >
              <option value="all">All Statuses</option>
              <option value="resolved">Resolved</option>
              <option value="investigating">Investigating</option>
              <option value="fix_applied">Fix Applied</option>
              <option value="reported">Reported</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-3.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Found <strong className="text-white tabular-nums">{filteredIncidents.length}</strong> matching incidents</span>
          <span className="text-[11px]">Click an incident to inspect root cause & resolution</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {filteredIncidents.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No historical incidents found matching your query.
            </div>
          ) : (
            filteredIncidents.map((incident) => (
              <div
                key={incident.id}
                onClick={() => setViewHistoricalModalIncident(incident)}
                className="p-4 hover:bg-slate-850/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="font-mono text-emerald-400 font-medium">{incident.id}</span>
                    <span aria-hidden="true">·</span>
                    <span className={getSeverityStyle(incident.severity)}>
                      {incident.severity.toUpperCase()}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-300">{incident.affectedService}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize text-slate-400">{incident.status}</span>
                    {incident.durationMinutes && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-400 tabular-nums">
                          {incident.durationMinutes} min
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
                      <span className="text-slate-500 font-medium">Root Cause:</span>
                      <span className="text-slate-300 truncate">{incident.rootCause}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-400 flex items-center gap-1 group-hover:text-emerald-400">
                    <span>Inspect</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
