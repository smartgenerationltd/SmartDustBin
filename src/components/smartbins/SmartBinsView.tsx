import React, { useState } from 'react';
import { useSmartBin } from '../../context/SmartBinContext';
import { SmartBin, CompartmentType } from '../../types';
import { SmartBinDetailModal } from './SmartBinDetailModal';
import {
  Trash2,
  Search,
  Filter,
  Plus,
  LayoutGrid,
  Table as TableIcon,
  Wifi,
  WifiOff,
  Thermometer,
  Battery,
  Sun,
  AlertTriangle,
  CheckCircle,
  Truck,
  Activity,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';

export const SmartBinsView: React.FC = () => {
  const {
    bins,
    ads,
    selectedBin,
    setSelectedBinId,
    setCurrentTab,
    addNewSmartBin,
    searchQuery,
    setSearchQuery,
  } = useSmartBin();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [districtFilter, setDistrictFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New bin form state
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDistrict, setNewDistrict] = useState('Gasabo');

  const filteredBins = bins.filter((bin) => {
    const matchesSearch =
      bin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bin.binId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bin.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDistrict = districtFilter === 'ALL' || bin.district === districtFilter;

    const isCritical = bin.foodFillLevel >= 80 || bin.recyclingFillLevel >= 80 || bin.generalFillLevel >= 80;
    const isWarning =
      !isCritical && (bin.foodFillLevel >= 60 || bin.recyclingFillLevel >= 60 || bin.generalFillLevel >= 60);

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'CRITICAL' && isCritical) ||
      (statusFilter === 'WARNING' && isWarning) ||
      (statusFilter === 'NORMAL' && !isCritical && !isWarning) ||
      (statusFilter === 'OFFLINE' && bin.connectivityStatus === 'OFFLINE');

    return matchesSearch && matchesDistrict && matchesStatus;
  });

  const handleCreateBin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newLocation) return;
    addNewSmartBin({
      name: newName,
      location: newLocation,
      district: newDistrict,
    });
    setNewName('');
    setNewLocation('');
    setShowAddModal(false);
  };

  const getFillBadge = (level: number) => {
    if (level >= 80) return 'bg-red-500/20 text-red-400 border border-red-500/40 font-bold';
    if (level >= 60) return 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold';
    return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
  };

  return (
    <div id="smartbins-view" className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">SmartBin Fleet Management</h1>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 font-mono text-xs font-bold border border-slate-700">
              {bins.length} Stations
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor and manage physical IoT smart waste stations across Kigali municipality.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Grid / Table switch */}
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'grid' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'table' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            id="btn-add-smartbin"
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Commission Station
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stations by name, ID or landmark..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* District Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-slate-500 font-medium">District:</span>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Kigali</option>
              <option value="Nyarugenge" className="bg-slate-900">Nyarugenge</option>
              <option value="Gasabo" className="bg-slate-900">Gasabo</option>
              <option value="Kicukiro" className="bg-slate-900">Kicukiro</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Statuses</option>
              <option value="CRITICAL" className="bg-slate-900">🚨 Collection Required (&ge;80%)</option>
              <option value="WARNING" className="bg-slate-900">⚠️ Warning (60-79%)</option>
              <option value="NORMAL" className="bg-slate-900">✅ Normal (0-59%)</option>
              <option value="OFFLINE" className="bg-slate-900">⚡ Offline</option>
            </select>
          </div>
        </div>
      </div>

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredBins.map((bin) => {
            const isCritical =
              bin.foodFillLevel >= 80 || bin.recyclingFillLevel >= 80 || bin.generalFillLevel >= 80;
            const activeAd = ads.find((a) => a.id === bin.activeAdCampaignId) || ads[0];

            return (
              <div
                key={bin.binId}
                id={`bin-card-${bin.binId}`}
                className={`bg-slate-900 border ${
                  isCritical ? 'border-red-500/50 shadow-md shadow-red-950/20' : 'border-slate-800'
                } rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-500/50 transition-all`}
              >
                <div>
                  {/* Top Line */}
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {bin.binId}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                          bin.connectivityStatus === 'ONLINE'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {bin.connectivityStatus}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
                      <span className="flex items-center gap-1">
                        <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                        {bin.temperature}°C
                      </span>
                      <span className="flex items-center gap-1">
                        <Battery className="w-3.5 h-3.5 text-emerald-400" />
                        {bin.batteryLevel}%
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-sm text-white">{bin.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                    {bin.location}
                  </p>

                  {/* 3 Compartments mini meters */}
                  <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                    {/* Food */}
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/80">
                      <div className="flex justify-between items-center text-[10px] font-bold text-emerald-400">
                        <span>FOOD</span>
                        <span className="font-mono">{bin.foodFillLevel}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1.5">
                        <div
                          className={`h-full ${
                            bin.foodFillLevel >= 80 ? 'bg-red-500' : bin.foodFillLevel >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${bin.foodFillLevel}%` }}
                        />
                      </div>
                    </div>

                    {/* Recycling */}
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/80">
                      <div className="flex justify-between items-center text-[10px] font-bold text-sky-400">
                        <span>RECYCLE</span>
                        <span className="font-mono">{bin.recyclingFillLevel}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1.5">
                        <div
                          className={`h-full ${
                            bin.recyclingFillLevel >= 80 ? 'bg-red-500' : bin.recyclingFillLevel >= 60 ? 'bg-amber-500' : 'bg-sky-500'
                          }`}
                          style={{ width: `${bin.recyclingFillLevel}%` }}
                        />
                      </div>
                    </div>

                    {/* General */}
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/80">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-300">
                        <span>GENERAL</span>
                        <span className="font-mono">{bin.generalFillLevel}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1.5">
                        <div
                          className={`h-full ${
                            bin.generalFillLevel >= 80 ? 'bg-red-500' : bin.generalFillLevel >= 60 ? 'bg-amber-500' : 'bg-slate-400'
                          }`}
                          style={{ width: `${bin.generalFillLevel}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">
                    Last update: <span className="text-slate-400">{bin.lastUpdated}</span>
                  </span>

                  <button
                    id={`btn-open-diagnostics-${bin.binId}`}
                    onClick={() => setSelectedBinId(bin.binId)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Open Diagnostics &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Station ID</th>
                  <th className="px-4 py-3">Name & Location</th>
                  <th className="px-4 py-3 text-center">Food Fill</th>
                  <th className="px-4 py-3 text-center">Recycling Fill</th>
                  <th className="px-4 py-3 text-center">General Fill</th>
                  <th className="px-4 py-3 text-center">Temp / Battery</th>
                  <th className="px-4 py-3 text-center">Connectivity</th>
                  <th className="px-4 py-3">Last Update</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredBins.map((bin) => (
                  <tr
                    key={bin.binId}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-bold text-white">
                      {bin.binId}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{bin.name}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                        {bin.location}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded ${getFillBadge(bin.foodFillLevel)}`}>
                        {bin.foodFillLevel}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded ${getFillBadge(bin.recyclingFillLevel)}`}>
                        {bin.recyclingFillLevel}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded ${getFillBadge(bin.generalFillLevel)}`}>
                        {bin.generalFillLevel}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono">
                      <span className="text-amber-400">{bin.temperature}°C</span> /{' '}
                      <span className="text-emerald-400">{bin.batteryLevel}%</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                          bin.connectivityStatus === 'ONLINE'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {bin.connectivityStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-400 whitespace-nowrap">
                      {bin.lastUpdated}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedBinId(bin.binId)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 font-semibold text-xs transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Commission Station Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              Commission New Smart Station
            </h2>
            <p className="text-xs text-slate-400">
              Provision a new SG SmartBin station with ESP32 microcontroller identity and multi-compartment sensor node.
            </p>

            <form onSubmit={handleCreateBin} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Station Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kigali Convention Centre - Gate 3"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Specific Location / Landmark:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KG 2 Roundabout, Kimihurura Sector"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">District:</label>
                <select
                  value={newDistrict}
                  onChange={(e) => setNewDistrict(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                >
                  <option value="Gasabo">Gasabo District</option>
                  <option value="Nyarugenge">Nyarugenge District</option>
                  <option value="Kicukiro">Kicukiro District</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20"
                >
                  Register Station
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Single SmartBin Detail Modal (if selected) */}
      {selectedBin && (
        <SmartBinDetailModal
          bin={selectedBin}
          onClose={() => setSelectedBinId(null)}
        />
      )}
    </div>
  );
};
