import React, { useState } from 'react';
import { useSmartBin } from '../../context/SmartBinContext';
import { AdCampaign } from '../../types';
import {
  Tv,
  Plus,
  Play,
  Pause,
  Eye,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  Activity,
  CheckCircle,
  Clock,
  Trash2,
  X,
} from 'lucide-react';

export const AdvertisementsView: React.FC = () => {
  const { ads, bins, createAdCampaign, toggleAdStatus } = useSmartBin();

  const [previewAd, setPreviewAd] = useState<AdCampaign | null>(ads[0] || null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Ad Form State
  const [name, setName] = useState('');
  const [advertiser, setAdvertiser] = useState('');
  const [headline, setHeadline] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [durationSeconds, setDurationSeconds] = useState(15);
  const [targetBinIds, setTargetBinIds] = useState<string[]>(['SG-BIN-001', 'SG-BIN-002']);

  const activeAds = ads.filter((a) => a.status === 'ACTIVE');
  const totalImpressions = ads.reduce((acc, a) => acc + a.impressions, 0);

  const sampleBanners = [
    {
      title: 'Kigali Innovation City',
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Rwanda Eco Clean City',
      url: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Visit Rwanda Tourism',
      url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Green Tech Circular Economy',
      url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80',
    },
  ];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !advertiser || !headline) return;

    createAdCampaign({
      name,
      advertiser,
      headline,
      mediaUrl:
        mediaUrl ||
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
      targetBins: targetBinIds,
      durationSeconds,
      startDate: '2026-03-01',
      endDate: '2026-04-30',
      status: 'ACTIVE',
    });

    setName('');
    setAdvertiser('');
    setHeadline('');
    setMediaUrl('');
    setShowCreateModal(false);
  };

  const handleToggleTargetBin = (binId: string) => {
    if (targetBinIds.includes(binId)) {
      if (targetBinIds.length > 1) {
        setTargetBinIds(targetBinIds.filter((id) => id !== binId));
      }
    } else {
      setTargetBinIds([...targetBinIds, binId]);
    }
  };

  return (
    <div id="advertisements-view" className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Tv className="w-5 h-5 text-emerald-400" />
              SmartBin Upper LED Advertising Network
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/40">
              {activeAds.length} Active Screens
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Monetization and civic messaging broadcasting on 3000-nit sunlight-readable upper LED screens across Kigali.
          </p>
        </div>

        <button
          id="btn-create-ad-campaign"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New Campaign
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Broadcast Impressions</span>
            <Eye className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-white mt-1">
            {totalImpressions.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-400/80">Pedestrian Eye-Level Viewers</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Digital LED Screens</span>
            <Tv className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-sky-400 mt-1">
            {bins.length} Active Displays
          </div>
          <span className="text-[11px] text-slate-400">1080x1920 3000-Nit Hardware</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Campaign Fleet Saturation</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-300 mt-1">100% Online</div>
          <span className="text-[11px] text-slate-400">Dynamic Slot Rotation: 15s</span>
        </div>
      </div>

      {/* Main Grid: Campaign Cards List + Live Upper Screen Physical Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Campaign Management Cards */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Active Advertising & Civic Broadcasts
          </h2>

          <div className="space-y-3">
            {ads.map((ad) => {
              const isSelected = previewAd?.id === ad.id;

              return (
                <div
                  key={ad.id}
                  id={`ad-card-${ad.id}`}
                  onClick={() => setPreviewAd(ad)}
                  className={`p-4 bg-slate-900 border ${
                    isSelected
                      ? 'border-emerald-500/80 ring-1 ring-emerald-500/30'
                      : 'border-slate-800'
                  } rounded-2xl cursor-pointer hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={ad.mediaUrl}
                      alt={ad.name}
                      className="w-16 h-12 object-cover rounded-xl border border-slate-800 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">{ad.name}</span>
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                            ad.status === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {ad.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                        {ad.advertiser}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate max-w-sm">{ad.headline}</p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 text-right text-xs shrink-0">
                    <div className="font-mono font-bold text-slate-200">
                      {ad.impressions.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">views</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAdStatus(ad.id);
                        }}
                        className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                          ad.status === 'ACTIVE'
                            ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                        }`}
                        title={ad.status === 'ACTIVE' ? 'Pause Broadcast' : 'Resume Broadcast'}
                      >
                        {ad.status === 'ACTIVE' ? (
                          <Pause className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                        <span>{ad.status === 'ACTIVE' ? 'Pause' : 'Activate'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 cols: Live Kiosk Screen Visualizer */}
        <div className="lg:col-span-5">
          <div className="sticky top-20 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  Physical Upper LED Screen Simulator
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Real-time visual rendering on outdoor SmartBin kiosk.
                </p>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded">
                1080x1920 Kiosk
              </span>
            </div>

            {previewAd ? (
              <div className="space-y-4">
                {/* Visual Kiosk Screen Container */}
                <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700 bg-black aspect-[16/10] shadow-2xl group">
                  <img
                    src={previewAd.mediaUrl}
                    alt={previewAd.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                    referrerPolicy="no-referrer"
                  />

                  {/* Kiosk Glare & LED Grid Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-transparent to-white/10 pointer-events-none" />
                  <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:3px_3px]" />

                  {/* Overlay text */}
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black via-black/60 to-transparent">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      {previewAd.advertiser}
                    </span>
                    <h4 className="text-sm font-bold text-white leading-tight drop-shadow">
                      {previewAd.headline}
                    </h4>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20 text-[10px] text-slate-300 font-mono">
                      <span>Rotation: {previewAd.durationSeconds}s</span>
                      <span className="text-emerald-400 font-bold">SG SMARTBIN LIVE</span>
                    </div>
                  </div>
                </div>

                {/* Target Bins broadcast summary */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Targeted Smart Stations:</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      {previewAd.targetBins.length} Stations
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {previewAd.targetBins.map((binId) => (
                      <span
                        key={binId}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300"
                      >
                        {binId}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-10">Select a campaign to preview screen.</p>
            )}
          </div>
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Tv className="w-5 h-5 text-emerald-400" />
                Launch Upper LED Screen Campaign
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Campaign Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kigali Clean City Initiative"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Advertiser / Brand:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bank of Kigali / RDB"
                    value={advertiser}
                    onChange={(e) => setAdvertiser(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Slot Duration (Sec):</label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={durationSeconds}
                    onChange={(e) => setDurationSeconds(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Broadcast Headline:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Segregate waste for a cleaner, greener Kigali."
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Banner Image URL:</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
                {/* Preset suggestions */}
                <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
                  {sampleBanners.map((sb, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setMediaUrl(sb.url)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] whitespace-nowrap"
                    >
                      + {sb.title}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target SmartBins:</label>
                <div className="grid grid-cols-3 gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-950 rounded-xl border border-slate-800">
                  {bins.map((b) => (
                    <button
                      type="button"
                      key={b.binId}
                      onClick={() => handleToggleTargetBin(b.binId)}
                      className={`p-1.5 rounded text-[10px] font-mono font-bold text-center transition-colors ${
                        targetBinIds.includes(b.binId)
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500'
                          : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      {b.binId}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                >
                  Deploy Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
