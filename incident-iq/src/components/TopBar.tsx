import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types/incident';
import {
  ShieldAlert,
  Plus,
  Home,
  FileQuestion,
  History,
  BookOpen,
  Brain,
  Settings,
  ChevronDown,
  LogOut,
  Building2,
  Sparkles,
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const {
    currentUser,
    switchRole,
    logout,
    activeTab,
    setActiveTab,
    organizationName,
    setOrganizationName,
  } = useApp();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [orgModalOpen, setOrgModalOpen] = useState(false);

  const navItems = [
    { key: 'dashboard', label: 'Home', icon: Home },
    { key: 'report', label: 'Report Incident', icon: FileQuestion },
    { key: 'history', label: 'History', icon: History },
    { key: 'runbooks', label: 'Fixing Guides', icon: BookOpen },
    { key: 'memory', label: 'Agent Memory', icon: Brain },
    { key: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 font-bold tracking-tight text-white hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span className="text-base font-semibold">Incident IQ</span>
            </button>
            <button
              onClick={() => setOrgModalOpen(true)}
              className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 pl-3 border-l border-slate-800 transition-colors cursor-pointer"
              title="Change Organization"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span className="truncate max-w-[150px]">{organizationName}</span>
            </button>
          </div>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 text-emerald-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Quick Report button */}
            <button
              onClick={() => setActiveTab('report')}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-3 py-1.5 rounded-md text-xs transition-colors shadow-sm cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Report Incident</span>
            </button>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-300 transition-colors cursor-pointer"
                title="Current Role Switcher"
              >
                <div className="w-5 h-5 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-[10px] font-bold text-emerald-400">
                  {currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col text-left leading-none">
                  <span className="font-medium text-slate-200 truncate max-w-[90px]">{currentUser.name}</span>
                  <span className="text-[10px] text-emerald-400 capitalize">{currentUser.role}</span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-2 z-50 text-slate-200">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-xs font-semibold text-slate-200">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400">
                      <Sparkles className="w-3 h-3" />
                      <span>Role: {currentUser.role.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Switch Test Role:
                  </div>

                  {(['employee', 'support', 'admin'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        switchRole(r);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors cursor-pointer ${
                        currentUser.role === r ? 'text-emerald-400 font-semibold' : 'text-slate-300'
                      }`}
                    >
                      <span className="capitalize">{r === 'employee' ? 'Employee / Reporter' : r === 'support' ? 'Support / IT Responder' : 'Admin'}</span>
                      {currentUser.role === r && <span className="text-[10px] text-emerald-400">Active</span>}
                    </button>
                  ))}

                  <div className="border-t border-slate-800 mt-2 pt-1">
                    <button
                      onClick={() => {
                        setRoleDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile secondary navigation */}
        <div className="md:hidden border-t border-slate-800 px-2 py-1.5 flex items-center justify-around overflow-x-auto gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`flex flex-col items-center gap-1 px-2.5 py-1 text-[10px] rounded transition-colors whitespace-nowrap cursor-pointer ${
                  isActive ? 'text-emerald-400 font-medium' : 'text-slate-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Organization Switcher Modal */}
      {orgModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              Organization Isolation Scope
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Incidents and agent memories are strictly partitioned per organization. Switch workspace to verify tenant data isolation.
            </p>

            <div className="space-y-2 mb-6">
              {[
                'Acme Payments & Cloud Platform',
                'Acme Health Systems (HIPAA)',
                'Acme Staging & Sandbox',
              ].map((org) => (
                <button
                  key={org}
                  onClick={() => {
                    setOrganizationName(org);
                    setOrgModalOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    organizationName === org
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300 font-semibold'
                      : 'border-slate-800 bg-slate-850 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <span>{org}</span>
                  {organizationName === org && <span className="text-[11px] text-emerald-400">Selected</span>}
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setOrgModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-md transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
