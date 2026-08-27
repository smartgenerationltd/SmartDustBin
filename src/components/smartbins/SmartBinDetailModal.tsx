import React, { useState } from 'react';
import { SmartBin, ESP32TelemetryPayload } from '../../types';
import { useSmartBin } from '../../context/SmartBinContext';
import {
  X,
  MapPin,
  Thermometer,
  Droplets,
  Battery,
  Sun,
  Wifi,
  Radio,
  Cpu,
  Calendar,
  AlertTriangle,
  QrCode,
  Truck,
  Activity,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  Send,
} from 'lucide-react';

interface SmartBinDetailModalProps {
  bin: SmartBin;
  onClose: () => void;
}

export const SmartBinDetailModal: React.FC<SmartBinDetailModalProps> = ({ bin, onClose }) => {
  const {
    ingestTelemetry,
    scheduleCollection,
    triggerBinSelfTest,
    toggleBinConnectivity,
    setCurrentTab,
  } = useSmartBin();

  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'timeline' | 'simulator'>('overview');
  const [isSelfTesting, setIsSelfTesting] = useState(false);
  const [simFood, setSimFood] = useState(bin.foodFillLevel);
  const [simRec, setSimRec] = useState(bin.recyclingFillLevel);
  const [simGen, setSimGen] = useState(bin.generalFillLevel);
  const [simTemp, setSimTemp] = useState(bin.temperature);
  const [simBat, setSimBat] = useState(bin.batteryLevel);
  const [simSuccessMsg, setSimSuccessMsg] = useState('');

  const readings = bin.recentReadings || [];

  const handleRunSelfTest = () => {
    setIsSelfTesting(true);
    triggerBinSelfTest(bin.binId);
    setTimeout(() => {
      setIsSelfTesting(false);
    }, 1200);
  };

  const handleSendSimulatedTelemetry = async () => {
    const payload: ESP32TelemetryPayload = {
      binId: bin.binId,
      timestamp: new Date().toISOString(),
      foodFillLevel: Number(simFood),
      recyclingFillLevel: Number(simRec),
      generalFillLevel: Number(simGen),
      temperature: Number(simTemp),
      humidity: bin.humidity,
      batteryLevel: Number(simBat),
      connectivity: bin.connectivityStatus,
    };

    await ingestTelemetry(payload);
    setSimSuccessMsg('ESP32 telemetry frame ingested successfully into station state!');
    setTimeout(() => setSimSuccessMsg(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div
        id={`smartbin-detail-modal-${bin.binId}`}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-mono font-bold">
              {bin.binId.split('-')[2]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">{bin.name}</h2>
                <span className="font-mono text-xs font-bold text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {bin.binId}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    bin.connectivityStatus === 'ONLINE'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {bin.connectivityStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                {bin.location} ({bin.latitude.toFixed(4)}°N, {bin.longitude.toFixed(4)}°E)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="px-6 bg-slate-950/60 border-b border-slate-800 flex gap-2 overflow-x-auto text-xs">
          {[
            { id: 'overview', label: 'Telemetry Overview' },
            { id: 'charts', label: 'Historical Trend Charts' },
            { id: 'timeline', label: 'Sensor Events Log' },
            { id: 'simulator', label: 'ESP32 Ingest Simulator' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-emerald-400 text-emerald-400 bg-slate-900/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Three Compartment Live Status */}
              <div>
                <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">
                  Lower Section: 3 Waste Compartments Fill Telemetry
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Food Waste */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-emerald-400">FOOD WASTE</span>
                      <span className="font-mono text-xs font-bold text-slate-300">
                        {bin.foodFillLevel}%
                      </span>
                    </div>
                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden my-2">
                      <div
                        className={`h-full ${
                          bin.foodFillLevel >= 80 ? 'bg-red-500' : bin.foodFillLevel >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${bin.foodFillLevel}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-400 flex justify-between">
                      <span>Organic Material</span>
                      <span>{bin.foodFillLevel >= 80 ? '⚠️ Collection Due' : 'Normal'}</span>
                    </div>
                  </div>

                  {/* Recycling Waste */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-sky-400">RECYCLING WASTE</span>
                      <span className="font-mono text-xs font-bold text-slate-300">
                        {bin.recyclingFillLevel}%
                      </span>
                    </div>
                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden my-2">
                      <div
                        className={`h-full ${
                          bin.recyclingFillLevel >= 80 ? 'bg-red-500' : bin.recyclingFillLevel >= 60 ? 'bg-amber-500' : 'bg-sky-500'
                        }`}
                        style={{ width: `${bin.recyclingFillLevel}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-400 flex justify-between">
                      <span>Plastics & Aluminum</span>
                      <span>{bin.recyclingFillLevel >= 80 ? '🚨 Urgent Clear' : 'Normal'}</span>
                    </div>
                  </div>

                  {/* General Waste */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-300">GENERAL WASTE</span>
                      <span className="font-mono text-xs font-bold text-slate-300">
                        {bin.generalFillLevel}%
                      </span>
                    </div>
                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden my-2">
                      <div
                        className={`h-full ${
                          bin.generalFillLevel >= 80 ? 'bg-red-500' : bin.generalFillLevel >= 60 ? 'bg-amber-500' : 'bg-slate-400'
                        }`}
                        style={{ width: `${bin.generalFillLevel}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-400 flex justify-between">
                      <span>Residual Waste</span>
                      <span>{bin.generalFillLevel >= 80 ? '⚠️ Collection Due' : 'Normal'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hardware Diagnostics & Environmental Metrics */}
              <div>
                <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">
                  Hardware Node & Environmental Sensors
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Thermometer className="w-4 h-4 text-amber-400" />
                      <span>Internal Temp</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-white mt-1">
                      {bin.temperature}°C
                    </div>
                    <span className="text-[10px] text-slate-400">Fan: Auto</span>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Droplets className="w-4 h-4 text-sky-400" />
                      <span>Chamber Humidity</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-white mt-1">
                      {bin.humidity}%
                    </div>
                    <span className="text-[10px] text-slate-400">Normal Range</span>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Battery className="w-4 h-4 text-emerald-400" />
                      <span>LiFePO4 Battery</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-white mt-1">
                      {bin.batteryLevel}%
                    </div>
                    <span className="text-[10px] text-emerald-400">Solar 18.4V</span>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Sun className="w-4 h-4 text-yellow-400" />
                      <span>Solar Inverter</span>
                    </div>
                    <div className="text-lg font-bold font-mono text-white mt-1 truncate">
                      {bin.solarStatus}
                    </div>
                    <span className="text-[10px] text-slate-400">Monocrystalline</span>
                  </div>
                </div>
              </div>

              {/* Station Identity & Hardware Metadata */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Station Identity & IoT Specifications
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Hardware Model:</span>
                    <span className="font-mono text-slate-200 font-semibold">{bin.hardwareModel}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Firmware Version:</span>
                    <span className="font-mono text-slate-200 font-semibold">{bin.firmwareVersion}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Last Telemetry Ping:</span>
                    <span className="text-slate-200 font-semibold">{bin.lastUpdated}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Maintenance State:</span>
                    <span className="font-mono text-emerald-400 font-bold">{bin.maintenanceStatus}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Total Clearances:</span>
                    <span className="font-mono text-slate-200 font-semibold">{bin.totalCollectionsCount} times</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Station QR Code:</span>
                    <span className="font-mono text-slate-200 font-semibold">{bin.qrCodeId}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunSelfTest}
                    disabled={isSelfTesting}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 border border-slate-700 transition-colors"
                  >
                    <Activity className={`w-4 h-4 text-emerald-400 ${isSelfTesting ? 'animate-spin' : ''}`} />
                    {isSelfTesting ? 'Executing Hardware Diagnostics...' : 'Trigger Station Self-Test'}
                  </button>

                  <button
                    onClick={() => toggleBinConnectivity(bin.binId)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
                  >
                    Simulate: {bin.connectivityStatus === 'ONLINE' ? 'Set Offline' : 'Set Online'}
                  </button>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    setCurrentTab('collections');
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-500/20"
                >
                  <Truck className="w-4 h-4 text-slate-950" />
                  Dispatch Collection Team
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: HISTORICAL CHARTS */}
          {activeTab === 'charts' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">
                  24-Hour Waste Accumulation Curves (Food vs. Recycling vs. General)
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Continuous ultrasonic telemetry sampled every hour.
                </p>

                {/* SVG Visualized Trend Chart */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                  <div className="h-56 w-full relative flex items-end justify-between gap-1 pt-6 pb-2">
                    {readings.map((r, i) => {
                      const hourStr = new Date(r.timestamp).getHours() + ':00';
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                          {/* Tooltip on hover */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 bg-slate-900 border border-slate-700 p-2 rounded-lg text-[10px] z-20 pointer-events-none whitespace-nowrap shadow-xl">
                            <div className="font-bold text-white">{hourStr}</div>
                            <div className="text-emerald-400">Food: {r.foodFillLevel}%</div>
                            <div className="text-sky-400">Recycling: {r.recyclingFillLevel}%</div>
                            <div className="text-slate-300">General: {r.generalFillLevel}%</div>
                            <div className="text-amber-400">Temp: {r.temperature}°C</div>
                          </div>

                          {/* Bars container */}
                          <div className="w-full flex items-end justify-center gap-0.5 h-40">
                            <div
                              className="w-1.5 bg-emerald-500 rounded-t-sm transition-all duration-300"
                              style={{ height: `${r.foodFillLevel}%` }}
                            />
                            <div
                              className="w-1.5 bg-sky-500 rounded-t-sm transition-all duration-300"
                              style={{ height: `${r.recyclingFillLevel}%` }}
                            />
                            <div
                              className="w-1.5 bg-slate-400 rounded-t-sm transition-all duration-300"
                              style={{ height: `${r.generalFillLevel}%` }}
                            />
                          </div>

                          {/* Hour label */}
                          {i % 4 === 0 && (
                            <span className="text-[9px] font-mono text-slate-500 mt-1">{hourStr}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-900 text-xs font-mono">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" /> Food Waste
                    </span>
                    <span className="flex items-center gap-1.5 text-sky-400">
                      <span className="w-2.5 h-2.5 bg-sky-500 rounded-sm" /> Recycling
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-2.5 h-2.5 bg-slate-400 rounded-sm" /> General Waste
                    </span>
                  </div>
                </div>
              </div>

              {/* Temperature & Battery Graph */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      <Thermometer className="w-4 h-4" /> Temperature Cycle (°C)
                    </span>
                    <span className="font-mono text-slate-300">Current: {bin.temperature}°C</span>
                  </div>
                  <div className="h-28 flex items-end gap-1">
                    {readings.map((r, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-amber-500/40 hover:bg-amber-400 rounded-t-sm transition-all"
                        style={{ height: `${(r.temperature / 45) * 100}%` }}
                        title={`${r.temperature}°C`}
                      />
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <Battery className="w-4 h-4" /> Battery Discharge / Solar Charge
                    </span>
                    <span className="font-mono text-slate-300">Current: {bin.batteryLevel}%</span>
                  </div>
                  <div className="h-28 flex items-end gap-1">
                    {readings.map((r, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-emerald-500/40 hover:bg-emerald-400 rounded-t-sm transition-all"
                        style={{ height: `${r.batteryLevel}%` }}
                        title={`${r.batteryLevel}%`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SENSOR TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Real-Time Hardware Sensor Event Log
              </h3>

              <div className="space-y-3">
                {bin.events && bin.events.length > 0 ? (
                  bin.events.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-3 text-xs"
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          ev.severity === 'CRITICAL'
                            ? 'bg-red-500/20 text-red-400'
                            : ev.severity === 'WARNING'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white font-mono">{ev.type}</span>
                          <span className="text-[11px] text-slate-500">{ev.timestamp}</span>
                        </div>
                        <p className="text-slate-300 mt-1 text-[11px] leading-relaxed">{ev.description}</p>
                        {ev.compartment && (
                          <span className="inline-block mt-1.5 px-2 py-0.5 rounded bg-slate-800 text-[10px] text-emerald-400 font-mono">
                            Target: {ev.compartment}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-6">No historical anomalies logged.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ESP32 INGEST SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-5">
              <div className="p-4 bg-slate-950 border border-emerald-500/30 rounded-2xl">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
                  <Cpu className="w-4 h-4" />
                  ESP32 Microcontroller Live Ingestion Tester
                </div>
                <p className="text-xs text-slate-400">
                  Simulate an incoming HTTP POST payload from the physical SmartBin ESP32 hardware to verify telemetry processing and alert generation.
                </p>
              </div>

              {simSuccessMsg && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  {simSuccessMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Food Waste Fill ({simFood}%):
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={simFood}
                    onChange={(e) => setSimFood(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Recycling Fill ({simRec}%):
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={simRec}
                    onChange={(e) => setSimRec(Number(e.target.value))}
                    className="w-full accent-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    General Fill ({simGen}%):
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={simGen}
                    onChange={(e) => setSimGen(Number(e.target.value))}
                    className="w-full accent-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Temperature ({simTemp}°C):
                  </label>
                  <input
                    type="range"
                    min="15"
                    max="50"
                    value={simTemp}
                    onChange={(e) => setSimTemp(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Battery Level ({simBat}%):
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={simBat}
                    onChange={(e) => setSimBat(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>
              </div>

              {/* JSON Payload Preview */}
              <div>
                <span className="text-xs uppercase font-bold text-slate-400 block mb-1 font-mono">
                  Incoming ESP32 JSON Payload:
                </span>
                <pre className="p-3 bg-black/80 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto">
{JSON.stringify(
  {
    binId: bin.binId,
    timestamp: new Date().toISOString(),
    foodFillLevel: simFood,
    recyclingFillLevel: simRec,
    generalFillLevel: simGen,
    temperature: simTemp,
    humidity: bin.humidity,
    batteryLevel: simBat,
    connectivity: bin.connectivityStatus,
  },
  null,
  2
)}
                </pre>
              </div>

              <button
                id="btn-trigger-esp32-ingest"
                onClick={handleSendSimulatedTelemetry}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Transmit Simulated ESP32 Telemetry Frame
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
