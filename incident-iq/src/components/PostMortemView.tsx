import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PostMortem } from '../types/incident';
import {
  FileCheck,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  ArrowLeft,
  Loader2,
  Share2,
  AlertTriangle,
  Plus,
  Trash2,
} from 'lucide-react';

export const PostMortemView: React.FC = () => {
  const {
    incidents,
    selectedIncidentId,
    setActiveTab,
    savePostMortem,
    approvePostMortem,
    generateAiPostMortem,
    currentUser,
  } = useApp();

  const incident = incidents.find((i) => i.id === selectedIncidentId) || incidents[0];

  const defaultPostMortem: PostMortem = incident?.postMortem || {
    id: `pm-${Date.now()}`,
    incidentId: incident?.id || 'INC-2026-088',
    summary: `${incident?.title || 'Incident'} caused customer service degradation before recovery steps were executed.`,
    impact: incident?.affectedUsers || 'Customers experienced timeouts during checkout.',
    rootCause: incident?.rootCause || 'Database connection pool was exhausted due to concurrent unindexed queries.',
    resolution: incident?.resolutionNotes || 'Increased connection pool to 100 and cycled service pods via rolling restart.',
    whatWentWell: [
      'AI Incident Agent quickly matched symptoms to historical incident within 2 minutes',
      'Runbook steps were executed in sequence without downtime',
      'Team communicated updates clearly in incident timeline',
    ],
    whatDidNotWork: [
      'Early connection pool utilization alert fired at 95% instead of 80%',
      'Analytic queries had direct access to transactional primary database',
    ],
    preventiveActions: [
      'Add strict 5-second statement_timeout on all payment connections',
      'Route analytical bulk reads to dedicated read replica',
      'Increase base connection pool reserve buffer to 80',
    ],
    lessonsLearned: [
      'Payment service must maintain an isolated database pool separate from general app queries.',
    ],
    approved: false,
    updatedAt: new Date().toISOString(),
  };

  const [formData, setFormData] = useState<PostMortem>(defaultPostMortem);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!incident) {
    return (
      <div className="p-12 text-center text-slate-400">
        <p>No incident selected for post-mortem.</p>
        <button
          onClick={() => setActiveTab('dashboard')}
          className="mt-3 px-4 py-2 bg-emerald-500 text-slate-950 font-semibold text-xs rounded-lg cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleRegenerateAi = async () => {
    setIsGenerating(true);
    const generated = await generateAiPostMortem(incident.id);
    if (generated) {
      setFormData(generated);
    }
    setIsGenerating(false);
  };

  const handleSave = () => {
    savePostMortem(incident.id, formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleApprove = () => {
    approvePostMortem(incident.id);
    setFormData((prev) => ({
      ...prev,
      approved: true,
      approvedBy: `${currentUser.name} (${currentUser.role})`,
    }));
  };

  const handleAddBullet = (field: 'whatWentWell' | 'whatDidNotWork' | 'preventiveActions' | 'lessonsLearned') => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], 'New item...'],
    }));
  };

  const handleUpdateBullet = (
    field: 'whatWentWell' | 'whatDidNotWork' | 'preventiveActions' | 'lessonsLearned',
    idx: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === idx ? value : item)),
    }));
  };

  const handleRemoveBullet = (
    field: 'whatWentWell' | 'whatDidNotWork' | 'preventiveActions' | 'lessonsLearned',
    idx: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== idx),
    }));
  };

  const copyAsMarkdown = () => {
    const md = `# Post-Mortem: ${incident.title} (${incident.id})
**Service:** ${incident.affectedService}
**Duration:** ${incident.durationMinutes || 15} minutes
**Date:** ${new Date().toLocaleDateString()}
**Status:** ${formData.approved ? 'Approved by ' + formData.approvedBy : 'Draft'}

## 1. Incident Summary
${formData.summary}

## 2. Impact
${formData.impact}

## 3. Root Cause ("Why did this happen?")
${formData.rootCause}

## 4. Resolution ("Steps that fixed it")
${formData.resolution}

## 5. What Went Well
${formData.whatWentWell.map((w) => `- ${w}`).join('\n')}

## 6. What Did Not Work
${formData.whatDidNotWork.map((w) => `- ${w}`).join('\n')}

## 7. Preventive Actions
${formData.preventiveActions.map((w) => `- ${w}`).join('\n')}

## 8. Lessons Learned
${formData.lessonsLearned.map((w) => `- ${w}`).join('\n')}
`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
        <div>
          <button
            onClick={() => setActiveTab('investigation')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Incident Investigation</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">Post-Mortem Report</h1>
            {formData.approved ? (
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                Approved
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                Draft (Editable)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {incident.id} · {incident.title} · Resolved in {incident.durationMinutes || 12} min
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRegenerateAi}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-medium text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
            <span>Regenerate with AI</span>
          </button>

          <button
            onClick={copyAsMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-medium text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied MD' : 'Copy Markdown'}</span>
          </button>

          <button
            onClick={handleSave}
            className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            {savedSuccess ? 'Saved!' : 'Save Draft'}
          </button>

          {!formData.approved && (
            <button
              onClick={handleApprove}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve & Finalize</span>
            </button>
          )}
        </div>
      </div>

      {formData.approved && (
        <div className="bg-emerald-950/20 border border-emerald-500/30 p-3.5 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>This post-mortem was approved by <strong>{formData.approvedBy}</strong> and synced to the Agent Memory Bank for future incident guidance.</span>
        </div>
      )}

      {/* Form sections */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-sm text-xs">
        {/* Section 1: Incident Summary */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-1.5">
            1. Incident Summary
          </label>
          <textarea
            rows={3}
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
          />
        </div>

        {/* Section 2: Impact */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-1.5">
            2. Customer & System Impact
          </label>
          <textarea
            rows={2}
            value={formData.impact}
            onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
          />
        </div>

        {/* Section 3: Root Cause */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-1.5">
            3. Root Cause ("Why did this happen?")
          </label>
          <textarea
            rows={3}
            value={formData.rootCause}
            onChange={(e) => setFormData({ ...formData, rootCause: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
          />
        </div>

        {/* Section 4: Resolution */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-1.5">
            4. Resolution ("Steps that fixed the problem")
          </label>
          <textarea
            rows={3}
            value={formData.resolution}
            onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
          />
        </div>

        {/* Section 5: What Went Well */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-200">
              5. What Went Well
            </label>
            <button
              type="button"
              onClick={() => handleAddBullet('whatWentWell')}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add item</span>
            </button>
          </div>
          <div className="space-y-2">
            {formData.whatWentWell.map((bullet, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={bullet}
                  onChange={(e) => handleUpdateBullet('whatWentWell', idx, e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveBullet('whatWentWell', idx)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: What Did Not Work */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-200">
              6. What Did Not Work
            </label>
            <button
              type="button"
              onClick={() => handleAddBullet('whatDidNotWork')}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add item</span>
            </button>
          </div>
          <div className="space-y-2">
            {formData.whatDidNotWork.map((bullet, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={bullet}
                  onChange={(e) => handleUpdateBullet('whatDidNotWork', idx, e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveBullet('whatDidNotWork', idx)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 7: Preventive Actions */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-200">
              7. Preventive Actions (Safeguards)
            </label>
            <button
              type="button"
              onClick={() => handleAddBullet('preventiveActions')}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add action</span>
            </button>
          </div>
          <div className="space-y-2">
            {formData.preventiveActions.map((bullet, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={bullet}
                  onChange={(e) => handleUpdateBullet('preventiveActions', idx, e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveBullet('preventiveActions', idx)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 8: Lessons Learned */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-200">
              8. Lessons Learned
            </label>
            <button
              type="button"
              onClick={() => handleAddBullet('lessonsLearned')}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add lesson</span>
            </button>
          </div>
          <div className="space-y-2">
            {formData.lessonsLearned.map((bullet, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={bullet}
                  onChange={(e) => handleUpdateBullet('lessonsLearned', idx, e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveBullet('lessonsLearned', idx)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
