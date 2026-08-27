import React, { useState } from 'react';
import { useSmartBin } from '../../context/SmartBinContext';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  Filter,
  ShieldAlert,
  Flame,
  BatteryCharging,
  WifiOff,
  Thermometer,
  Layers,
} from 'lucide-react';

export const AlertsView: React.FC = () => {
  const {
    alerts,
    markAlertAsRead,
    resolveAlert,
    unreadAlertsCount,
    setSelectedBinId,
    setCurrentTab,
  } = useSmartBin();
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter === 'ALL') return true;
    return a.severity === severityFilter;
  });

  const getSeverityIcon = (type: string, severity: string) => {
    if (type.includes('TEMPERATURE') || type.includes('HEAT')) {
      return <Thermometer className="w-4 h-4 text-amber-400" />;
    }
    if (type.includes('OFFLINE') || type.includes('HEARTBEAT')) {
      return <WifiOff className="w-4 h-4 text-rose-400" />;
    }
    if (type.includes('BATTERY')) {
      return <BatteryCharging className="w-4 h-4 text-amber-400" />;
    }
    if (severity === 'CRITICAL') {
      return <AlertTriangle className="w-4 h-4 text-red-400" />;
    }
    return <Bell className="w-4 h-4 text-sky-400" />;
  };

  return (
    <div id="alerts-view" className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Bell className="w-5 h-5 text-red-400" />
              Sensor Alarms & Hardware Alerts
            </h1>
            {unreadAlertsCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-mono text-xs font-bold border border-red-500/40">
                {unreadAlertsCount} Unresolved
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated sensor anomalies, ultrasonic overflow flags, and environmental threshold alerts.
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
          {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-lg font-mono font-semibold transition-colors ${
                severityFilter === sev
                  ? 'bg-slate-800 text-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            id={`alert-item-${alert.id}`}
            className={`p-4 bg-slate-900 border ${
              !alert.read
                ? alert.severity === 'CRITICAL'
                  ? 'border-red-500/60 bg-red-950/10'
                  : 'border-amber-500/40 bg-amber-950/10'
                : 'border-slate-800'
            } rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all`}
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  alert.severity === 'CRITICAL'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : alert.severity === 'WARNING'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                }`}
              >
                {getSeverityIcon(alert.type, alert.severity)}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-white">{alert.title}</span>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-400'
                        : alert.severity === 'WARNING'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-sky-500/20 text-sky-300'
                    }`}
                  >
                    {alert.severity}
                  </span>
                  {!alert.read && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                </div>

                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{alert.message}</p>

                <div className="flex items-center gap-3 mt-2 text-[11px] font-mono text-slate-400">
                  <span className="text-emerald-400 font-bold">{alert.binId}</span>
                  <span>•</span>
                  <span>{alert.location}</span>
                  <span>•</span>
                  <span className="text-slate-500">{alert.timestamp}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
              <button
                onClick={() => {
                  setSelectedBinId(alert.binId);
                  setCurrentTab('smartbins');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Inspect Station
              </button>

              {!alert.read && (
                <button
                  id={`btn-read-alert-${alert.id}`}
                  onClick={() => markAlertAsRead(alert.id)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-colors"
                >
                  Acknowledge
                </button>
              )}

              {alert.status !== 'RESOLVED' && (
                <button
                  id={`btn-resolve-alert-${alert.id}`}
                  onClick={() => resolveAlert(alert.id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs border border-emerald-500/30 hover:border-emerald-500/60 transition-colors"
                >
                  Resolve
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredAlerts.length === 0 && (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-400">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-white">All Clear</h3>
            <p className="text-xs text-slate-500 mt-1">No alerts match the selected severity filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
