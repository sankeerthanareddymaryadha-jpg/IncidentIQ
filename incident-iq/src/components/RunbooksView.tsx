import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Runbook, RunbookStep } from '../types/incident';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Copy,
  Check,
  Search,
  Plus,
  Play,
  Clock,
  Sparkles,
  Terminal,
} from 'lucide-react';

export const RunbooksView: React.FC = () => {
  const { runbooks, toggleRunbookStep, saveNewRunbook, currentUser, setActiveTab } = useApp();

  const [selectedRunbookId, setSelectedRunbookId] = useState<string>(runbooks[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const [simulatedStepId, setSimulatedStepId] = useState<string | null>(null);

  // New runbook modal
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newService, setNewService] = useState('Payment Service');
  const [newDescription, setNewDescription] = useState('');
  const [newMinutes, setNewMinutes] = useState(15);
  const [newStep1, setNewStep1] = useState('Verify network and pod health');
  const [newStep2, setNewStep2] = useState('Inspect active error logs');
  const [newStep3, setNewStep3] = useState('Perform rolling restart if required');

  const filteredRunbooks = runbooks.filter((rb) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      rb.title.toLowerCase().includes(q) ||
      rb.service.toLowerCase().includes(q) ||
      rb.description.toLowerCase().includes(q) ||
      rb.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const activeRunbook = runbooks.find((r) => r.id === selectedRunbookId) || runbooks[0];

  const completedCount = activeRunbook
    ? activeRunbook.steps.filter((s) => s.completed).length
    : 0;
  const totalCount = activeRunbook ? activeRunbook.steps.length : 0;
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  const handleSimulateStep = (step: RunbookStep) => {
    setSimulatedStepId(step.id);
    setTimeout(() => {
      setSimulatedStepId(null);
      if (activeRunbook) {
        if (!step.completed) {
          toggleRunbookStep(activeRunbook.id, step.id);
        }
      }
    }, 900);
  };

  const handleCreateRunbook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    saveNewRunbook({
      title: newTitle,
      service: newService,
      description: newDescription || `Step-by-step resolution procedure for ${newService}.`,
      estimatedMinutes: newMinutes,
      tags: [newService.toLowerCase().replace(/[^a-z0-9]/g, '-'), 'triage', 'prod-ops'],
      steps: [
        {
          id: `step-${Date.now()}-1`,
          stepNumber: 1,
          title: newStep1,
          instruction: 'Execute diagnostic command and verify baseline response.',
          completed: false,
        },
        {
          id: `step-${Date.now()}-2`,
          stepNumber: 2,
          title: newStep2,
          instruction: 'Check recent application stderr logs for exception traces.',
          completed: false,
        },
        {
          id: `step-${Date.now()}-3`,
          stepNumber: 3,
          title: newStep3,
          instruction: 'Verify latency returns to nominal baseline.',
          completed: false,
        },
      ],
    });

    setNewModalOpen(false);
    setNewTitle('');
    setNewDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <span>Fixing Guides (Runbooks)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Proven step-by-step checklists referenced by Incident IQ during investigations.
          </p>
        </div>

        {currentUser.role !== 'employee' && (
          <button
            onClick={() => setNewModalOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-3.5 py-2 rounded-lg text-xs transition-colors cursor-pointer shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>New Fixing Guide</span>
          </button>
        )}
      </div>

      {/* Main 2-column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Runbook Catalog */}
        <div className="lg:col-span-4 space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides by service or symptom..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-2">
            {filteredRunbooks.map((rb) => {
              const isSelected = rb.id === activeRunbook?.id;
              const completed = rb.steps.filter((s) => s.completed).length;

              return (
                <div
                  key={rb.id}
                  onClick={() => setSelectedRunbookId(rb.id)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-emerald-500/50 bg-slate-850 shadow-xs'
                      : 'border-slate-800 bg-slate-900 hover:bg-slate-850/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="text-emerald-400 font-medium">{rb.service}</span>
                    <span className="flex items-center gap-1 tabular-nums">
                      <Clock className="w-3 h-3" />
                      ~{rb.estimatedMinutes} min
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-white truncate">{rb.title}</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">{rb.description}</p>

                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/80">
                    <span>
                      {completed} / {rb.steps.length} steps completed
                    </span>
                    <span className="font-mono text-emerald-400 font-medium">
                      {Math.round((completed / rb.steps.length) * 100)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Runbook Checklist View */}
        <div className="lg:col-span-8">
          {activeRunbook ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-sm">
              {/* Header & Progress */}
              <div className="space-y-3 pb-5 border-b border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                      📖 {activeRunbook.service}
                    </span>
                    <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
                      {activeRunbook.title}
                    </h2>
                  </div>

                  <div className="text-right sm:text-right">
                    <div className="text-xs font-semibold text-white tabular-nums">
                      {completedCount} / {totalCount} steps completed
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Estimated duration: ~{activeRunbook.estimatedMinutes} minutes
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300">{activeRunbook.description}</p>

                {/* Progress bar */}
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${percentComplete}%` }}
                  />
                </div>
              </div>

              {/* Steps Checklist */}
              <div className="space-y-4">
                {activeRunbook.steps.map((step) => {
                  const isSimulating = simulatedStepId === step.id;

                  return (
                    <div
                      key={step.id}
                      className={`p-4 rounded-xl border transition-colors ${
                        step.completed
                          ? 'border-emerald-500/30 bg-emerald-950/10'
                          : 'border-slate-800 bg-slate-950'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <button
                            type="button"
                            onClick={() => toggleRunbookStep(activeRunbook.id, step.id)}
                            className="mt-0.5 text-slate-400 hover:text-emerald-400 cursor-pointer transition-colors shrink-0"
                            title={step.completed ? 'Mark uncompleted' : 'Mark completed'}
                          >
                            {step.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-600" />
                            )}
                          </button>

                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-mono text-slate-400 font-semibold">
                                Step {step.stepNumber}
                              </span>
                              <h3
                                className={`text-xs font-semibold ${
                                  step.completed ? 'line-through text-slate-400' : 'text-white'
                                }`}
                              >
                                {step.title}
                              </h3>
                            </div>

                            <p className="text-xs text-slate-300">{step.instruction}</p>

                            {step.commandOrSnippet && (
                              <div className="mt-2.5 pt-2 border-t border-slate-850">
                                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                                  <span className="flex items-center gap-1 font-mono">
                                    <Terminal className="w-3 h-3 text-emerald-400" />
                                    Terminal Command / Query
                                  </span>
                                  <button
                                    onClick={() => handleCopy(step.id, step.commandOrSnippet!)}
                                    className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                                  >
                                    {copiedSnippetId === step.id ? (
                                      <Check className="w-3 h-3 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                    <span>{copiedSnippetId === step.id ? 'Copied' : 'Copy'}</span>
                                  </button>
                                </div>
                                <pre className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-200 overflow-x-auto">
                                  {step.commandOrSnippet}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Simulate action verify button */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleSimulateStep(step)}
                            disabled={isSimulating}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                              step.completed
                                ? 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                                : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                            }`}
                          >
                            <Play className="w-3 h-3" />
                            <span>{isSimulating ? 'Verifying...' : step.completed ? 'Re-verify' : 'Run Check'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {completedCount === totalCount && (
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5 text-xs text-emerald-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>All steps in <strong>{activeRunbook.title}</strong> completed successfully!</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('investigation')}
                    className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-lg cursor-pointer whitespace-nowrap"
                  >
                    Return to Active Incident
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs">
              No runbook selected.
            </div>
          )}
        </div>
      </div>

      {/* New Runbook Modal */}
      {newModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 text-slate-100 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Create New Fixing Guide (Runbook)</span>
            </h3>

            <form onSubmit={handleCreateRunbook} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Runbook Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Cache Cluster Eviction Recovery"
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
                    Est. Duration (minutes)
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
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Summary of when to use this runbook..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2 pt-1 border-t border-slate-800">
                <span className="text-[11px] font-semibold text-slate-300">Default Steps:</span>
                <input
                  type="text"
                  value={newStep1}
                  onChange={(e) => setNewStep1(e.target.value)}
                  placeholder="Step 1 instruction..."
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                />
                <input
                  type="text"
                  value={newStep2}
                  onChange={(e) => setNewStep2(e.target.value)}
                  placeholder="Step 2 instruction..."
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                />
                <input
                  type="text"
                  value={newStep3}
                  onChange={(e) => setNewStep3(e.target.value)}
                  placeholder="Step 3 instruction..."
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setNewModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-lg cursor-pointer"
                >
                  Create Guide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
