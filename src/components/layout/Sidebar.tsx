import React from 'react';
import { useSmartBin } from '../../context/SmartBinContext';
import { useAuth } from '../../context/AuthContext';
import { SMARTBIN_LOGO } from '../../assets/branding';
import {
  LayoutDashboard,
  Trash2,
  MapPin,
  Truck,
  Tv,
  BarChart3,
  Bot,
  Bell,
  Users,
  Settings,
  X,
  Zap,
  Activity,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    currentTab,
    setCurrentTab,
    unreadAlertsCount,
    collectionRequiredBinsCount,
    currentRole,
    bins,
    ads,
    collections,
  } = useSmartBin();

  const { permissions, logout, userProfile } = useAuth();

  const allNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      visible: true,
      description: 'Live Kigali telemetry & KPIs',
    },
    {
      id: 'smartbins',
      label: 'SmartBins',
      icon: Trash2,
      badge: `${bins.length}`,
      badgeColor: 'bg-slate-800 text-slate-300',
      visible: currentRole !== 'ADVERTISER',
      description: 'ESP32 Smart waste stations',
    },
    {
      id: 'map',
      label: 'Map',
      icon: MapPin,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/20 text-emerald-300',
      visible: true,
      description: 'Geographical station locator',
    },
    {
      id: 'collections',
      label: 'Collections',
      icon: Truck,
      badge:
        currentRole === 'COLLECTOR'
          ? `${collections.filter((c) => c.status !== 'COMPLETED').length} Due`
          : collectionRequiredBinsCount > 0
          ? `${collectionRequiredBinsCount} Full`
          : null,
      badgeColor: 'bg-red-500/20 text-red-400 font-bold',
      visible: currentRole === 'ADMIN' || currentRole === 'OPERATOR' || currentRole === 'COLLECTOR',
      description: currentRole === 'COLLECTOR' ? 'My assigned pickups' : 'Dispatch & collection queue',
    },
    {
      id: 'advertisements',
      label: 'Advertisements',
      icon: Tv,
      badge: `${ads.filter((a) => a.status === 'ACTIVE').length} Active`,
      badgeColor: 'bg-amber-500/20 text-amber-300',
      visible: currentRole === 'ADMIN' || currentRole === 'OPERATOR' || currentRole === 'ADVERTISER',
      description: currentRole === 'ADVERTISER' ? 'My LED campaigns' : 'Upper LED screen campaign manager',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      badge: null,
      visible: currentRole !== 'COLLECTOR',
      description: 'Waste volume & recycling metrics',
    },
    {
      id: 'ai',
      label: 'AI Assistant',
      icon: Bot,
      badge: 'Gemini',
      badgeColor: 'bg-gradient-to-r from-emerald-500/30 to-teal-500/30 text-emerald-300',
      visible: true,
      description: 'Operations & computer vision',
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: Bell,
      badge: unreadAlertsCount > 0 ? `${unreadAlertsCount}` : null,
      badgeColor: 'bg-red-500 text-white font-bold',
      visible: currentRole === 'ADMIN' || currentRole === 'OPERATOR' || currentRole === 'COLLECTOR',
      description: 'Sensor alarms & health monitoring',
    },
    {
      id: 'users',
      label: 'Users & Roles',
      icon: Users,
      badge: currentRole,
      badgeColor: 'bg-slate-800 text-emerald-400 font-mono text-[9px]',
      visible: true,
      description: 'RBAC security & permissions',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: 'Firestore',
      badgeColor: 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 text-[9px]',
      visible: currentRole === 'ADMIN' || currentRole === 'OPERATOR',
      description: 'ESP32 payload & Firestore schemas',
    },
  ];

  const visibleNavItems = allNavItems.filter((i) => i.visible);

  const handleSelectTab = (tabId: string) => {
    setCurrentTab(tabId);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0A0F17] border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Sidebar Header for Mobile */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-2">
              <img
                src={SMARTBIN_LOGO}
                alt="SG SmartBin Logo"
                referrerPolicy="no-referrer"
                className="h-7 w-7 rounded-lg object-cover border border-emerald-500/40"
              />
              <div>
                <span className="font-bold text-white text-sm">SMARTBIN</span>
                <p className="text-[9px] text-emerald-400 font-mono">KIGALI IOT FLEET</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900/80 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Fleet Hardware Status Card */}
          <div className="p-3 border-b border-slate-800/80 bg-[#070B12]/50">
            <div className="bg-[#0F172A]/70 border border-slate-800 rounded-lg p-3">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="flex items-center gap-1.5 font-semibold text-slate-200 text-[11px]">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  Fleet Mesh Gateway
                </span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold">
                  ONLINE
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Stations: <strong className="text-slate-200">{bins.length} Active</strong></span>
                <span className="text-emerald-400/80">98.4% Sync</span>
              </div>
              <div className="mt-2 text-[9px] text-slate-500 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>ESP32 Telemetry Link: 2.4GHz Mesh</span>
              </div>
            </div>
          </div>

          {/* Navigation Items List */}
          <nav className="px-3 py-3 space-y-1 custom-scrollbar overflow-y-auto max-h-[calc(100vh-280px)]">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors group ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                    <div className="truncate">
                      <span className="text-xs tracking-tight block truncate">{item.label}</span>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                        item.badgeColor || 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Active Role & Sign Out */}
        <div className="p-3 border-t border-slate-800/80 bg-[#070B12]/80 space-y-2">
          {/* Active Role Indicator */}
          <div className="px-2.5 py-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <div>
                <div className="text-[10px] font-bold text-slate-300 font-mono leading-none">
                  {currentRole} ROLE
                </div>
                <div className="text-[9px] text-slate-500 leading-tight truncate max-w-[110px]">
                  {currentRole === 'COLLECTOR'
                    ? 'Assigned Routes'
                    : currentRole === 'ADVERTISER'
                    ? 'Ad Campaigns'
                    : 'Municipal Access'}
                </div>
              </div>
            </div>
            <button
              onClick={() => logout()}
              title="Sign Out / Switch Account"
              className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-center text-[10px] text-slate-500 font-mono">
            SG SmartBin • Firestore v2.5
          </div>
        </div>
      </aside>
    </>
  );
};
