import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AgentMemoryEntry } from '../types/incident';
import {
  Brain,
  Search,
  Sparkles,
  Clock,
  BookOpen,
  AlertTriangle,
  Plus,
  ArrowRight,
  ExternalLink,
  Flame,
  CheckCircle2,
} from 'lucide-react';

export const AgentMemoryView: React.FC = () => {
  const { memoryBank, teachAgentMemory, currentUser, incidents, setViewHistoricalModalIncident } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [teachModalOpen, setTeachModalOpen] = useState(false);

  // Teach modal state
  const [newTitle, setNewTitle] = useState('');
  const [newService, setNewService] = useState('Payment Service');
  const [newSymptoms, setNewSymptoms] = useState('');
  const [newRootCause, setNewRootCause] = useState('');
  const [newSuccessfulFix, setNewSuccessfulFix] = useState('');
  const [newRunbookTitle, setNewRunbookTitle] = useState('Payment Service Recovery');
  const [newMinutes, setNewMinutes] = useState(10);
  const [newLessons, setNewLessons] = useState('');

  // Extract unique services
  const services = Array.from(new Set(memoryBank.map((m) => m.service)));

  const filteredMemories = memoryBank.filter((mem) => {
    if (selectedService !== 'all' && mem.service !== selectedService) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      mem.incidentTitle.toLowerCase().includes(q) ||
      mem.service.toLowerCase().includes(q) ||
      mem.rootCause.toLowerCase().includes(q) ||
      mem.successfulFix.toLowerCase().includes(q) ||
      mem.symptoms.some((s) => s.toLowerCase().includes(q))
    );
  });

  const handleTeachSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newRootCause.trim() || !newSuccessfulFix.trim()) return;

    teachAgentMemory({
      incidentId: `INC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      incidentTitle: newTitle,
      service: newService,
      symptoms: newSymptoms.split('\n').filter(Boolean),
      rootCause: newRootCause,
      successfulFix: newSuccessfulFix,
      successfulRunbookTitle: newRunbookTitle,
      failedApproaches: [],
      resolutionTimeMinutes: newMinutes,
      date: new Date().toISOString().split('T')[0],
      lessonsLearned: newLessons || 'Documented knowledge entry.',
    });

    setTeachModalOpen(false);
    setNewTitle('');
    setNewRootCause('');
    setNewSuccessfulFix('');
    setNewSymptoms('');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
            <Brain className="w-4 h-4" />
            <span>Agent Long-Term Memory Bank</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Learned Incident Knowledge</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Incident IQ retrieves these memories during new outages to recommend proven fixes in seconds.
          </p>
        </div>

        {currentUser.role !== 'employee' && (
          <button
            onClick={() => setTeachModalOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-3.5 py-2 rounded-lg text-xs transition-colors cursor-pointer shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Teach Agent New Memory</span>
          </button>
        )}
      </div>

      {/* Search and Service Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search agent memory (e.g. 'connection pool', 'timeout', 'postgres')..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedService('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              selectedService === 'all'
                ? 'bg-slate-800 text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
            }`}
          >
            All Services
          </button>
          {services.map((svc) => (
            <button
              key={svc}
              onClick={() => setSelectedService(svc)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                selectedService === svc
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
              }`}
            >
              {svc}
            </button>
          ))}
        </div>
      </div>

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMemories.map((entry) => {
          const correspondingIncident = incidents.find((i) => i.id === entry.incidentId);

          return (
            <div
              key={entry.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-colors shadow-sm"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                    <span className="font-mono text-emerald-400 font-semibold">{entry.incidentId}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-300 font-medium">{entry.service}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums text-slate-400">{entry.date}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white">
                    {entry.incidentTitle}
                  </h3>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
                    Referenced {entry.timesReferenced}x
                  </span>
                </div>
              </div>

              {/* Speech bubble: What the agent says */}
              <div className="bg-slate-950 border border-slate-850 p-3 rounded-lg text-xs space-y-1">
                <div className="text-emerald-400 font-semibold flex items-center gap-1.5 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Agent Retrieval Recall:</span>
                </div>
                <p className="text-slate-300 italic text-[11px]">
                  «"I've seen a similar problem before. The team resolved it in {entry.resolutionTimeMinutes} minutes using {entry.successfulRunbookTitle || 'the Service Recovery guide'}."»
                </p>
              </div>

              {/* Root Cause & What Fixed it */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 font-medium text-[11px]">Why did this happen (Root Cause):</span>
                  <p className="text-slate-200 mt-0.5 bg-slate-850/60 p-2 rounded border border-slate-800">
                    {entry.rootCause}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-medium text-[11px]">What fixed it:</span>
                  <p className="text-slate-300 mt-0.5">
                    {entry.successfulFix}
                  </p>
                </div>

                {entry.failedApproaches && entry.failedApproaches.length > 0 && (
                  <div className="pt-1">
                    <span className="text-amber-400 font-medium text-[11px] flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Failed approaches to avoid:
                    </span>
                    <ul className="list-disc list-inside text-slate-400 text-[11px] mt-0.5 pl-1">
                      {entry.failedApproaches.map((fa, i) => (
                        <li key={i}>{fa}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Bottom footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <span className="flex items-center gap-1 tabular-nums">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Avg Resolution: <strong className="text-white font-mono">{entry.resolutionTimeMinutes} min</strong>
                </span>

                {correspondingIncident && (
                  <button
                    onClick={() => setViewHistoricalModalIncident(correspondingIncident)}
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <span>Inspect Full Incident</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Teach Modal */}
      {teachModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 text-slate-100 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-emerald-400" />
              <span>Teach Incident Knowledge to Agent Memory</span>
            </h3>

            <form onSubmit={handleTeachSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Incident Title / Pattern
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Redis Cluster Memory Eviction Outage"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Affected Service
                  </label>
                  <input
                    type="text"
                    required
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Resolution Time (min)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newMinutes}
                    onChange={(e) => setNewMinutes(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white tabular-nums outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Symptoms (one per line)
                </label>
                <textarea
                  rows={2}
                  value={newSymptoms}
                  onChange={(e) => setNewSymptoms(e.target.value)}
                  placeholder="User seeing 504 gateway timeout&#10;Redis latency spiked"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Root Cause ("Why did this happen?")
                </label>
                <textarea
                  rows={2}
                  required
                  value={newRootCause}
                  onChange={(e) => setNewRootCause(e.target.value)}
                  placeholder="Redis volatile-lru policy evicted unexpired session keys..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Successful Resolution ("What fixed it?")
                </label>
                <textarea
                  rows={2}
                  required
                  value={newSuccessfulFix}
                  onChange={(e) => setNewSuccessfulFix(e.target.value)}
                  placeholder="Scaled Redis cluster memory and configured noeviction guard..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setTeachModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-lg cursor-pointer"
                >
                  Store Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
