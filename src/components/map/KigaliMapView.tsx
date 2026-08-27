import React, { useState } from 'react';
import { useSmartBin } from '../../context/SmartBinContext';
import { SmartBin } from '../../types';
import {
  MapPin,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Navigation,
  CheckCircle,
  AlertTriangle,
  WifiOff,
  Truck,
  Battery,
  Thermometer,
  X,
  Radio,
} from 'lucide-react';

export const KigaliMapView: React.FC = () => {
  const { bins, selectedBinId, setSelectedBinId, setCurrentTab } = useSmartBin();

  const [activeBin, setActiveBin] = useState<SmartBin | null>(
    bins.find((b) => b.binId === selectedBinId) || bins[0]
  );
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Geographic bounds for Kigali map projection
  // Lat: -1.92 to -1.99
  // Lon: 30.03 to 30.16
  const minLat = -1.99;
  const maxLat = -1.92;
  const minLon = 30.03;
  const maxLon = 30.16;

  const projectToMap = (lat: number, lon: number) => {
    const x = ((lon - minLon) / (maxLon - minLon)) * 800 + 50;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 500 + 40;
    return { x, y };
  };

  const getMarkerStatus = (bin: SmartBin) => {
    if (bin.connectivityStatus === 'OFFLINE') {
      return {
        color: '#94A3B8',
        ring: 'rgba(148, 163, 184, 0.4)',
        label: 'Offline',
        code: 'GRAY',
      };
    }
    const maxFill = Math.max(bin.foodFillLevel, bin.recyclingFillLevel, bin.generalFillLevel);
    if (maxFill >= 80) {
      return {
        color: '#EF4444',
        ring: 'rgba(239, 68, 68, 0.5)',
        label: 'Collection Required',
        code: 'RED',
      };
    }
    if (maxFill >= 60) {
      return {
        color: '#F59E0B',
        ring: 'rgba(245, 158, 11, 0.4)',
        label: 'Warning',
        code: 'YELLOW',
      };
    }
    return {
      color: '#10B981',
      ring: 'rgba(16, 185, 129, 0.4)',
      label: 'Normal',
      code: 'GREEN',
    };
  };

  const filteredBins = bins.filter((bin) => {
    if (filterStatus === 'ALL') return true;
    const status = getMarkerStatus(bin);
    return status.code === filterStatus;
  });

  return (
    <div id="kigali-map-view" className="space-y-4">
      {/* Map Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              Kigali SmartBin Geographic Network
            </h1>
            <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded text-emerald-300 font-bold">
              {filteredBins.length} Plotted
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time GPS telemetry and fill status visualization for Kigali city stations.
          </p>
        </div>

        {/* Status Filter Legend */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              filterStatus === 'ALL'
                ? 'bg-slate-700 text-white font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('GREEN')}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors ${
              filterStatus === 'GREEN'
                ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500 font-bold'
                : 'bg-slate-950 text-emerald-400 hover:bg-emerald-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Normal (0-59%)
          </button>
          <button
            onClick={() => setFilterStatus('YELLOW')}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors ${
              filterStatus === 'YELLOW'
                ? 'bg-amber-500/30 text-amber-300 border border-amber-500 font-bold'
                : 'bg-slate-950 text-amber-400 hover:bg-amber-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Warning (60-79%)
          </button>
          <button
            onClick={() => setFilterStatus('RED')}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors ${
              filterStatus === 'RED'
                ? 'bg-red-500/30 text-red-300 border border-red-500 font-bold'
                : 'bg-slate-950 text-red-400 hover:bg-red-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> Required (&ge;80%)
          </button>
          <button
            onClick={() => setFilterStatus('GRAY')}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors ${
              filterStatus === 'GRAY'
                ? 'bg-slate-700 text-slate-200 border border-slate-500 font-bold'
                : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-400" /> Offline
          </button>
        </div>
      </div>

      {/* Main Map Container + Active Bin Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* SVG Interactive Kigali Map Canvas */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-3xl p-4 relative overflow-hidden shadow-2xl min-h-[480px] flex items-center justify-center">
          {/* Zoom controls */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl shadow-lg">
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.2))}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.2))}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive SVG Canvas */}
          <div
            className="w-full h-full overflow-hidden flex items-center justify-center transition-transform duration-300"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <svg
              viewBox="0 0 900 580"
              className="w-full h-auto max-h-[520px] select-none"
            >
              {/* Map Background Roads / Contours representing Kigali Hills */}
              <defs>
                <radialGradient id="kigaliGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#020617" stopOpacity="0" />
                </radialGradient>
                <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="0.5" />
                </pattern>
              </defs>

              <rect width="900" height="580" fill="#020617" />
              <rect width="900" height="580" fill="url(#gridPattern)" />
              <circle cx="450" cy="280" r="320" fill="url(#kigaliGlow)" />

              {/* Kigali Districts Boundary lines (Stylized vector outlines) */}
              <path
                d="M 120,180 Q 280,120 480,160 T 780,240 Q 820,380 680,480 T 320,500 Q 150,420 120,180 Z"
                fill="#0B132B"
                fillOpacity="0.4"
                stroke="#1E293B"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* Major Kigali Corridors: KN 2 Ave, KG 7 Ave, Airport Road KK 15, Kimironko Blvd */}
              <path
                d="M 220,320 L 380,260 L 520,240 L 680,220 L 780,210"
                stroke="#334155"
                strokeWidth="3.5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 380,260 L 460,340 L 580,420 L 720,460"
                stroke="#334155"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 520,240 L 510,140 L 480,80"
                stroke="#334155"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />

              {/* District Labels */}
              <text x="210" y="240" fill="#64748B" fontSize="13" fontWeight="bold" fontFamily="sans-serif">
                NYARUGENGE
              </text>
              <text x="480" y="130" fill="#64748B" fontSize="13" fontWeight="bold" fontFamily="sans-serif">
                GASABO (Kacyiru / Kimihurura)
              </text>
              <text x="560" y="440" fill="#64748B" fontSize="13" fontWeight="bold" fontFamily="sans-serif">
                KICUKIRO (Gikondo / Kanombe)
              </text>

              {/* Prominent Landmarks */}
              <text x="530" y="255" fill="#10B981" fontSize="10" fontWeight="bold" fontFamily="monospace">
                ★ KIGALI CONVENTION CENTRE
              </text>
              <text x="240" y="295" fill="#38BDF8" fontSize="10" fontWeight="bold" fontFamily="monospace">
                ★ CITY CENTER UTC
              </text>
              <text x="690" y="475" fill="#F59E0B" fontSize="10" fontWeight="bold" fontFamily="monospace">
                ★ KANOMBE INTL AIRPORT
              </text>

              {/* Render Bin Markers */}
              {filteredBins.map((bin) => {
                const { x, y } = projectToMap(bin.latitude, bin.longitude);
                const status = getMarkerStatus(bin);
                const isSelected = activeBin?.binId === bin.binId;
                const isCritical = status.code === 'RED';

                return (
                  <g
                    key={bin.binId}
                    id={`map-marker-${bin.binId}`}
                    transform={`translate(${x}, ${y})`}
                    className="cursor-pointer transition-transform duration-200"
                    onClick={() => setActiveBin(bin)}
                  >
                    {/* Animated Pulsing Ring for Critical Collection required bins */}
                    {isCritical && (
                      <circle r="18" fill="none" stroke="#EF4444" strokeWidth="1.5" opacity="0.7">
                        <animate
                          attributeName="r"
                          values="10;24;10"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.8;0;0.8"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}

                    {/* Outer Selection Highlight */}
                    {isSelected && (
                      <circle
                        r="16"
                        fill="none"
                        stroke="#38BDF8"
                        strokeWidth="2.5"
                        strokeDasharray="3 3"
                      />
                    )}

                    {/* Main Dot */}
                    <circle
                      r={isSelected ? "11" : "8"}
                      fill={status.color}
                      stroke="#020617"
                      strokeWidth="2.5"
                      className="shadow-lg"
                    />

                    {/* Inner core */}
                    <circle r="3" fill="#FFFFFF" opacity="0.9" />

                    {/* Mini Label */}
                    <text
                      y="-12"
                      textAnchor="middle"
                      fill={isSelected ? '#FFFFFF' : '#CBD5E1'}
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                      className="pointer-events-none drop-shadow-md"
                    >
                      {bin.binId}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Compass / Orientation indicator */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-400">
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kigali Metropolitan Grid • 1:25,000</span>
          </div>
        </div>

        {/* Right 4 cols: Active SmartBin Preview Drawer */}
        <div className="lg:col-span-4">
          {activeBin ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col justify-between h-full space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {activeBin.binId}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        activeBin.connectivityStatus === 'ONLINE'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {activeBin.connectivityStatus}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-slate-400">{activeBin.district}</span>
                </div>

                <h3 className="font-bold text-base text-white mt-3">{activeBin.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  {activeBin.location}
                </p>

                <div className="text-[11px] font-mono text-slate-500 mt-1">
                  GPS: {activeBin.latitude.toFixed(4)}°N, {activeBin.longitude.toFixed(4)}°E
                </div>

                {/* 3 Compartments Breakdown */}
                <div className="space-y-3 mt-4">
                  {/* Food */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-emerald-400">FOOD WASTE</span>
                      <span className="text-white font-mono">{activeBin.foodFillLevel}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          activeBin.foodFillLevel >= 80 ? 'bg-red-500' : activeBin.foodFillLevel >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${activeBin.foodFillLevel}%` }}
                      />
                    </div>
                  </div>

                  {/* Recycling */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-sky-400">RECYCLING WASTE</span>
                      <span className="text-white font-mono">{activeBin.recyclingFillLevel}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          activeBin.recyclingFillLevel >= 80 ? 'bg-red-500' : activeBin.recyclingFillLevel >= 60 ? 'bg-amber-500' : 'bg-sky-500'
                        }`}
                        style={{ width: `${activeBin.recyclingFillLevel}%` }}
                      />
                    </div>
                  </div>

                  {/* General */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-300">GENERAL WASTE</span>
                      <span className="text-white font-mono">{activeBin.generalFillLevel}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          activeBin.generalFillLevel >= 80 ? 'bg-red-500' : activeBin.generalFillLevel >= 60 ? 'bg-amber-500' : 'bg-slate-400'
                        }`}
                        style={{ width: `${activeBin.generalFillLevel}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Battery & Temp */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800 text-xs">
                  <div className="bg-slate-950 p-2.5 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Station Battery:</span>
                    <span className="font-mono font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                      <Battery className="w-3.5 h-3.5" /> {activeBin.batteryLevel}%
                    </span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Sensor Temp:</span>
                    <span className="font-mono font-bold text-amber-400 flex items-center gap-1 mt-0.5">
                      <Thermometer className="w-3.5 h-3.5" /> {activeBin.temperature}°C
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  id={`btn-map-dispatch-${activeBin.binId}`}
                  onClick={() => {
                    setSelectedBinId(activeBin.binId);
                    setCurrentTab('collections');
                  }}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  Dispatch Collection to This Station
                </button>

                <button
                  onClick={() => {
                    setSelectedBinId(activeBin.binId);
                    setCurrentTab('smartbins');
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors"
                >
                  Full Station Diagnostics &rarr;
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center text-slate-500 h-full flex flex-col items-center justify-center">
              <MapPin className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-xs font-semibold text-slate-300">Select a SmartBin marker</p>
              <p className="text-[11px] text-slate-500 mt-1">Click any pin on the map to inspect live sensor telemetry.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
