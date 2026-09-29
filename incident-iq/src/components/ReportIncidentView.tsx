import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { IncidentCategory, IncidentSeverity } from '../types/incident';
import {
  FileQuestion,
  Sparkles,
  ArrowRight,
  Globe,
  Smartphone,
  Server,
  Database,
  Cloud,
  HelpCircle,
  Paperclip,
  CheckCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const ReportIncidentView: React.FC = () => {
  const { reportNewIncident, isAiInvestigating } = useApp();

  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IncidentCategory>('website');
  const [severity, setSeverity] = useState<IncidentSeverity>('medium');

  // Optional details toggle
  const [showOptionalDetails, setShowOptionalDetails] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [affectedUsers, setAffectedUsers] = useState('');
  const [startTime, setStartTime] = useState('Just now (last 10 minutes)');
  const [attachmentName, setAttachmentName] = useState('');

  // Sample presets for quick testing
  const loadPreset = (preset: 'payment' | 'database' | 'api' | 'mobile') => {
    if (preset === 'payment') {
      setDescription('Customers on the checkout page are seeing "500 Internal Error" and cards are failing to charge. The payment webhook queue has over 200 pending transactions.');
      setCategory('payment');
      setSeverity('critical');
      setServiceName('Payment Service');
      setAffectedUsers('All customers trying to complete checkout');
    } else if (preset === 'database') {
      setDescription('Database CPU spiked to 98% and read queries from all microservices are timing out. Looks like transactions are queuing on table locks.');
      setCategory('database');
      setSeverity('critical');
      setServiceName('PostgreSQL Main Cluster');
      setAffectedUsers('Platform-wide read and write operations');
    } else if (preset === 'api') {
      setDescription('API Gateway is returning 504 Gateway Timeout on /api/v1/search and product listings. Ingress latency is over 3,000ms.');
      setCategory('api');
      setSeverity('high');
      setServiceName('API Gateway & Ingress');
      setAffectedUsers('Approximately 20% of website search visitors');
    } else if (preset === 'mobile') {
      setDescription('The mobile app crashes immediately on launch for iOS users after clicking the cart icon.');
      setCategory('mobile_app');
      setSeverity('high');
      setServiceName('iOS Mobile Client');
      setAffectedUsers('iOS users on build v4.2.1');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || isAiInvestigating) return;

    const title = description.length > 60 ? description.slice(0, 57) + '...' : description;

    await reportNewIncident({
      title,
      description,
      category,
      severity,
      affectedService: serviceName.trim() || undefined,
      affectedUsers: affectedUsers.trim() || undefined,
      attachments: attachmentName ? [{ name: attachmentName, size: '240 KB', type: 'text/log' }] : [],
    });
  };

  const categories: { id: IncidentCategory; label: string; icon: any }[] = [
    { id: 'website', label: 'Website', icon: Globe },
    { id: 'mobile_app', label: 'Mobile App', icon: Smartphone },
    { id: 'server', label: 'Server', icon: Server },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'api', label: 'API', icon: Cloud },
    { id: 'other', label: 'Other', icon: HelpCircle },
  ];

  const severities: { id: IncidentSeverity; label: string; badge: string; desc: string }[] = [
    { id: 'low', label: 'Low', badge: '🟢', desc: 'Minor issue, workarounds available' },
    { id: 'medium', label: 'Medium', badge: '🟡', desc: 'Performance degradation or isolated problem' },
    { id: 'high', label: 'High', badge: '🟠', desc: 'Major feature broken for multiple users' },
    { id: 'critical', label: 'Critical', badge: '🔴', desc: 'Outage! Core system down or revenue stopped' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 items-center justify-center text-emerald-400 mb-2">
          <FileQuestion className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">Report an Incident</h1>
        <p className="text-xs text-slate-400 mt-1">
          Tell us what went wrong. The AI agent will search past incidents and guide the fix.
        </p>
      </div>

      {/* Preset demo triggers */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
        <p className="text-[11px] font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Quick Scenario Presets (click to autofill & test memory matching):</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => loadPreset('payment')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            💳 Payment 500 Outage
          </button>
          <button
            type="button"
            onClick={() => loadPreset('database')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            🗄️ Database CPU & Lock Jam
          </button>
          <button
            type="button"
            onClick={() => loadPreset('api')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            ⚡ API 504 Timeout
          </button>
          <button
            type="button"
            onClick={() => loadPreset('mobile')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            📱 Mobile App Crash
          </button>
        </div>
      </div>

      {/* Conversational Report Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-sm">
        {/* Question 1: What happened? */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            What happened?
          </label>
          <textarea
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us what went wrong... (e.g. Customers cannot complete card payments on checkout. We are seeing 500 errors and webhook timeouts.)"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition-colors"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Plain language is best. You do not need to diagnose the cause yet — the AI agent will do that.
          </p>
        </div>

        {/* Question 2: Where did it happen? */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Where did it happen?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-3 rounded-lg border text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300 font-semibold'
                      : 'border-slate-800 bg-slate-950 hover:bg-slate-850 text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question 3: How serious is the problem? */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            How serious is the problem?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {severities.map((sev) => {
              const isSelected = severity === sev.id;
              return (
                <button
                  key={sev.id}
                  type="button"
                  onClick={() => setSeverity(sev.id)}
                  className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500/60 bg-emerald-500/10 text-white'
                      : 'border-slate-800 bg-slate-950 hover:bg-slate-850 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span>{sev.badge}</span>
                    <span className="text-xs font-semibold text-white">{sev.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{sev.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Information Accordion */}
        <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/60">
          <button
            type="button"
            onClick={() => setShowOptionalDetails(!showOptionalDetails)}
            className="w-full px-4 py-3 text-xs font-medium text-slate-300 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
          >
            <span>Additional optional details (service name, start time, screenshot/log)</span>
            {showOptionalDetails ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {showOptionalDetails && (
            <div className="p-4 pt-1 space-y-3 border-t border-slate-800 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Which specific service is affected? (optional)
                </label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="e.g. payment-service, postgres-primary, auth-redis"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Who or how many are affected? (optional)
                </label>
                <input
                  type="text"
                  value={affectedUsers}
                  onChange={(e) => setAffectedUsers(e.target.value)}
                  placeholder="e.g. ~500 users at checkout, internal admins, all mobile traffic"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  When did it start? (optional)
                </label>
                <input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="e.g. 10 minutes ago, 09:15 AM UTC"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Attachment / Error Log / Screenshot (optional)
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={attachmentName}
                      onChange={(e) => setAttachmentName(e.target.value)}
                      placeholder="Paste log snippet filename (e.g. knex_pool_error.log)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-emerald-500"
                    />
                    <Paperclip className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachmentName('error_trace_dump.log')}
                    className="px-3 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer"
                  >
                    Attach Log
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!description.trim() || isAiInvestigating}
          className={`w-full py-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors ${
            !description.trim() || isAiInvestigating
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
          }`}
        >
          {isAiInvestigating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>AI Agent is analyzing symptoms & searching memory...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Start AI Investigation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
