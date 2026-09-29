import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Incident, IncidentStatus, RecommendedAction } from '../types/incident';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Play,
  ExternalLink,
  Send,
  Loader2,
  FileCheck,
  ChevronRight,
  HelpCircle,
  Activity,
  Bot,
  User,
  BookOpen,
} from 'lucide-react';
import { ResolutionModal } from './ResolutionModal';

export const InvestigationView: React.FC = () => {
  const {
    incidents,
    selectedIncidentId,
    setActiveTab,
    runAction,
    isSimulatingAction,
    updateIncidentStatus,
    chatMessages,
    sendIncidentChatMessage,
    currentUser,
    setViewHistoricalModalIncident,
    setSelectedIncidentId,
  } = useApp();

  const [dangerousModalAction, setDangerousModalAction] = useState<RecommendedAction | null>(null);
  const [resolutionModalOpen, setResolutionModalOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [expandedActionId, setExpandedActionId] = useState<string | null>(null);

  const incident = incidents.find((i) => i.id === selectedIncidentId) || incidents[0];

  if (!incident) {
    return (
      <div className="p-12 text-center text-slate-400">
        <p>No active incident selected.</p>
        <button
          onClick={() => setActiveTab('dashboard')}
          className="mt-3 px-4 py-2 bg-emerald-500 text-slate-950 font-semibold text-xs rounded-lg cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Find similar incident from memory
  const similarIncident = incidents.find(
    (i) => incident.similarIncidentIds && incident.similarIncidentIds.includes(i.id)
  );

  const timelineSteps: { key: IncidentStatus; label: string }[] = [
    { key: 'reported', label: 'Reported' },
    { key: 'investigating', label: 'Investigating' },
    { key: 'fix_applied', label: 'Fix Applied' },
    { key: 'monitoring', label: 'Monitoring' },
    { key: 'resolved', label: 'Resolved' },
    { key: 'closed', label: 'Closed' },
  ];

  const currentStepIdx = timelineSteps.findIndex((s) => s.key === incident.status);

  const handleActionClick = (action: RecommendedAction) => {
    if (action.status === 'completed') return;

    if (action.isDangerous) {
      setDangerousModalAction(action);
    } else {
      runAction(incident.id, action.id);
    }
  };

  const handleConfirmDangerousAction = async () => {
    if (!dangerousModalAction) return;
    const actionToRun = dangerousModalAction;
    setDangerousModalAction(null);
    await runAction(incident.id, actionToRun.id);
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSendingChat) return;

    const text = chatInput.trim();
    setChatInput('');
    setIsSendingChat(true);
    await sendIncidentChatMessage(incident.id, text);
    setIsSendingChat(false);
  };

  const currentMessages = chatMessages[incident.id] || [];

  return (
    <div className="space-y-6">
      {/* Top Header & Visual Status Pipeline */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span className="font-mono text-emerald-400 font-semibold">{incident.id}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-300 font-medium">{incident.affectedService}</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize text-rose-400 font-semibold">{incident.severity} SEVERITY</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">{incident.title}</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">{incident.description}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {incident.status !== 'resolved' && incident.status !== 'closed' ? (
              <button
                onClick={() => setResolutionModalOpen(true)}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 rounded-lg text-xs transition-colors shadow-sm cursor-pointer whitespace-nowrap"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Incident as Resolved</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setSelectedIncidentId(incident.id);
                  setActiveTab('post-mortem');
                }}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 font-semibold px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer whitespace-nowrap"
              >
                <FileCheck className="w-4 h-4" />
                <span>View Post-Mortem</span>
              </button>
            )}
          </div>
        </div>

        {/* Visual Timeline Pipeline */}
        <div className="pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between overflow-x-auto pb-1 gap-2">
            {timelineSteps.map((step, idx) => {
              const isPassed = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div key={step.key} className="flex items-center gap-2 shrink-0">
                  <div
                    onClick={() => {
                      if (currentUser.role !== 'employee') {
                        updateIncidentStatus(incident.id, step.key);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                      isCurrent
                        ? 'bg-emerald-500 text-slate-950 font-semibold shadow-xs'
                        : isPassed
                        ? 'bg-slate-850 text-slate-200 border border-slate-700'
                        : 'bg-slate-950 text-slate-500 border border-slate-850'
                    }`}
                    title={currentUser.role !== 'employee' ? `Advance status to ${step.label}` : undefined}
                  >
                    {isPassed ? (
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isCurrent ? 'text-slate-950' : 'text-emerald-400'}`} />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />
                    )}
                    <span>{step.label}</span>
                  </div>
                  {idx < timelineSteps.length - 1 && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden sm:block" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: 2 columns on desktop (Investigation & Runbooks on left, AI Agent Chat & Timeline on right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Similar Incidents + Recommended Actions */}
        <div className="lg:col-span-7 space-y-6">
          {/* SECTION 7: Similar Historical Incidents Found */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <Sparkles className="w-4 h-4" />
                <span>🔎 Similar Historical Incident Found</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Agent Memory Bank</span>
            </div>

            {similarIncident ? (
              <div className="bg-slate-950 border border-emerald-500/30 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {similarIncident.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Service: <span className="text-slate-300 font-medium">{similarIncident.affectedService}</span> · Resolved in {similarIncident.durationMinutes || 12} minutes
                    </p>
                  </div>
                  <button
                    onClick={() => setViewHistoricalModalIncident(similarIncident)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 rounded-md transition-colors cursor-pointer shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                    <span>View Incident</span>
                  </button>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="text-slate-400 font-medium">Why did this happen (Root Cause):</div>
                  <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800 text-slate-200">
                    {similarIncident.rootCause || 'Database connection pool was exhausted due to unindexed queries.'}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="text-slate-400 font-medium">What fixed it:</div>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
                    <li>Checked database connection metrics</li>
                    <li>Increased connection pool size buffer</li>
                    <li>Executed rolling restart of the service pods</li>
                    <li>Monitored service latency for 5 minutes</li>
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <span>Result: <span className="text-emerald-400 font-semibold">Resolved in 12 minutes</span></span>
                  <span className="text-slate-500">Known from previous incidents</span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs text-slate-400">
                <p className="italic">
                  «"I couldn't find an exact close match in previous incidents. I'll help you investigate this as a new incident."»
                </p>
                <p className="mt-2 text-[11px] text-slate-500">
                  The agent will record this incident upon resolution so future occurrences will automatically match.
                </p>
              </div>
            )}
          </div>

          {/* SECTION 8: Recommended Actions ("🤖 What should we do now?") */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-emerald-400" />
                  <span>What should we do now?</span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  AI-recommended remediation steps. Dangerous production actions require explicit confirmation.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {incident.recommendedActions.map((action, idx) => {
                const isCompleted = action.status === 'completed';
                const isExpanded = expandedActionId === action.id;

                return (
                  <div
                    key={action.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      isCompleted
                        ? 'border-emerald-500/30 bg-emerald-950/10'
                        : action.isDangerous
                        ? 'border-amber-500/40 bg-slate-950/80'
                        : 'border-slate-800 bg-slate-950/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-[11px] font-bold text-slate-300 flex items-center justify-center tabular-nums">
                            {idx + 1}
                          </span>
                          <h3 className="text-xs font-semibold text-white">
                            {action.title}
                          </h3>
                          {action.isDangerous && (
                            <span className="text-[10px] text-amber-400 font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                              Production Action
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Completed
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300 pl-7">
                          {action.description}
                        </p>

                        <div className="text-[11px] text-slate-400 pl-7 space-y-0.5 pt-1">
                          <p>
                            <span className="text-slate-500 font-medium">Why recommended:</span>{' '}
                            <span className="text-slate-300">{action.whyRecommended}</span>
                          </p>
                          {action.previousSuccessHistory && (
                            <p>
                              <span className="text-slate-500 font-medium">Past history:</span>{' '}
                              <span className="text-emerald-400">{action.previousSuccessHistory}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <button
                          onClick={() => handleActionClick(action)}
                          disabled={isCompleted || isSimulatingAction}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            isCompleted
                              ? 'bg-slate-800 text-slate-500 cursor-default'
                              : action.isDangerous
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
                              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm'
                          }`}
                        >
                          {isSimulatingAction ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Play className="w-3 h-3" />
                          )}
                          <span>{isCompleted ? 'Finished' : action.isDangerous ? 'Review & Run' : 'Run Action'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setExpandedActionId(isExpanded ? null : action.id)}
                          className="text-[10px] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                        >
                          {isExpanded ? 'Hide instructions' : 'View instructions'}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Instructions & Execution Result */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-800 pl-7 space-y-2 text-xs">
                        <div className="text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800">
                          <span className="font-semibold text-slate-200">Execution Instructions:</span>
                          <p className="mt-1 font-mono text-[11px] text-slate-300">
                            {action.instructions}
                          </p>
                        </div>
                        {action.runbookId && (
                          <div className="flex items-center justify-between text-[11px] pt-1">
                            <span className="text-slate-400">Associated runbook available.</span>
                            <button
                              onClick={() => setActiveTab('runbooks')}
                              className="text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <BookOpen className="w-3 h-3" />
                              <span>Open Runbook Checklist</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {action.executionResult && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800 pl-7 text-[11px]">
                        <span className="text-emerald-400 font-medium">Output Log:</span>
                        <pre className="mt-1 font-mono bg-slate-950 p-2 rounded text-slate-300 overflow-x-auto text-[10px] border border-slate-850">
                          {action.executionResult}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive AI Support Engineer Chat & Visual Timeline */}
        <div className="lg:col-span-5 space-y-6">
          {/* Interactive AI Chat Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col h-[480px]">
            {/* Chat Header */}
            <div className="p-3.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">Incident IQ</h3>
                  <p className="text-[10px] text-slate-400">Active assistant on {incident.id}</p>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Ready to assist" />
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-slate-950">
              {currentMessages.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  No conversation messages yet.
                </div>
              ) : (
                currentMessages.map((msg) => {
                  const isAi = msg.sender === 'ai';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}
                    >
                      {isAi && (
                        <div className="w-6 h-6 rounded-md bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div
                        className={`p-3 rounded-lg max-w-[85%] whitespace-pre-wrap leading-relaxed ${
                          isAi
                            ? 'bg-slate-900 border border-slate-800 text-slate-200'
                            : 'bg-emerald-600 text-slate-950 font-medium'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <div
                          className={`text-[9px] mt-1 text-right tabular-nums ${
                            isAi ? 'text-slate-500' : 'text-slate-900/70'
                          }`}
                        >
                          {msg.timestamp}
                        </div>
                      </div>
                      {!isAi && (
                        <div className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                          <User className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="p-2.5 bg-slate-900 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask agent: 'What next?', or share diagnostic output..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isSendingChat}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center cursor-pointer transition-colors ${
                  !chatInput.trim() || isSendingChat
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                }`}
              >
                {isSendingChat ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </form>
          </div>

          {/* Incident Timeline */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-sm">
            <h3 className="text-xs font-semibold text-white flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Incident Event Timeline</span>
            </h3>

            <div className="space-y-3 relative pl-4 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {incident.timeline.map((evt) => (
                <div key={evt.id} className="relative text-xs space-y-0.5">
                  <div className="absolute -left-[17px] top-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-slate-900" />
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="font-mono text-slate-300 font-medium tabular-nums">{evt.time}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-200">{evt.user}</span>
                  </div>
                  <p className="font-medium text-white">{evt.action}</p>
                  <p className="text-[11px] text-slate-400">{evt.result}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* DANGEROUS ACTION SAFETY CONFIRMATION MODAL */}
      {dangerousModalAction && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/50 rounded-xl max-w-md w-full p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Production Safety Guard</h3>
                <p className="text-[11px] text-amber-400">Human confirmation required</p>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-2">
              <p className="font-semibold text-white">
                {dangerousModalAction.dangerousConfirmationText || `⚠️ This action will restart ${incident.affectedService}.`}
              </p>
              <p className="text-slate-400 text-[11px]">
                Incident IQ will never alter production or restart infrastructure without your explicit authorization.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDangerousModalAction(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-850 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDangerousAction}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Confirm & Run Action</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESOLUTION MODAL */}
      {resolutionModalOpen && (
        <ResolutionModal
          incident={incident}
          onClose={() => setResolutionModalOpen(false)}
        />
      )}
    </div>
  );
};
