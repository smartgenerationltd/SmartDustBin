import React from 'react';
import { SmartBin, AdCampaign } from '../../types';
import { Wifi, Battery, Sun, Thermometer, Droplets, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

interface SmartBinPhysicalCardProps {
  bin: SmartBin;
  activeAd?: AdCampaign;
  compact?: boolean;
  onOpenDetail?: () => void;
}

export const SmartBinPhysicalCard: React.FC<SmartBinPhysicalCardProps> = ({
  bin,
  activeAd,
  compact = false,
  onOpenDetail,
}) => {
  const getFillStatus = (level: number) => {
    if (level >= 80) return { label: 'COLLECTION REQUIRED', color: 'bg-red-500 text-red-500 border-red-500', barColor: 'bg-red-500' };
    if (level >= 60) return { label: 'WARNING', color: 'bg-amber-500 text-amber-500 border-amber-500', barColor: 'bg-amber-500' };
    return { label: 'NORMAL', color: 'bg-emerald-500 text-emerald-500 border-emerald-500', barColor: 'bg-emerald-500' };
  };

  const foodStatus = getFillStatus(bin.foodFillLevel);
  const recStatus = getFillStatus(bin.recyclingFillLevel);
  const genStatus = getFillStatus(bin.generalFillLevel);

  const isCritical = bin.foodFillLevel >= 80 || bin.recyclingFillLevel >= 80 || bin.generalFillLevel >= 80;

  return (
    <div
      id={`smartbin-station-${bin.binId}`}
      className={`relative bg-[#0A0F17] border ${
        isCritical ? 'border-rose-500/60 shadow-lg shadow-rose-950/20' : 'border-slate-800'
      } rounded-xl overflow-hidden transition-all duration-200 hover:border-emerald-500/50 flex flex-col`}
    >
      {/* Top Smart Station Bar: Hardware Header */}
      <div className="bg-[#070B12] px-3.5 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              bin.connectivityStatus === 'ONLINE' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
            }`}
          />
          <span className="font-mono font-bold text-slate-200">{bin.binId}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 truncate max-w-[140px] text-[11px]">{bin.district}</span>
        </div>

        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          <span className="flex items-center gap-1">
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-300 font-mono">{bin.temperature}°C</span>
          </span>
          <span className="flex items-center gap-1">
            <Battery
              className={`w-3.5 h-3.5 ${
                bin.batteryLevel < 30 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            />
            <span className="text-slate-300 font-mono">{bin.batteryLevel}%</span>
          </span>
          <span className="flex items-center gap-1">
            <Sun className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-slate-400 hidden sm:inline font-mono">{bin.solarStatus}</span>
          </span>
        </div>
      </div>

      {/* SECTION 1: UPPER SECTION - DIGITAL LED ADVERTISING SCREEN */}
      <div className="p-3 bg-[#070B12]/80 border-b border-slate-800/80">
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1 font-mono">
            <Activity className="w-3 h-3 animate-pulse" />
            1. UPPER SECTION • DIGITAL LED AD SCREEN
          </span>
          <span className="text-[9px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.2 rounded">
            1080x1920 LED (3000 NITS)
          </span>
        </div>

        <div className="relative aspect-[16/7] w-full rounded-lg overflow-hidden bg-black border border-slate-800 shadow-inner group">
          {activeAd ? (
            <>
              <img
                src={activeAd.mediaUrl}
                alt={activeAd.name}
                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent p-3 flex flex-col justify-end">
                <span className="text-[9px] font-bold text-emerald-400 tracking-wide uppercase font-mono">
                  {activeAd.advertiser}
                </span>
                <p className="text-xs font-semibold text-white truncate drop-shadow">
                  {activeAd.headline}
                </p>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#070B12] text-slate-500 p-4 text-center">
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                SG SMARTBIN DIGITAL DISPLAY NETWORK
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                Kigali Smart City Public Information Broadcast
              </p>
            </div>
          )}

          {/* LED Grid subtle overlay effect */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:4px_4px]" />
        </div>
      </div>

      {/* SECTION 2: LOWER SECTION - THREE SEPARATE WASTE COMPARTMENTS */}
      <div className="p-3.5 flex-1 flex flex-col justify-between bg-[#0A0F17]">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-sm bg-emerald-500" />
            2. LOWER SECTION • 3 WASTE COMPARTMENTS
          </span>
          <span className="text-[10px] text-slate-400 truncate max-w-[170px]">{bin.location}</span>
        </div>

        {/* 3 Compartments Grid */}
        <div className="grid grid-cols-3 gap-2">
          {/* Compartment 1: Food Waste */}
          <div
            id={`comp-food-${bin.binId}`}
            className={`p-2.5 rounded-lg border ${
              bin.foodFillLevel >= 80
                ? 'border-rose-500/50 bg-rose-950/20'
                : bin.foodFillLevel >= 60
                ? 'border-amber-500/40 bg-amber-950/20'
                : 'border-emerald-500/20 bg-emerald-950/10'
            } flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-tight font-mono">
                  FOOD
                </span>
                <span
                  className={`text-[8px] font-mono px-1 py-0.2 rounded font-bold ${
                    bin.foodFillLevel >= 80
                      ? 'bg-rose-500/20 text-rose-400'
                      : bin.foodFillLevel >= 60
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {bin.foodFillLevel >= 80 ? 'CRITICAL' : bin.foodFillLevel >= 60 ? 'WARN' : 'OK'}
                </span>
              </div>
              <div className="text-lg font-bold font-mono text-slate-100">{bin.foodFillLevel}%</div>
            </div>

            <div className="mt-2">
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${foodStatus.barColor} transition-all duration-500`}
                  style={{ width: `${bin.foodFillLevel}%` }}
                />
              </div>
              <span className="text-[8px] text-slate-500 block text-right mt-1 font-mono">Organic</span>
            </div>
          </div>

          {/* Compartment 2: Recycling Waste */}
          <div
            id={`comp-recycling-${bin.binId}`}
            className={`p-2.5 rounded-lg border ${
              bin.recyclingFillLevel >= 80
                ? 'border-rose-500/50 bg-rose-950/20'
                : bin.recyclingFillLevel >= 60
                ? 'border-amber-500/40 bg-amber-950/20'
                : 'border-sky-500/20 bg-sky-950/10'
            } flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-bold text-sky-400 uppercase tracking-tight font-mono">
                  RECYCLE
                </span>
                <span
                  className={`text-[8px] font-mono px-1 py-0.2 rounded font-bold ${
                    bin.recyclingFillLevel >= 80
                      ? 'bg-rose-500/20 text-rose-400'
                      : bin.recyclingFillLevel >= 60
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-sky-500/20 text-sky-300'
                  }`}
                >
                  {bin.recyclingFillLevel >= 80 ? 'CRITICAL' : bin.recyclingFillLevel >= 60 ? 'WARN' : 'OK'}
                </span>
              </div>
              <div className="text-lg font-bold font-mono text-slate-100">
                {bin.recyclingFillLevel}%
              </div>
            </div>

            <div className="mt-2">
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${recStatus.barColor} transition-all duration-500`}
                  style={{ width: `${bin.recyclingFillLevel}%` }}
                />
              </div>
              <span className="text-[8px] text-slate-500 block text-right mt-1 font-mono">Plastic/Can</span>
            </div>
          </div>

          {/* Compartment 3: General Waste */}
          <div
            id={`comp-general-${bin.binId}`}
            className={`p-2.5 rounded-lg border ${
              bin.generalFillLevel >= 80
                ? 'border-rose-500/50 bg-rose-950/20'
                : bin.generalFillLevel >= 60
                ? 'border-amber-500/40 bg-amber-950/20'
                : 'border-slate-800 bg-slate-900/40'
            } flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tight font-mono">
                  GENERAL
                </span>
                <span
                  className={`text-[8px] font-mono px-1 py-0.2 rounded font-bold ${
                    bin.generalFillLevel >= 80
                      ? 'bg-rose-500/20 text-rose-400'
                      : bin.generalFillLevel >= 60
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {bin.generalFillLevel >= 80 ? 'CRITICAL' : bin.generalFillLevel >= 60 ? 'WARN' : 'OK'}
                </span>
              </div>
              <div className="text-lg font-bold font-mono text-slate-100">
                {bin.generalFillLevel}%
              </div>
            </div>

            <div className="mt-2">
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${genStatus.barColor} transition-all duration-500`}
                  style={{ width: `${bin.generalFillLevel}%` }}
                />
              </div>
              <span className="text-[8px] text-slate-500 block text-right mt-1 font-mono">Residual</span>
            </div>
          </div>
        </div>

        {/* Footer info & open detailed view */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[10px] font-mono">
            Updated: <span className="text-slate-300">{bin.lastUpdated}</span>
          </span>

          {onOpenDetail && (
            <button
              id={`btn-view-bin-${bin.binId}`}
              onClick={onOpenDetail}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:underline transition-colors cursor-pointer"
            >
              Diagnostics &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
