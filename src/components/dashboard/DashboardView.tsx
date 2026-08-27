import React from 'react';
import { useSmartBin } from '../../context/SmartBinContext';
import { SmartBinPhysicalCard } from '../common/SmartBinPhysicalCard';
import {
  Trash2,
  Wifi,
  WifiOff,
  AlertTriangle,
  BarChart2,
  Tv,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Sparkles,
  MapPin,
  Truck,
  Activity,
  Zap,
  TrendingUp,
  Droplets,
  Layers,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    bins,
    ads,
    collections,
    alerts,
    avgFillLevels,
    collectionRequiredBinsCount,
    setCurrentTab,
    setSelectedBinId,
  } = useSmartBin();

  const totalBins = bins.length;
  const onlineBins = bins.filter((b) => b.connectivityStatus === 'ONLINE').length;
  const offlineBins = bins.filter((b) => b.connectivityStatus === 'OFFLINE').length;
  const activeAdsCount = ads.filter((a) => a.status === 'ACTIVE').length;
  const todayCollections = collections.filter(
    (c) => c.scheduledDate.includes('Today') || c.completedDate?.includes('Today')
  ).length;

  const urgentBins = bins.filter(
    (b) => b.foodFillLevel >= 80 || b.recyclingFillLevel >= 80 || b.generalFillLevel >= 80
  );

  // Status badge rule helper
  const getStatusBadge = (level: number) => {
    if (level >= 80) {
      return {
        label: 'COLLECTION REQUIRED',
        bg: 'bg-red-500/20',
        text: 'text-red-400',
        border: 'border-red-500/40',
        bar: 'bg-red-500',
      };
    }
    if (level >= 60) {
      return {
        label: 'WARNING',
        bg: 'bg-amber-500/20',
        text: 'text-amber-300',
        border: 'border-amber-500/40',
        bar: 'bg-amber-500',
      };
    }
    return {
      label: 'NORMAL',
      bg: 'bg-emerald-500/20',
      text: 'text-emerald-300',
      border: 'border-emerald-500/40',
      bar: 'bg-emerald-500',
    };
  };

  const foodRule = getStatusBadge(avgFillLevels.food);
  const recRule = getStatusBadge(avgFillLevels.recycling);
  const genRule = getStatusBadge(avgFillLevels.general);

  // Featured flagship bin for physical preview
  const featuredBin = bins.find((b) => b.binId === 'SG-BIN-001') || bins[0];
  const featuredAd = ads.find((a) => a.id === featuredBin.activeAdCampaignId) || ads[0];

  return (
    <div id="dashboard-view" className="space-y-6">
      {/* Top Banner: Smart-City Operations Status */}
      <div className="bg-[#0A0F17]/90 border border-slate-800 rounded-xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_70%)] pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1.5">
                <Activity className="w-3 h-3 animate-pulse text-emerald-400" />
                LIVE KIGALI IOT TELEMETRY
              </span>
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                Mesh Stations Fleet: Synchronized
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              SmartBin Operations Command Center
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Real-time multi-compartment waste telemetry, automated collection dispatching, and digital LED advertising network across Kigali.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="btn-dash-ai-priorities"
              onClick={() => setCurrentTab('ai')}
              className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-black" />
              AI Priority Dispatch
            </button>
            <button
              id="btn-dash-view-map"
              onClick={() => setCurrentTab('map')}
              className="px-3.5 py-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-medium text-xs flex items-center gap-2 border border-slate-800 transition-all cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Kigali Map
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {/* Total SmartBins */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Bins</span>
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-white">{totalBins}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Physical Stations</div>
          </div>
        </div>

        {/* Online SmartBins */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Online Bins</span>
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-emerald-400">{onlineBins}</div>
            <div className="text-[10px] text-emerald-400/80 mt-0.5">Active Heartbeat</div>
          </div>
        </div>

        {/* Offline SmartBins */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Offline Bins</span>
            <WifiOff className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-rose-400">{offlineBins}</div>
            <div className="text-[10px] text-rose-400/80 mt-0.5">Needs Check (UTB)</div>
          </div>
        </div>

        {/* Bins Requiring Collection */}
        <div
          onClick={() => setCurrentTab('collections')}
          className="bg-slate-900/40 border border-rose-500/30 rounded-xl p-3.5 flex flex-col justify-between cursor-pointer hover:border-rose-500/60 transition-colors group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="text-rose-400 font-semibold">Requires Collection</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-rose-400 group-hover:underline">
              {collectionRequiredBinsCount}
            </div>
            <div className="text-[10px] text-rose-400/80 mt-0.5">&ge; 80% Full Threshold</div>
          </div>
        </div>

        {/* Average Fill Level */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Avg Fill Level</span>
            <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-amber-300">
              {avgFillLevels.total}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Fleet Wide Average</div>
          </div>
        </div>

        {/* Active Advertising Campaigns */}
        <div
          onClick={() => setCurrentTab('advertisements')}
          className="bg-slate-900/40 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between cursor-pointer hover:border-emerald-500/40 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Campaigns</span>
            <Tv className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-emerald-400">{activeAdsCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Digital LED Ads</div>
          </div>
        </div>

        {/* Today's Collections */}
        <div
          onClick={() => setCurrentTab('collections')}
          className="bg-slate-900/40 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between cursor-pointer hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Today&apos;s Collections</span>
            <Truck className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-sky-400">{todayCollections}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Truck Dispatches</div>
          </div>
        </div>
      </div>

      {/* 3 Compartment Overall Category Statistics with Status Rules */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Compartment Waste Segregation Overview
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live automated sensor metrics aggregated across all Kigali SmartBin stations.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              0-59% NORMAL
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              60-79% WARNING
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
              80-100% COLLECTION REQUIRED
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Food Waste */}
          <div className="p-4 rounded-lg bg-[#070B12] border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Food Waste
                </span>
                <span
                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${foodRule.bg} ${foodRule.text} ${foodRule.border}`}
                >
                  {foodRule.label}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-white">
                  {avgFillLevels.food}%
                </span>
                <span className="text-xs text-slate-400">average capacity</span>
              </div>
            </div>

            <div className="mt-4">
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${foodRule.bar} transition-all duration-700`}
                  style={{ width: `${avgFillLevels.food}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono">
                <span>Organic / Bio-composting</span>
                <span>{bins.filter((b) => b.foodFillLevel >= 80).length} bins critical</span>
              </div>
            </div>
          </div>

          {/* Recycling Waste */}
          <div className="p-4 rounded-lg bg-[#070B12] border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  Recycling Waste
                </span>
                <span
                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${recRule.bg} ${recRule.text} ${recRule.border}`}
                >
                  {recRule.label}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-white">
                  {avgFillLevels.recycling}%
                </span>
                <span className="text-xs text-slate-400">average capacity</span>
              </div>
            </div>

            <div className="mt-4">
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${recRule.bar} transition-all duration-700`}
                  style={{ width: `${avgFillLevels.recycling}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono">
                <span>Plastic, Cans &amp; Paper</span>
                <span className="text-rose-400 font-bold">
                  {bins.filter((b) => b.recyclingFillLevel >= 80).length} bins critical
                </span>
              </div>
            </div>
          </div>

          {/* General Waste */}
          <div className="p-4 rounded-lg bg-[#070B12] border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  General Waste
                </span>
                <span
                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${genRule.bg} ${genRule.text} ${genRule.border}`}
                >
                  {genRule.label}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-white">
                  {avgFillLevels.general}%
                </span>
                <span className="text-xs text-slate-400">average capacity</span>
              </div>
            </div>

            <div className="mt-4">
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${genRule.bar} transition-all duration-700`}
                  style={{ width: `${avgFillLevels.general}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono">
                <span>Non-Recyclable Residuals</span>
                <span>{bins.filter((b) => b.generalFillLevel >= 80).length} bins critical</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Featured Physical Station Preview + Urgent Collection Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 cols: Live Physical SmartBin Visualizer */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              Physical Smart Station Architecture
            </h3>
            <button
              onClick={() => {
                setSelectedBinId(featuredBin.binId);
                setCurrentTab('smartbins');
              }}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
            >
              All {bins.length} Stations &rarr;
            </button>
          </div>

          <SmartBinPhysicalCard
            bin={featuredBin}
            activeAd={featuredAd}
            onOpenDetail={() => {
              setSelectedBinId(featuredBin.binId);
            }}
          />
        </div>

        {/* Right 6 cols: Urgent Collection Queue & Quick Actions */}
        <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-rose-400" />
                  Immediate Collection Queue (&ge; 80% Full)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Bins automatically flagged by ultrasonic distance sensors.
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('collections')}
                className="text-xs font-semibold text-emerald-400 hover:underline"
              >
                Dispatch Hub &rarr;
              </button>
            </div>

            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {urgentBins.map((bin) => {
                const highComps = [];
                if (bin.foodFillLevel >= 80) highComps.push({ name: 'Food', val: bin.foodFillLevel });
                if (bin.recyclingFillLevel >= 80)
                  highComps.push({ name: 'Recycling', val: bin.recyclingFillLevel });
                if (bin.generalFillLevel >= 80)
                  highComps.push({ name: 'General', val: bin.generalFillLevel });

                return (
                  <div
                    key={bin.binId}
                    className="p-3 bg-[#070B12] border border-rose-500/30 rounded-lg flex items-center justify-between hover:border-rose-500/60 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-white">{bin.binId}</span>
                        <span className="text-xs text-slate-300 font-semibold">{bin.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{bin.location}</div>
                      <div className="flex items-center gap-2 mt-1.5">
                        {highComps.map((c) => (
                          <span
                            key={c.name}
                            className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30"
                          >
                            {c.name}: {c.val}%
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      id={`btn-dash-dispatch-${bin.binId}`}
                      onClick={() => {
                        setSelectedBinId(bin.binId);
                        setCurrentTab('collections');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                    >
                      Dispatch
                    </button>
                  </div>
                );
              })}

              {urgentBins.length === 0 && (
                <div className="p-8 text-center bg-[#070B12]/60 border border-dashed border-slate-800 rounded-lg text-slate-400">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                  <p className="text-xs font-semibold text-slate-200">No Critical Overflow Detected</p>
                  <p className="text-[11px] text-slate-400 mt-1">All SmartBins are within safe operational fill limits.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick AI & IoT Ticker */}
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center justify-between gap-3 relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-indigo-200">SG SmartBin AI Copilot</div>
                <p className="text-[11px] text-slate-400">
                  Ask operational queries, predict fill surges, or analyze Kigali recycling efficiency.
                </p>
              </div>
            </div>
            <button
              onClick={() => setCurrentTab('ai')}
              className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer"
            >
              Ask AI &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
