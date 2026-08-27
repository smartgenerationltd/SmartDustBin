import React, { useState } from 'react';
import { useSmartBin } from '../../context/SmartBinContext';
import { useAuth } from '../../context/AuthContext';
import {
  Settings,
  Cpu,
  Database,
  ShieldCheck,
  RefreshCw,
  Sliders,
  Copy,
  Check,
  Zap,
  Server,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    isDemoMode,
    simulationActive,
    setSimulationActive,
    resetToInitialData,
    bins,
    ads,
    collections,
    alerts,
    users,
    advertisers,
    aiInsights,
    maintenanceRecords,
    dbBackendName,
    isSyncing,
  } = useSmartBin();

  const { role: userRole } = useAuth();

  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'firestore' | 'iot' | 'simulation'>('firestore');

  const copyToClipboard = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const sampleEsp32CppCode = `// SG SmartBin ESP32 Microcontroller Firmware Snippet (C++)
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "SG_SMARTBIN_IOT_NET";
const char* password = "SECRET_WIFI_PASS";
const char* serverUrl = "https://sg-smartbin.agency.rw/api/iot/telemetry";

#define TRIG_PIN_FOOD 12
#define ECHO_PIN_FOOD 13
#define TRIG_PIN_REC  14
#define ECHO_PIN_REC  27
#define TRIG_PIN_GEN  26
#define ECHO_PIN_GEN  25

void sendTelemetry() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<300> doc;
    doc["binId"] = "SG-BIN-001";
    doc["timestamp"] = "2026-03-01T12:00:00Z";
    doc["foodFillLevel"] = readUltrasonic(TRIG_PIN_FOOD, ECHO_PIN_FOOD);
    doc["recyclingFillLevel"] = readUltrasonic(TRIG_PIN_REC, ECHO_PIN_REC);
    doc["generalFillLevel"] = readUltrasonic(TRIG_PIN_GEN, ECHO_PIN_GEN);
    doc["temperature"] = 28.5;
    doc["humidity"] = 58;
    doc["batteryLevel"] = 92;
    doc["connectivity"] = "ONLINE";

    String requestBody;
    serializeJson(doc, requestBody);
    int httpResponseCode = http.POST(requestBody);
    http.end();
  }
}`;

  const firestoreRulesCode = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    // 1. Users collection
    match /users/{userId} {
      allow read, write: if isAuthenticated();
    }

    // 2. SmartBins hardware collection
    match /bins/{binId} {
      allow read: if true; // Public oversight for citizen map
      allow write: if isAuthenticated();
    }

    // 3. Sensor Readings collection
    match /sensorReadings/{readingId} {
      allow read, write: if isAuthenticated();
    }

    // 4. Collections collection
    match /collections/{collectionId} {
      allow read, write: if isAuthenticated();
    }

    // 5. Alerts collection
    match /alerts/{alertId} {
      allow read, write: if isAuthenticated();
    }

    // 6. Advertisements collection
    match /advertisements/{adId} {
      allow read: if true; // Public display on LED screens
      allow write: if isAuthenticated();
    }

    // 7. Advertisers collection
    match /advertisers/{advId} {
      allow read, write: if isAuthenticated();
    }

    // 8. AI Insights collection
    match /aiInsights/{insightId} {
      allow read, write: if isAuthenticated();
    }

    // 9. Maintenance Records collection
    match /maintenanceRecords/{recordId} {
      allow read, write: if isAuthenticated();
    }
  }
}`;

  const modelsBreakdown = [
    { name: 'users', count: users.length, desc: 'Enterprise RBAC User Profiles & Role Credentials' },
    { name: 'bins', count: bins.length, desc: '3-Compartment Smart Waste Stations & IoT Sensors' },
    { name: 'sensorReadings', count: 120, desc: 'Ultrasonic Fill Level & Environmental Telemetry Logs' },
    { name: 'collections', count: collections.length, desc: 'Waste Logistics Pickups & Collector Assignments' },
    { name: 'alerts', count: alerts.length, desc: 'Hardware & Fill Level Overflow Alarms' },
    { name: 'advertisements', count: ads.length, desc: 'Digital Upper LED Screen Media Campaigns' },
    { name: 'advertisers', count: advertisers.length, desc: 'Corporate Brand Partners & Sponsors' },
    { name: 'aiInsights', count: aiInsights.length, desc: 'Gemini AI Waste Analytics & Route Optimizations' },
    { name: 'maintenanceRecords', count: maintenanceRecords.length, desc: 'Field Calibration & Hardware Service Records' },
  ];

  return (
    <div id="settings-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-400" />
              System Architecture &amp; Database Settings
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {dbBackendName}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Modular 9-model data service layer, Firebase Firestore rules, and ESP32 hardware webhook specifications.
          </p>
        </div>

        <button
          onClick={resetToInitialData}
          disabled={isSyncing}
          className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Re-seed Firestore Database'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-slate-900 border border-slate-800 p-1 rounded-2xl flex gap-1 max-w-lg text-xs">
        <button
          onClick={() => setActiveTab('firestore')}
          className={`flex-1 py-2 rounded-xl font-bold transition-colors ${
            activeTab === 'firestore'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Firestore Data Models (9)
        </button>
        <button
          onClick={() => setActiveTab('iot')}
          className={`flex-1 py-2 rounded-xl font-bold transition-colors ${
            activeTab === 'iot'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          ESP32 Ingestion Hub
        </button>
        <button
          onClick={() => setActiveTab('simulation')}
          className={`flex-1 py-2 rounded-xl font-bold transition-colors ${
            activeTab === 'simulation'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Simulation Engine
        </button>
      </div>

      {/* TAB 1: FIRESTORE DATA MODELS */}
      {activeTab === 'firestore' && (
        <div className="space-y-6">
          {/* Models Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {modelsBreakdown.map((m) => (
              <div
                key={m.name}
                className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-2 hover:border-emerald-500/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-400">/{m.name}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300 font-bold">
                    {m.count} records
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{m.desc}</p>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Firestore Document Store</span>
                  <span className="text-emerald-400">SYNCED</span>
                </div>
              </div>
            ))}
          </div>

          {/* Firestore Rules Block */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  Deployed Firebase Security Rules (`firestore.rules`)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Protects sensitive municipal telemetry, collection logs, and advertiser financial billing data.
                </p>
              </div>

              <button
                onClick={() => copyToClipboard(firestoreRulesCode, 'rules')}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
              >
                {copiedSection === 'rules' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedSection === 'rules' ? 'Copied' : 'Copy Rules'}
              </button>
            </div>

            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-mono text-sky-300 overflow-x-auto max-h-80">
              {firestoreRulesCode}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 2: ESP32 IOT INGESTION */}
      {activeTab === 'iot' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-emerald-400" />
                  Live IoT Webhook Ingestion API
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Physical SmartBins equipped with ESP32 microcontrollers transmit telemetry via HTTP POST.
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-emerald-400 bg-slate-950 border border-slate-800 px-3 py-1 rounded-xl">
                POST /api/iot/telemetry
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase font-bold text-slate-400 font-mono">
                Standard Telemetry JSON Payload Specification:
              </span>
              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-mono text-emerald-400 overflow-x-auto">
{`{
  "binId": "SG-BIN-001",                 // Unique physical hardware station ID
  "timestamp": "2026-03-01T10:30:00Z",    // ISO 8601 UTC timestamp
  "foodFillLevel": 68,                   // 0-100% Food compartment fill
  "recyclingFillLevel": 88,              // 0-100% Recycling compartment fill
  "generalFillLevel": 45,                // 0-100% General compartment fill
  "temperature": 29.4,                   // Chamber temperature in Celsius
  "humidity": 62,                        // Relative humidity percentage
  "batteryLevel": 91,                    // LiFePO4 battery level percentage
  "connectivity": "ONLINE"               // ONLINE | OFFLINE
}`}
              </pre>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-slate-400 font-mono">
                  ESP32 C++ Microcontroller Ingestion Code:
                </span>
                <button
                  onClick={() => copyToClipboard(sampleEsp32CppCode, 'cpp')}
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedSection === 'cpp' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSection === 'cpp' ? 'Copied' : 'Copy Code'}
                </button>
              </div>
              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-[11px] font-mono text-slate-300 overflow-x-auto max-h-64">
                {sampleEsp32CppCode}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SIMULATION CONTROLLER */}
      {activeTab === 'simulation' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-400" />
                Live Demo Simulation Parameters
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulates real-world waste deposits and solar battery charging ticks for live demonstration.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">IoT Periodic Heartbeat</div>
                  <p className="text-[11px] text-slate-400">Ticks every 14 seconds</p>
                </div>
                <button
                  onClick={() => setSimulationActive(!simulationActive)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors ${
                    simulationActive
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {simulationActive ? 'ENABLED' : 'PAUSED'}
                </button>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Station Auto-Alerts</div>
                  <p className="text-[11px] text-slate-400">Triggers on &ge;80% fill</p>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  ACTIVE
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
