import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SmartBinProvider, useSmartBin } from './context/SmartBinContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { LoginView } from './components/auth/LoginView';
import { DashboardView } from './components/dashboard/DashboardView';
import { SmartBinsView } from './components/smartbins/SmartBinsView';
import { KigaliMapView } from './components/map/KigaliMapView';
import { CollectionsView } from './components/collections/CollectionsView';
import { AdvertisementsView } from './components/advertisements/AdvertisementsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AIAssistantView } from './components/ai/AIAssistantView';
import { AlertsView } from './components/alerts/AlertsView';
import { UsersView } from './components/users/UsersView';
import { SettingsView } from './components/settings/SettingsView';

const MainContent: React.FC = () => {
  const { currentTab } = useSmartBin();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderActiveView = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'smartbins':
        return <SmartBinsView />;
      case 'map':
        return <KigaliMapView />;
      case 'collections':
        return <CollectionsView />;
      case 'advertisements':
        return <AdvertisementsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'ai':
        return <AIAssistantView />;
      case 'alerts':
        return <AlertsView />;
      case 'users':
        return <UsersView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#05070A] text-slate-200 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Header */}
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Body Layout */}
      <div className="flex-1 flex w-full relative overflow-hidden">
        {/* Immersive radial ambient light */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#10b98110,_transparent_40%)] pointer-events-none" />

        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Dynamic Main View Container */}
        <main
          id="main-app-content"
          className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full z-10"
        >
          {renderActiveView()}
        </main>
      </div>

      {/* Immersive Status Footer */}
      <footer className="h-10 bg-[#070B12] border-t border-slate-800 flex items-center justify-between px-4 sm:px-8 text-[10px] text-slate-500 font-mono shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>KIGALI HUB: LAT -1.9441°, LON 30.0619°</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">•</span>
          <span className="text-slate-400 hidden sm:inline font-sans">
            SG AI Agency <span className="text-emerald-500/80">SG-SmartBin v3.2</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-emerald-400/80 font-mono flex items-center gap-1">
            <span className="text-emerald-400">●</span> FIREBASE_FIRESTORE_ACTIVE
          </span>
          <span className="text-emerald-400/80 font-mono hidden sm:flex items-center gap-1">
            <span className="text-emerald-400">●</span> ESP32_MESH_READY
          </span>
        </div>
      </footer>
    </div>
  );
};

const AuthenticatedApp: React.FC = () => {
  const { isAuthenticated, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070A] flex flex-col items-center justify-center text-slate-200">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center animate-pulse mb-4">
          <div className="w-6 h-6 rounded-md bg-emerald-400 animate-spin" />
        </div>
        <div className="font-mono text-sm font-bold text-white tracking-wide">
          CONNECTING TO SG SMARTBIN FIREBASE...
        </div>
        <div className="text-xs text-slate-400 mt-1 font-mono">
          Verifying security keys &amp; fleet RBAC tokens
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !userProfile) {
    return <LoginView />;
  }

  return (
    <SmartBinProvider>
      <MainContent />
    </SmartBinProvider>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;
