import React, { useState } from 'react';
import { useSmartBin } from '../../context/SmartBinContext';
import { CollectionRecord, CompartmentType } from '../../types';
import {
  Truck,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  User,
  Scale,
  Sparkles,
  MapPin,
  Filter,
  Check,
  X,
  FileText,
} from 'lucide-react';

export const CollectionsView: React.FC = () => {
  const {
    collections,
    bins,
    users,
    scheduleCollection,
    completeCollection,
    selectedBinId,
  } = useSmartBin();

  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [completeModalRecord, setCompleteModalRecord] = useState<CollectionRecord | null>(null);

  // Scheduling Form
  const [formBinId, setFormBinId] = useState<string>(selectedBinId || bins[0]?.binId || '');
  const [formCollectorId, setFormCollectorId] = useState<string>(
    users.find((u) => u.role === 'COLLECTOR')?.id || users[0]?.id || ''
  );
  const [formCompartments, setFormCompartments] = useState<CompartmentType[]>([
    'FOOD',
    'RECYCLING',
    'GENERAL',
  ]);
  const [formNotes, setFormNotes] = useState<string>('Routine automated smart clearance dispatch');

  // Completion Form
  const [completeWeight, setCompleteWeight] = useState<number>(45.5);
  const [completeNotes, setCompleteNotes] = useState<string>('All three compartments safely sanitized and cleared.');

  const collectors = users.filter((u) => u.role === 'COLLECTOR' || u.role === 'OPERATOR');

  const urgentBins = bins.filter(
    (b) => b.foodFillLevel >= 80 || b.recyclingFillLevel >= 80 || b.generalFillLevel >= 80
  );

  const filteredCollections = collections.filter((c) => {
    if (filterStatus === 'ALL') return true;
    return c.status === filterStatus;
  });

  const handleToggleCompartment = (comp: CompartmentType) => {
    if (formCompartments.includes(comp)) {
      if (formCompartments.length > 1) {
        setFormCompartments(formCompartments.filter((c) => c !== comp));
      }
    } else {
      setFormCompartments([...formCompartments, comp]);
    }
  };

  const handleSubmitSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    scheduleCollection(formBinId, formCollectorId, formCompartments, formNotes);
    setShowScheduleModal(false);
  };

  const handleConfirmComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeModalRecord) return;
    completeCollection(completeModalRecord.id, completeWeight, completeNotes);
    setCompleteModalRecord(null);
  };

  return (
    <div id="collections-view" className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-400" />
              Waste Collection & Route Dispatch
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-xs">
              {collections.length} Total Records
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated sensor-triggered pickups, route clearance workflows, and municipal audit logs.
          </p>
        </div>

        <button
          id="btn-schedule-dispatch"
          onClick={() => setShowScheduleModal(true)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Dispatch Collection Team
        </button>
      </div>

      {/* Overflow Urgent Warning Banner (if any) */}
      {urgentBins.length > 0 && (
        <div className="bg-red-950/20 border border-red-500/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0 animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-red-300">
                {urgentBins.length} SmartBins Exceed Safe Fill Capacity (&ge;80%)
              </div>
              <p className="text-[11px] text-slate-400">
                Automated ultrasonic alerts recommend immediate route optimization and truck assignment.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setFormBinId(urgentBins[0].binId);
              setShowScheduleModal(true);
            }}
            className="px-3.5 py-1.5 bg-red-500 hover:bg-red-400 text-slate-950 text-xs font-bold rounded-xl transition-colors shrink-0"
          >
            Dispatch for {urgentBins[0].binId}
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Dispatches' },
            { id: 'SCHEDULED', label: 'Scheduled Queue' },
            { id: 'IN_PROGRESS', label: 'In Transit' },
            { id: 'COMPLETED', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500 font-mono hidden md:inline">
          Showing {filteredCollections.length} records
        </span>
      </div>

      {/* Collections Table / Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Dispatch ID</th>
                <th className="px-4 py-3">Target Smart Station</th>
                <th className="px-4 py-3">Assigned Collector</th>
                <th className="px-4 py-3">Target Compartments</th>
                <th className="px-4 py-3">Scheduled Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Weight (Kg)</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCollections.map((col) => (
                <tr key={col.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-white">
                    {col.id}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white">{col.binName}</div>
                    <div className="text-[10px] font-mono text-emerald-400">{col.binId}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-slate-200">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{col.collectorName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {col.compartmentsCleared.map((comp) => (
                        <span
                          key={comp}
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                            comp === 'FOOD'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : comp === 'RECYCLING'
                              ? 'bg-sky-500/20 text-sky-300'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                    {col.scheduledDate}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                        col.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : col.status === 'IN_PROGRESS'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {col.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-200">
                    {col.totalWeightKg ? `${col.totalWeightKg} kg` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {col.status !== 'COMPLETED' ? (
                      <button
                        id={`btn-complete-col-${col.id}`}
                        onClick={() => setCompleteModalRecord(col)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
                      >
                        Mark Completed
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-semibold flex items-center justify-end gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Cleared
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Dispatch Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                Schedule Collector Dispatch
              </h2>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitSchedule} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target SmartBin Station:</label>
                <select
                  value={formBinId}
                  onChange={(e) => setFormBinId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                >
                  {bins.map((b) => (
                    <option key={b.binId} value={b.binId}>
                      {b.binId} - {b.name} (Food: {b.foodFillLevel}%, Rec: {b.recyclingFillLevel}%, Gen: {b.generalFillLevel}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned Route Collector:</label>
                <select
                  value={formCollectorId}
                  onChange={(e) => setFormCollectorId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                >
                  {collectors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.role} - {c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Compartments to Clear:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['FOOD', 'RECYCLING', 'GENERAL'] as CompartmentType[]).map((comp) => (
                    <button
                      type="button"
                      key={comp}
                      onClick={() => handleToggleCompartment(comp)}
                      className={`p-2.5 rounded-xl border font-bold text-center transition-colors ${
                        formCompartments.includes(comp)
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                          : 'bg-slate-950 text-slate-500 border-slate-800'
                      }`}
                    >
                      {comp}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Dispatch Notes / Route Priority:</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Collection Modal */}
      {completeModalRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              Complete Waste Clearance
            </h2>
            <p className="text-xs text-slate-400">
              Confirm physical station clearance for <strong>{completeModalRecord.binName}</strong> ({completeModalRecord.binId}).
              This will automatically reset ultrasonic fill sensors to clean status.
            </p>

            <form onSubmit={handleConfirmComplete} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Total Waste Weight Measured (Kg):</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={completeWeight}
                  onChange={(e) => setCompleteWeight(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Sanitization / Maintenance Notes:</label>
                <textarea
                  rows={2}
                  value={completeNotes}
                  onChange={(e) => setCompleteNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCompleteModalRecord(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                >
                  Log Clean & Reset Sensors
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
