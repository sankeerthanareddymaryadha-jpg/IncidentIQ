import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types/incident';
import {
  Settings,
  Shield,
  Building2,
  Users,
  Lock,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { SEED_USERS } from '../data/seedData';

export const SettingsView: React.FC = () => {
  const {
    currentUser,
    switchRole,
    organizationName,
    setOrganizationName,
    incidents,
  } = useApp();

  const [requireConfirmation, setRequireConfirmation] = useState(true);
  const [allowAiSuggestions, setAllowAiSuggestions] = useState(true);
  const [dataRetentionDays, setDataRetentionDays] = useState(365);
  const [savedSettingsNotice, setSavedSettingsNotice] = useState(false);

  const handleSave = () => {
    setSavedSettingsNotice(true);
    setTimeout(() => setSavedSettingsNotice(false), 2500);
  };

  // Compile executed dangerous actions as audit trail
  const auditActions = incidents
    .flatMap((inc) =>
      inc.timeline
        .filter((t) => t.type === 'action_run')
        .map((t) => ({ ...t, incidentId: inc.id, service: inc.affectedService }))
    )
    .slice(0, 8);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-400" />
          <span>System Settings & Access Controls</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure role permissions, organization workspace isolation, and automated AI safety guardrails.
        </p>
      </div>

      {savedSettingsNotice && (
        <div className="bg-emerald-950/20 border border-emerald-500/30 p-3.5 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Security policies and organization settings successfully updated.</span>
        </div>
      )}

      {/* Role-Based Access Control Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5 shadow-sm text-xs">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Users className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-white">Active Role & Permissions</h2>
        </div>

        <p className="text-slate-300 text-xs">
          Select an active role to test access boundaries across Employee, Support/IT, and Admin personas:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SEED_USERS.map((usr) => {
            const isCurrent = currentUser.role === usr.role;

            return (
              <div
                key={usr.id}
                onClick={() => switchRole(usr.role)}
                className={`p-4 rounded-xl border cursor-pointer transition-colors space-y-2 ${
                  isCurrent
                    ? 'border-emerald-500/60 bg-emerald-950/10'
                    : 'border-slate-800 bg-slate-950 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white capitalize">{usr.role}</span>
                  {isCurrent && (
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      Active User
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-400">
                  <p className="text-slate-200 font-medium">{usr.name}</p>
                  <p>{usr.email}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 space-y-1">
                  {usr.role === 'employee' && (
                    <>
                      <p>✓ Report incidents in conversational UI</p>
                      <p>✓ View own incidents & chat with AI</p>
                      <p className="text-slate-500">✗ Cannot mark resolved or run safe restarts</p>
                    </>
                  )}
                  {usr.role === 'support' && (
                    <>
                      <p>✓ Triage & investigate incidents</p>
                      <p>✓ Execute runbooks & recommended actions</p>
                      <p>✓ Mark incidents resolved & save memory</p>
                    </>
                  )}
                  {usr.role === 'admin' && (
                    <>
                      <p>✓ Full organization admin authority</p>
                      <p>✓ Authorize dangerous production commands</p>
                      <p>✓ Manage fixing guides & memory bank</p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Organization Scope */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-sm text-xs">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Building2 className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-white">Organization Tenant Isolation</h2>
        </div>

        <p className="text-slate-300">
          All incidents, memory entries, and post-mortems are strictly bound to the organization scope.
        </p>

        <div>
          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
            Current Organization Workspace
          </label>
          <input
            type="text"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            className="w-full sm:w-80 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Production Safety Guardrails */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-sm text-xs">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Shield className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-white">Production Safety Guardrails (Section 8 & 18)</h2>
        </div>

        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={requireConfirmation}
              onChange={(e) => setRequireConfirmation(e.target.checked)}
              className="mt-0.5 accent-emerald-500 w-4 h-4 rounded"
            />
            <div>
              <p className="font-semibold text-white">
                Require human confirmation for all dangerous production actions
              </p>
              <p className="text-slate-400 text-[11px]">
                Enforces explicit dialog prompts (e.g. "⚠️ This action will restart the payment service") before running pod restarts or cache evictions.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={allowAiSuggestions}
              onChange={(e) => setAllowAiSuggestions(e.target.checked)}
              className="mt-0.5 accent-emerald-500 w-4 h-4 rounded"
            />
            <div>
              <p className="font-semibold text-white">
                Clearly label AI suggestions vs historical memories
              </p>
              <p className="text-slate-400 text-[11px]">
                Prevents the AI from hallucinating prior incident records when no exact match exists in the memory bank.
              </p>
            </div>
          </label>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
          >
            Save Security Policies
          </button>
        </div>
      </div>

      {/* Production Audit Trail */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-sm text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">Recent Execution Audit Trail</h2>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Immutable Log</span>
        </div>

        <div className="space-y-2">
          {auditActions.map((aud) => (
            <div
              key={aud.id}
              className="p-2.5 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-mono text-emerald-400 font-medium tabular-nums">{aud.time}</span>
                <span className="mx-2 text-slate-600">·</span>
                <span className="text-white font-medium">{aud.user}</span>
                <span className="mx-2 text-slate-600">·</span>
                <span className="text-slate-300">{aud.action}</span>
              </div>
              <span className="text-slate-500 text-[11px] font-mono">{aud.incidentId}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
