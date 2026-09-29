import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Incident } from '../types/incident';
import { CheckCircle2, Sparkles, BookOpen, Clock, AlertCircle } from 'lucide-react';

interface ResolutionModalProps {
  incident: Incident;
  onClose: () => void;
}

export const ResolutionModal: React.FC<ResolutionModalProps> = ({ incident, onClose }) => {
  const { resolveIncident, runbooks, setActiveTab, setSelectedIncidentId } = useApp();

  const [rootCause, setRootCause] = useState(
    incident.rootCause || 'Database connection pool was exhausted due to an unindexed query holding connections.'
  );
  const [resolutionNotes, setResolutionNotes] = useState(
    incident.resolutionNotes || 'Checked active connection pool, scaled pool limit to 100, and performed rolling restart of service pods.'
  );
  const [runbookUsedTitle, setRunbookUsedTitle] = useState(
    incident.runbookUsedTitle || (runbooks.length > 0 ? runbooks[0].title : 'Payment Service Recovery')
  );
  const [durationMinutes, setDurationMinutes] = useState(12);
  const [failedApproaches, setFailedApproaches] = useState(
    'Initial attempt to restart downstream webhook listener did not free up database connections.'
  );
  const [additionalNotes, setAdditionalNotes] = useState(
    'Traffic restored to normal 99.8% baseline. Proactive alerts configured.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const failedList = failedApproaches
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    await resolveIncident(incident.id, {
      rootCause,
      resolutionNotes,
      runbookUsedTitle,
      durationMinutes,
      failedApproaches: failedList,
    });

    setIsSubmitting(false);
    onClose();
    setSelectedIncidentId(incident.id);
    setActiveTab('post-mortem');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-xl max-w-xl w-full p-6 text-slate-100 shadow-2xl space-y-5 my-8">
        {/* Banner */}
        <div className="text-center pb-3 border-b border-slate-800">
          <div className="inline-flex w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 items-center justify-center text-emerald-400 mb-2">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            🎉 Incident Resolved
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Record resolution details to teach the AI Agent Memory and generate the Post-Mortem.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Question 1: What was the root cause? */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              What was the root cause? ("Why did this happen?")
            </label>
            <textarea
              rows={2}
              required
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              placeholder="e.g. Database connection pool was exhausted due to an unindexed batch query."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
            />
          </div>

          {/* Question 2: What fixed the problem? */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              What fixed the problem? ("Steps that fixed it")
            </label>
            <textarea
              rows={2}
              required
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g. Checked connections, increased pool size to 100, and performed rolling restart."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Runbook Used */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Which fixing guide (runbook) was used?
              </label>
              <select
                value={runbookUsedTitle}
                onChange={(e) => setRunbookUsedTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white outline-none focus:border-emerald-500"
              >
                {runbooks.map((rb) => (
                  <option key={rb.id} value={rb.title}>
                    {rb.title}
                  </option>
                ))}
                <option value="Custom Ad-Hoc Procedure">Custom Ad-Hoc Procedure</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                How long did resolution take? (minutes)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={1440}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white tabular-nums outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-2 text-[11px] text-slate-500">min</span>
              </div>
            </div>
          </div>

          {/* Did any suggested solution fail? */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Did any suggested solution fail or not work? (saves to memory to avoid repeating)</span>
            </label>
            <textarea
              rows={2}
              value={failedApproaches}
              onChange={(e) => setFailedApproaches(e.target.value)}
              placeholder="e.g. Restarting the webhook worker didn't work because the issue was in the primary database pool."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Additional Notes & Preventative Thoughts
            </label>
            <input
              type="text"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="e.g. Need to configure pgbouncer reserve pool."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white bg-slate-850 hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-lg flex items-center gap-2 cursor-pointer shadow-md transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving to Agent Memory...' : 'Save to Memory & View Post-Mortem'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
