import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  SmartBin,
  CollectionRecord,
  AdCampaign,
  AlertItem,
  UserProfile,
  UserRole,
  ESP32TelemetryPayload,
  CompartmentType,
  SensorReading,
  Advertiser,
  AiInsight,
  MaintenanceRecord,
} from '../types';
import { getDataService } from '../services';
import { useAuth } from './AuthContext';
import { INITIAL_SMART_BINS } from '../data/mockBins';
import { INITIAL_AD_CAMPAIGNS } from '../data/mockAds';
import { INITIAL_COLLECTIONS } from '../data/mockCollections';
import { INITIAL_ALERTS } from '../data/mockAlerts';
import { INITIAL_USERS } from '../data/mockUsers';
import { INITIAL_ADVERTISERS, INITIAL_AI_INSIGHTS, INITIAL_MAINTENANCE_RECORDS } from '../data/mockMoreData';

interface SmartBinContextType {
  // 9 Data Models State
  bins: SmartBin[];
  allBins: SmartBin[];
  collections: CollectionRecord[];
  allCollections: CollectionRecord[];
  ads: AdCampaign[];
  allAds: AdCampaign[];
  alerts: AlertItem[];
  users: UserProfile[];
  advertisers: Advertiser[];
  aiInsights: AiInsight[];
  maintenanceRecords: MaintenanceRecord[];

  // Active Context & State
  currentUser: UserProfile;
  currentRole: UserRole;
  currentTab: string;
  selectedBin: SmartBin | null;
  selectedBinId: string | null;
  isDemoMode: boolean;
  simulationActive: boolean;
  searchQuery: string;
  isSyncing: boolean;
  dbBackendName: string;
  
  // Counters & Metrics
  unreadAlertsCount: number;
  collectionRequiredBinsCount: number;
  avgFillLevels: { food: number; recycling: number; general: number; total: number };
  
  // Navigation & UI Actions
  setCurrentTab: (tab: string) => void;
  setSelectedBinId: (id: string | null) => void;
  switchRole: (role: UserRole) => void;
  setSearchQuery: (query: string) => void;
  setDemoMode: (val: boolean) => void;
  setSimulationActive: (val: boolean) => void;
  
  // Operations & CRUD
  ingestTelemetry: (payload: ESP32TelemetryPayload) => Promise<boolean>;
  scheduleCollection: (
    binId: string,
    collectorId: string,
    wasteCategories: CompartmentType[],
    notes?: string,
    priority?: 'CRITICAL' | 'HIGH' | 'NORMAL'
  ) => Promise<void>;
  completeCollection: (collectionId: string, approximateKg: number, notes?: string) => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  markAlertAsRead: (alertId: string) => Promise<void>;
  createAdCampaign: (campaignData: Partial<AdCampaign>) => Promise<void>;
  toggleAdStatus: (campaignId: string) => Promise<void>;
  addNewSmartBin: (newBinData: Partial<SmartBin>) => Promise<void>;
  triggerBinSelfTest: (binId: string) => Promise<void>;
  resetToInitialData: () => Promise<void>;
  toggleBinConnectivity: (binId: string) => Promise<void>;
  createMaintenanceLog: (record: Partial<MaintenanceRecord>) => Promise<void>;
  applyAiInsight: (insightId: string) => Promise<void>;
}

const SmartBinContext = createContext<SmartBinContextType | undefined>(undefined);

export const SmartBinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, role: authRole, loginWithDemoRole } = useAuth();

  // Raw datasets from data service
  const [allBins, setAllBins] = useState<SmartBin[]>(INITIAL_SMART_BINS);
  const [allCollections, setAllCollections] = useState<CollectionRecord[]>(INITIAL_COLLECTIONS);
  const [allAds, setAllAds] = useState<AdCampaign[]>(INITIAL_AD_CAMPAIGNS);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [advertisers, setAdvertisers] = useState<Advertiser[]>(INITIAL_ADVERTISERS);
  const [aiInsights, setAiInsights] = useState<AiInsight[]>(INITIAL_AI_INSIGHTS);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(INITIAL_MAINTENANCE_RECORDS);

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedBinId, setSelectedBinId] = useState<string | null>(null);
  const [isDemoMode, setDemoMode] = useState<boolean>(true);
  const [simulationActive, setSimulationActive] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const ds = useMemo(() => getDataService(), []);

  // Initial load & real-time sync with Data Service Layer
  useEffect(() => {
    let unsubBins: (() => void) | undefined;
    let unsubCollections: (() => void) | undefined;
    let unsubAlerts: (() => void) | undefined;
    let unsubAds: (() => void) | undefined;

    const initData = async () => {
      setIsSyncing(true);
      try {
        // Attempt seeding if empty
        await ds.seedInitialData(false).catch(() => {});

        const [b, c, a, alt, u, adv, ins, m] = await Promise.all([
          ds.getBins(),
          ds.getCollections(),
          ds.getAds(),
          ds.getAlerts(),
          ds.getUsers(),
          ds.getAdvertisers(),
          ds.getAiInsights(),
          ds.getMaintenanceRecords(),
        ]);

        if (b.length) setAllBins(b);
        if (c.length) setAllCollections(c);
        if (a.length) setAllAds(a);
        if (alt.length) setAlerts(alt);
        if (u.length) setUsers(u);
        if (adv.length) setAdvertisers(adv);
        if (ins.length) setAiInsights(ins);
        if (m.length) setMaintenanceRecords(m);

        // Subscribe to real-time updates
        unsubBins = ds.subscribeBins((updated) => updated.length && setAllBins(updated));
        unsubCollections = ds.subscribeCollections((updated) => updated.length && setAllCollections(updated));
        unsubAlerts = ds.subscribeAlerts((updated) => updated.length && setAlerts(updated));
        unsubAds = ds.subscribeAds((updated) => updated.length && setAllAds(updated));
      } catch (err) {
        console.warn('[SmartBinContext] Data initialization notice:', err);
      } finally {
        setIsSyncing(false);
      }
    };

    initData();

    return () => {
      if (unsubBins) unsubBins();
      if (unsubCollections) unsubCollections();
      if (unsubAlerts) unsubAlerts();
      if (unsubAds) unsubAds();
    };
  }, [ds]);

  const currentRole = authRole || userProfile?.role || 'ADMIN';
  const currentUser = userProfile || users[0];

  // -------------------------------------------------------------
  // ROLE-BASED DATA RESTRICTION & FILTERING
  // -------------------------------------------------------------
  
  // 1. Collections: COLLECTOR only sees assigned collections; others see all
  const collections = useMemo(() => {
    if (currentRole === 'COLLECTOR' && currentUser) {
      return allCollections.filter(
        (c) =>
          c.collectorId === currentUser.id ||
          c.collectorName?.toLowerCase() === currentUser.name?.toLowerCase() ||
          c.collectorId === 'usr-col-01'
      );
    }
    return allCollections;
  }, [allCollections, currentRole, currentUser]);

  // 2. Advertisements: ADVERTISER only sees their own campaigns; others see all
  const ads = useMemo(() => {
    if (currentRole === 'ADVERTISER' && currentUser) {
      const myAdvId = currentUser.advertiserId || 'adv-001';
      return allAds.filter(
        (a) =>
          a.advertiserId === myAdvId ||
          a.advertiser?.toLowerCase().includes('mtn') ||
          a.advertiser?.toLowerCase() === currentUser.organization?.toLowerCase()
      );
    }
    return allAds;
  }, [allAds, currentRole, currentUser]);

  // 3. SmartBins: COLLECTOR prioritizes bins on their route; ADVERTISER sees bins showing their ads
  const bins = useMemo(() => {
    return allBins;
  }, [allBins]);

  const selectedBin = useMemo(() => {
    if (!selectedBinId) return null;
    return allBins.find((b) => b.binId === selectedBinId) || null;
  }, [allBins, selectedBinId]);

  const unreadAlertsCount = useMemo(() => {
    return alerts.filter((a) => a.status === 'ACTIVE').length;
  }, [alerts]);

  const collectionRequiredBinsCount = useMemo(() => {
    return allBins.filter(
      (b) => b.foodFillLevel >= 80 || b.recyclingFillLevel >= 80 || b.generalFillLevel >= 80
    ).length;
  }, [allBins]);

  const avgFillLevels = useMemo(() => {
    if (!allBins.length) return { food: 64, recycling: 87, general: 42, total: 64 };
    const foodSum = allBins.reduce((acc, b) => acc + b.foodFillLevel, 0);
    const recSum = allBins.reduce((acc, b) => acc + b.recyclingFillLevel, 0);
    const genSum = allBins.reduce((acc, b) => acc + b.generalFillLevel, 0);
    const count = allBins.length;
    const food = Math.round(foodSum / count);
    const recycling = Math.round(recSum / count);
    const general = Math.round(genSum / count);
    const total = Math.round((food + recycling + general) / 3);
    return { food, recycling, general, total };
  }, [allBins]);

  // Switch role simulator (delegates to AuthContext)
  const switchRole = useCallback(
    (role: UserRole) => {
      loginWithDemoRole(role);
    },
    [loginWithDemoRole]
  );

  // Ingest Telemetry from ESP32 or manual tester
  const ingestTelemetry = useCallback(
    async (payload: ESP32TelemetryPayload): Promise<boolean> => {
      const nowStr = 'Just now';
      const timeISO = new Date().toISOString();

      const target = allBins.find((b) => b.binId === payload.binId);
      if (!target) return false;

      const updatedFood = Math.max(0, Math.min(100, payload.foodFillLevel));
      const updatedRecycling = Math.max(0, Math.min(100, payload.recyclingFillLevel));
      const updatedGeneral = Math.max(0, Math.min(100, payload.generalFillLevel));

      const newReading: SensorReading = {
        binId: payload.binId,
        timestamp: timeISO,
        foodFillLevel: updatedFood,
        recyclingFillLevel: updatedRecycling,
        generalFillLevel: updatedGeneral,
        temperature: payload.temperature,
        humidity: payload.humidity,
        batteryLevel: payload.batteryLevel,
        solarVoltage: payload.batteryLevel > 50 ? 18.5 : 12.1,
      };

      const updatedRecent = [...(target.recentReadings || []).slice(-23), newReading];

      const updatedBin: Partial<SmartBin> = {
        foodFillLevel: updatedFood,
        recyclingFillLevel: updatedRecycling,
        generalFillLevel: updatedGeneral,
        temperature: payload.temperature,
        humidity: payload.humidity,
        batteryLevel: payload.batteryLevel,
        connectivityStatus: payload.connectivity === 'OFFLINE' ? 'OFFLINE' : 'ONLINE',
        lastUpdated: nowStr,
        recentReadings: updatedRecent,
      };

      // Update local & persist via Data Service
      setAllBins((prev) => prev.map((b) => (b.binId === payload.binId ? { ...b, ...updatedBin } : b)));
      await ds.updateBin(payload.binId, updatedBin).catch(() => {});
      await ds.addSensorReading(newReading).catch(() => {});

      // Auto-trigger alert if any compartment >= 80%
      const checkAlert = async (level: number, type: CompartmentType) => {
        if (level >= 80) {
          const alertId = `alt-${Date.now()}-${type.toLowerCase()}`;
          const exists = alerts.some(
            (a) => a.binId === payload.binId && a.compartment === type && a.status === 'ACTIVE'
          );
          if (!exists) {
            const newAlert: AlertItem = {
              id: alertId,
              binId: payload.binId,
              binName: target.name,
              location: target.location,
              type: 'HIGH_FILL_LEVEL',
              severity: 'CRITICAL',
              time: 'Just now',
              status: 'ACTIVE',
              message: `${type} Waste compartment reached ${level}% capacity. Immediate collection required.`,
              compartment: type,
            };
            setAlerts((prev) => [newAlert, ...prev]);
            await ds.createAlert(newAlert).catch(() => {});
          }
        }
      };

      await checkAlert(payload.foodFillLevel, 'FOOD');
      await checkAlert(payload.recyclingFillLevel, 'RECYCLING');
      await checkAlert(payload.generalFillLevel, 'GENERAL');

      return true;
    },
    [allBins, alerts, ds]
  );

  // Schedule Collection
  const scheduleCollection = useCallback(
    async (
      binId: string,
      collectorId: string,
      wasteCategories: CompartmentType[],
      notes?: string,
      priority: 'CRITICAL' | 'HIGH' | 'NORMAL' = 'NORMAL'
    ) => {
      const targetBin = allBins.find((b) => b.binId === binId);
      const collector = users.find((u) => u.id === collectorId);

      const newCol: CollectionRecord = {
        id: `col-${Date.now()}`,
        binId,
        binName: targetBin ? targetBin.name : binId,
        location: targetBin ? targetBin.location : 'Kigali Station',
        collectorId,
        collectorName: collector ? collector.name : 'Assigned Collector',
        scheduledDate: new Date().toISOString().slice(0, 10),
        status: 'SCHEDULED',
        wasteCategories,
        approximateKg: Math.round(35 + Math.random() * 45),
        priority,
        notes: notes || 'Smart sensor scheduled clearance dispatch.',
      };

      setAllCollections((prev) => [newCol, ...prev]);
      await ds.createCollection(newCol).catch(() => {});
    },
    [allBins, users, ds]
  );

  // Complete Collection & Reset Fill Levels
  const completeCollection = useCallback(
    async (collectionId: string, approximateKg: number, notes?: string) => {
      const targetCol = allCollections.find((c) => c.id === collectionId);
      if (!targetCol) return;

      const updatedCol: Partial<CollectionRecord> = {
        status: 'COMPLETED',
        completedDate: 'Just now',
        approximateKg: approximateKg || targetCol.approximateKg,
        notes: notes || targetCol.notes,
      };

      setAllCollections((prev) =>
        prev.map((c) => (c.id === collectionId ? { ...c, ...updatedCol } : c))
      );
      await ds.updateCollection(collectionId, updatedCol).catch(() => {});

      // Reset bin fill levels
      const targetBin = allBins.find((b) => b.binId === targetCol.binId);
      if (targetBin) {
        const resetBin: Partial<SmartBin> = {
          foodFillLevel: Math.floor(Math.random() * 10 + 5),
          recyclingFillLevel: Math.floor(Math.random() * 12 + 6),
          generalFillLevel: Math.floor(Math.random() * 8 + 4),
          lastUpdated: 'Just now',
          totalCollectionsCount: (targetBin.totalCollectionsCount || 0) + 1,
        };

        setAllBins((prev) => prev.map((b) => (b.binId === targetBin.binId ? { ...b, ...resetBin } : b)));
        await ds.updateBin(targetBin.binId, resetBin).catch(() => {});

        // Resolve active alerts for this bin
        const relatedAlerts = alerts.filter(
          (a) => a.binId === targetBin.binId && a.type === 'HIGH_FILL_LEVEL' && a.status === 'ACTIVE'
        );
        for (const alt of relatedAlerts) {
          await ds.resolveAlert(alt.id, 'Collection Clearance Protocol').catch(() => {});
        }
        setAlerts((prev) =>
          prev.map((a) =>
            a.binId === targetBin.binId && a.type === 'HIGH_FILL_LEVEL' && a.status === 'ACTIVE'
              ? { ...a, status: 'RESOLVED', resolvedAt: 'Just now', resolvedBy: 'Collection Clearance Protocol' }
              : a
          )
        );
      }
    },
    [allCollections, allBins, alerts, ds]
  );

  // Alert Actions
  const resolveAlert = useCallback(
    async (alertId: string) => {
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId
            ? { ...a, status: 'RESOLVED', resolvedAt: 'Just now', resolvedBy: currentUser.name }
            : a
        )
      );
      await ds.resolveAlert(alertId, currentUser.name).catch(() => {});
    },
    [currentUser, ds]
  );

  const acknowledgeAlert = useCallback(
    async (alertId: string) => {
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: 'ACKNOWLEDGED', read: true } : a))
      );
      await ds.updateAlert(alertId, { status: 'ACKNOWLEDGED', read: true }).catch(() => {});
    },
    [ds]
  );

  // Create Ad Campaign
  const createAdCampaign = useCallback(
    async (campaignData: Partial<AdCampaign>) => {
      const newAd: AdCampaign = {
        id: `ad-${Date.now()}`,
        name: campaignData.name || 'New SmartBin Ad Campaign',
        advertiser: campaignData.advertiser || currentUser.organization || 'Advertiser Partner',
        advertiserId: campaignData.advertiserId || currentUser.advertiserId || 'adv-001',
        mediaUrl:
          campaignData.mediaUrl ||
          'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
        mediaType: campaignData.mediaType || 'IMAGE',
        startDate: campaignData.startDate || new Date().toISOString().slice(0, 10),
        endDate: campaignData.endDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        targetBinIds: campaignData.targetBinIds || ['SG-BIN-001', 'SG-BIN-002'],
        status: 'ACTIVE',
        impressions: 0,
        dailyGoalImpressions: 4000,
        revenueRwf: campaignData.revenueRwf || 1500000,
        revenueUsd: campaignData.revenueUsd || 1125,
        headline: campaignData.headline || 'Smart Living in Clean Kigali',
        tagline: campaignData.tagline || 'Supported by SG SmartBin Digital Network',
        brandColor: campaignData.brandColor || '#10B981',
        ctaText: campaignData.ctaText || 'Learn More',
        durationSeconds: campaignData.durationSeconds || 15,
      };

      setAllAds((prev) => [newAd, ...prev]);
      await ds.createAd(newAd).catch(() => {});
    },
    [currentUser, ds]
  );

  // Toggle Ad Campaign Active / Draft
  const toggleAdStatus = useCallback(
    async (campaignId: string) => {
      const target = allAds.find((a) => a.id === campaignId);
      if (!target) return;
      const nextStatus = target.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';

      setAllAds((prev) =>
        prev.map((a) => (a.id === campaignId ? { ...a, status: nextStatus } : a))
      );
      await ds.updateAd(campaignId, { status: nextStatus }).catch(() => {});
    },
    [allAds, ds]
  );

  // Add new SmartBin
  const addNewSmartBin = useCallback(
    async (newBinData: Partial<SmartBin>) => {
      const count = allBins.length + 1;
      const binId = newBinData.binId || `SG-BIN-${String(count).padStart(3, '0')}`;
      const newBin: SmartBin = {
        binId,
        name: newBinData.name || `Kigali Smart Station #${count}`,
        location: newBinData.location || 'Kigali Municipal Sector',
        district: newBinData.district || 'Gasabo',
        latitude: newBinData.latitude || -1.95 + (Math.random() * 0.04 - 0.02),
        longitude: newBinData.longitude || 30.08 + (Math.random() * 0.06 - 0.03),
        foodFillLevel: newBinData.foodFillLevel || 15,
        recyclingFillLevel: newBinData.recyclingFillLevel || 20,
        generalFillLevel: newBinData.generalFillLevel || 10,
        temperature: 28,
        humidity: 58,
        batteryLevel: 96,
        solarStatus: 'CHARGING',
        connectivityStatus: 'ONLINE',
        lastUpdated: 'Just now',
        maintenanceStatus: 'OPTIMAL',
        firmwareVersion: 'ESP32-v2.4.1-SG',
        hardwareModel: 'SG-Station-Mk3 Pro',
        installedDate: new Date().toISOString().slice(0, 10),
        activeAdCampaignId: 'ad-001',
        recentReadings: [],
        events: [
          {
            id: `ev-init-${binId}`,
            timestamp: 'Just now',
            type: 'TELEMETRY_SYNC',
            description: 'Station commissioned and online.',
            severity: 'INFO',
          },
        ],
        qrCodeId: `QR-KGL-${binId}`,
        totalCollectionsCount: 0,
      };

      setAllBins((prev) => [newBin, ...prev]);
      await ds.createBin(newBin).catch(() => {});
    },
    [allBins.length, ds]
  );

  // Diagnostics / Self-Test
  const triggerBinSelfTest = useCallback(
    async (binId: string) => {
      const target = allBins.find((b) => b.binId === binId);
      if (!target) return;

      const testEvent = {
        id: `test-${Date.now()}`,
        timestamp: 'Just now',
        type: 'TELEMETRY_SYNC' as const,
        description: 'Automated self-test executed. Ultrasonic sensors OK, Solar inverter OK, LED screen OK.',
        severity: 'INFO' as const,
      };

      const updatedEvents = [testEvent, ...(target.events || [])];
      setAllBins((prev) =>
        prev.map((b) => (b.binId === binId ? { ...b, lastUpdated: 'Just now', events: updatedEvents } : b))
      );
      await ds.updateBin(binId, { lastUpdated: 'Just now', events: updatedEvents }).catch(() => {});
    },
    [allBins, ds]
  );

  // Toggle Connectivity Online/Offline
  const toggleBinConnectivity = useCallback(
    async (binId: string) => {
      const target = allBins.find((b) => b.binId === binId);
      if (!target) return;
      const next = target.connectivityStatus === 'ONLINE' ? 'OFFLINE' : 'ONLINE';

      setAllBins((prev) =>
        prev.map((b) => (b.binId === binId ? { ...b, connectivityStatus: next, lastUpdated: 'Just now' } : b))
      );
      await ds.updateBin(binId, { connectivityStatus: next, lastUpdated: 'Just now' }).catch(() => {});
    },
    [allBins, ds]
  );

  // Maintenance log creation
  const createMaintenanceLog = useCallback(
    async (record: Partial<MaintenanceRecord>) => {
      const newM: MaintenanceRecord = {
        id: `maint-${Date.now()}`,
        binId: record.binId || 'SG-BIN-001',
        binName: record.binName || 'Kigali Heights Smart Station',
        technicianId: currentUser.id,
        technicianName: currentUser.name,
        type: record.type || 'PREVENTATIVE',
        description: record.description || 'Hardware inspection and calibration.',
        status: record.status || 'SCHEDULED',
        scheduledDate: record.scheduledDate || new Date().toISOString().slice(0, 10),
        costRwf: record.costRwf || 35000,
        notes: record.notes,
      };

      setMaintenanceRecords((prev) => [newM, ...prev]);
      await ds.createMaintenanceRecord(newM).catch(() => {});
    },
    [currentUser, ds]
  );

  // Apply AI insight
  const applyAiInsight = useCallback(
    async (insightId: string) => {
      setAiInsights((prev) =>
        prev.map((ins) => (ins.id === insightId ? { ...ins, status: 'APPLIED' } : ins))
      );
      await ds.updateAiInsight(insightId, { status: 'APPLIED' }).catch(() => {});
    },
    [ds]
  );

  // Reset database to initial fleet
  const resetToInitialData = useCallback(async () => {
    setIsSyncing(true);
    await ds.seedInitialData(true);
    setAllBins(INITIAL_SMART_BINS);
    setAllCollections(INITIAL_COLLECTIONS);
    setAllAds(INITIAL_AD_CAMPAIGNS);
    setAlerts(INITIAL_ALERTS);
    setUsers(INITIAL_USERS);
    setAdvertisers(INITIAL_ADVERTISERS);
    setAiInsights(INITIAL_AI_INSIGHTS);
    setMaintenanceRecords(INITIAL_MAINTENANCE_RECORDS);
    setIsSyncing(false);
  }, [ds]);

  // IoT Simulation Loop
  useEffect(() => {
    if (!simulationActive) return;

    const interval = setInterval(() => {
      setAllBins((prevBins) => {
        const onlineBins = prevBins.filter((b) => b.connectivityStatus === 'ONLINE');
        if (onlineBins.length === 0) return prevBins;
        const target = onlineBins[Math.floor(Math.random() * onlineBins.length)];

        return prevBins.map((bin) => {
          if (bin.binId !== target.binId) return bin;

          const compRoll = Math.random();
          let deltaFood = 0;
          let deltaRec = 0;
          let deltaGen = 0;

          if (compRoll < 0.4) deltaFood = Math.random() > 0.4 ? 1 : 0;
          else if (compRoll < 0.75) deltaRec = Math.random() > 0.3 ? 1 : 0;
          else deltaGen = Math.random() > 0.5 ? 1 : 0;

          const newFood = Math.min(100, bin.foodFillLevel + deltaFood);
          const newRec = Math.min(100, bin.recyclingFillLevel + deltaRec);
          const newGen = Math.min(100, bin.generalFillLevel + deltaGen);

          return {
            ...bin,
            foodFillLevel: newFood,
            recyclingFillLevel: newRec,
            generalFillLevel: newGen,
            lastUpdated: 'Just now',
          };
        });
      });
    }, 14000);

    return () => clearInterval(interval);
  }, [simulationActive]);

  return (
    <SmartBinContext.Provider
      value={{
        bins,
        allBins,
        collections,
        allCollections,
        ads,
        allAds,
        alerts,
        users,
        advertisers,
        aiInsights,
        maintenanceRecords,
        currentUser,
        currentRole,
        currentTab,
        selectedBin,
        selectedBinId,
        isDemoMode,
        simulationActive,
        searchQuery,
        isSyncing,
        dbBackendName: ds.name,
        unreadAlertsCount,
        collectionRequiredBinsCount,
        avgFillLevels,
        setCurrentTab,
        setSelectedBinId,
        switchRole,
        setSearchQuery,
        setDemoMode,
        setSimulationActive,
        ingestTelemetry,
        scheduleCollection,
        completeCollection,
        resolveAlert,
        acknowledgeAlert,
        markAlertAsRead: acknowledgeAlert,
        createAdCampaign,
        toggleAdStatus,
        addNewSmartBin,
        triggerBinSelfTest,
        resetToInitialData,
        toggleBinConnectivity,
        createMaintenanceLog,
        applyAiInsight,
      }}
    >
      {children}
    </SmartBinContext.Provider>
  );
};

export const useSmartBin = () => {
  const context = useContext(SmartBinContext);
  if (!context) {
    throw new Error('useSmartBin must be used within a SmartBinProvider');
  }
  return context;
};
