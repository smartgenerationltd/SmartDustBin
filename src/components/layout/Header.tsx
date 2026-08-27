import React, { useState } from 'react';
import { useSmartBin } from '../../context/SmartBinContext';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { SMARTBIN_LOGO } from '../../assets/branding';
import {
  Bell,
  Search,
  ShieldCheck,
  RefreshCw,
  Sliders,
  ChevronDown,
  Sparkles,
  Radio,
  Trash2,
  CheckCircle2,
  LogOut,
  Database,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const {
    currentRole,
    unreadAlertsCount,
    collectionRequiredBinsCount,
    setCurrentTab,
    searchQuery,
    setSearchQuery,
    isDemoMode,
    simulationActive,
    setSimulationActive,
    resetToInitialData,
    dbBackendName,
    isSyncing,
  } = useSmartBin();

  const { userProfile, loginWithDemoRole, logout } = useAuth();
  const currentUser = userProfile || {
    name: 'Gisa Niyomugabo',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    role: currentRole,
  };

  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const roles: { role: UserRole; title: string; desc: string }[] = [
    { role: 'ADMIN', title: 'Administrator', desc: 'Full System, IoT & Firebase Control' },
    { role: 'OPERATOR', title: 'Waste Operator', desc: 'Real-time telemetry & dispatch' },
    { role: 'COLLECTOR', title: 'Route Collector', desc: 'Assigned collections & clearance' },
    { role: 'ADVERTISER', title: 'Brand Advertiser', desc: 'LED campaign manager & analytics' },
    { role: 'VIEWER', title: 'Public/Auditor', desc: 'Read-only municipal oversight' },
  ];

  return (
    <header id="app-header" className="sticky top-0 z-30 bg-[#0A0F17]/90 backdrop-blur-md border-b border-slate-800 text-slate-200">
      {/* Top Tagline & Telemetry Status Bar */}
      <div className="bg-[#070B12] border-b border-slate-800/70 px-4 sm:px-8 py-1.5 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold tracking-widest text-[10px] text-emerald-400">
            SMART WASTE • CLEAN CITIES • SMART AFRICA
          </span>
          <span className="text-slate-700 hidden md:inline">|</span>
          <span className="text-slate-400 hidden md:inline text-[10px] uppercase tracking-wider font-mono">
            Region: East Africa • Kigali Hub • <strong className="text-slate-300">SG AI Agency</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span
            id="backend-badge"
            className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1.5"
          >
            <Database className="w-3 h-3 text-emerald-400" />
            {dbBackendName.toUpperCase()}
          </span>

          {isDemoMode && (
            <span
              id="demo-data-badge"
              className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-bold tracking-tight flex items-center gap-1.5"
            >
              <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
              DEMO MODE
            </span>
          )}

          <button
            onClick={() => setSimulationActive(!simulationActive)}
            title={simulationActive ? 'Pause IoT Simulation' : 'Resume IoT Simulation'}
            className="text-[10px] text-slate-400 hover:text-slate-200 font-mono hidden sm:inline cursor-pointer"
          >
            IoT Tick: <span className={simulationActive ? 'text-emerald-400 font-bold' : 'text-slate-500'}>{simulationActive ? 'ON' : 'PAUSED'}</span>
          </button>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="px-4 sm:px-8 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Brand & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            id="btn-sidebar-toggle"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <div
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <img
              src={SMARTBIN_LOGO}
              alt="SG SmartBin Logo"
              referrerPolicy="no-referrer"
              className="h-8 w-8 rounded-lg object-cover border border-emerald-500/40 shadow-md shadow-emerald-500/20 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  SMARTBIN
                </h1>
                <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-semibold">
                  KIGALI IoT
                </span>
              </div>
              <p className="text-[9px] font-medium text-emerald-500/80 tracking-widest leading-none hidden sm:block">
                AI WASTE &amp; DIGITAL ADS PLATFORM
              </p>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-2">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search SmartBins by ID, district, or avenue..."
              className="w-full bg-[#070B12]/80 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-sans transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Right: Quick Actions & Profile */}
        <div className="flex items-center gap-2.5">
          {/* AI Quick Button */}
          <button
            id="btn-quick-ai"
            onClick={() => setCurrentTab('ai')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-300 hover:bg-indigo-500/20 text-xs font-semibold transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Operations</span>
          </button>

          {/* Urgent Queue Badge */}
          {collectionRequiredBinsCount > 0 && (
            <button
              id="btn-quick-collections"
              onClick={() => setCurrentTab('collections')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 hover:bg-rose-500/20 text-xs font-bold font-mono transition-all animate-pulse cursor-pointer"
              title={`${collectionRequiredBinsCount} bins require collection`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{collectionRequiredBinsCount} FULL</span>
            </button>
          )}

          {/* Alerts Bell */}
          <button
            id="btn-alerts-bell"
            onClick={() => setCurrentTab('alerts')}
            className="relative p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
            title="System Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center font-mono">
                {unreadAlertsCount}
              </span>
            )}
          </button>

            {/* User Role Switcher Dropdown */}
          <div className="relative">
            <button
              id="btn-role-switcher"
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 bg-slate-900/60 border border-slate-800 rounded-lg hover:border-slate-700 transition-all text-left cursor-pointer"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-7 h-7 rounded-md object-cover border border-slate-700"
                referrerPolicy="no-referrer"
              />
              <div className="hidden sm:block">
                <div className="text-[11px] font-bold text-slate-200 leading-tight">
                  {currentUser.name.split(' ')[0]}
                </div>
                <div className="text-[9px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  {currentRole}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {showRoleMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowRoleMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-[#0A0F17] border border-slate-800 rounded-xl shadow-2xl z-50 p-2 text-xs">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Role-Based Access (RBAC)
                    </span>
                    <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                      Logged in as {currentUser.name}
                    </p>
                  </div>

                  {roles.map((r) => (
                    <button
                      key={r.role}
                      onClick={() => {
                        loginWithDemoRole(r.role);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-start justify-between transition-colors cursor-pointer ${
                        currentRole === r.role
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs">{r.title}</div>
                        <div className="text-[10px] text-slate-400 leading-tight">{r.desc}</div>
                      </div>
                      {currentRole === r.role && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                    </button>
                  ))}

                  <div className="mt-2 pt-2 border-t border-slate-800 px-2 flex justify-between items-center text-[10px]">
                    <button
                      onClick={() => {
                        resetToInitialData();
                        setShowRoleMenu(false);
                      }}
                      className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Re-seed DB
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setShowRoleMenu(false);
                      }}
                      className="text-rose-400 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <LogOut className="w-3 h-3" /> Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Sign Out Button */}
          <button
            id="btn-header-quick-logout"
            onClick={() => logout()}
            className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors cursor-pointer"
            title="Sign Out / Switch Account"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
