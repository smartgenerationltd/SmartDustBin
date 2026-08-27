import { IDataService } from './dataService';
import {
  UserProfile,
  SmartBin,
  SensorReading,
  CollectionRecord,
  AlertItem,
  AdCampaign,
  Advertiser,
  AiInsight,
  MaintenanceRecord,
} from '../types';
import { INITIAL_SMART_BINS } from '../data/mockBins';
import { INITIAL_AD_CAMPAIGNS } from '../data/mockAds';
import { INITIAL_COLLECTIONS } from '../data/mockCollections';
import { INITIAL_ALERTS } from '../data/mockAlerts';
import { INITIAL_USERS } from '../data/mockUsers';
import { INITIAL_ADVERTISERS, INITIAL_AI_INSIGHTS, INITIAL_MAINTENANCE_RECORDS } from '../data/mockMoreData';

const STORAGE_KEYS = {
  USERS: 'sg_ds_users_v2',
  BINS: 'sg_ds_bins_v2',
  READINGS: 'sg_ds_readings_v2',
  COLLECTIONS: 'sg_ds_collections_v2',
  ALERTS: 'sg_ds_alerts_v2',
  ADS: 'sg_ds_ads_v2',
  ADVERTISERS: 'sg_ds_advertisers_v2',
  INSIGHTS: 'sg_ds_insights_v2',
  MAINTENANCE: 'sg_ds_maintenance_v2',
};

export class MockDataService implements IDataService {
  readonly name = 'Local Storage Provider';
  readonly isConnected = true;

  private binsListeners: Array<(bins: SmartBin[]) => void> = [];
  private collectionsListeners: Array<(cols: CollectionRecord[]) => void> = [];
  private alertsListeners: Array<(alerts: AlertItem[]) => void> = [];
  private adsListeners: Array<(ads: AdCampaign[]) => void> = [];

  private load<T>(key: string, defaultData: T): T {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultData;
    } catch {
      return defaultData;
    }
  }

  private save<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {}
  }

  // 1. USERS
  async getUsers(): Promise<UserProfile[]> {
    return this.load(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  async getUser(id: string): Promise<UserProfile | null> {
    const list = await this.getUsers();
    return list.find((u) => u.id === id) || null;
  }

  async createUser(user: UserProfile): Promise<UserProfile> {
    const list = await this.getUsers();
    const updated = [user, ...list.filter((u) => u.id !== user.id)];
    this.save(STORAGE_KEYS.USERS, updated);
    return user;
  }

  async updateUser(id: string, data: Partial<UserProfile>): Promise<void> {
    const list = await this.getUsers();
    const updated = list.map((u) => (u.id === id ? { ...u, ...data } : u));
    this.save(STORAGE_KEYS.USERS, updated);
  }

  async deleteUser(id: string): Promise<void> {
    const list = await this.getUsers();
    const updated = list.filter((u) => u.id !== id);
    this.save(STORAGE_KEYS.USERS, updated);
  }

  // 2. SMARTBINS
  async getBins(): Promise<SmartBin[]> {
    return this.load(STORAGE_KEYS.BINS, INITIAL_SMART_BINS);
  }

  async getBin(binId: string): Promise<SmartBin | null> {
    const list = await this.getBins();
    return list.find((b) => b.binId === binId) || null;
  }

  async createBin(bin: SmartBin): Promise<SmartBin> {
    const list = await this.getBins();
    const updated = [bin, ...list.filter((b) => b.binId !== bin.binId)];
    this.save(STORAGE_KEYS.BINS, updated);
    this.notifyBins(updated);
    return bin;
  }

  async updateBin(binId: string, data: Partial<SmartBin>): Promise<void> {
    const list = await this.getBins();
    const updated = list.map((b) => (b.binId === binId ? { ...b, ...data } : b));
    this.save(STORAGE_KEYS.BINS, updated);
    this.notifyBins(updated);
  }

  async deleteBin(binId: string): Promise<void> {
    const list = await this.getBins();
    const updated = list.filter((b) => b.binId !== binId);
    this.save(STORAGE_KEYS.BINS, updated);
    this.notifyBins(updated);
  }

  subscribeBins(onUpdate: (bins: SmartBin[]) => void): () => void {
    this.binsListeners.push(onUpdate);
    this.getBins().then(onUpdate);
    return () => {
      this.binsListeners = this.binsListeners.filter((l) => l !== onUpdate);
    };
  }

  private notifyBins(bins: SmartBin[]) {
    this.binsListeners.forEach((l) => l(bins));
  }

  // 3. SENSOR READINGS
  async getSensorReadings(binId?: string, limitCount = 50): Promise<SensorReading[]> {
    const all = this.load<SensorReading[]>(STORAGE_KEYS.READINGS, []);
    if (binId) return all.filter((r) => r.binId === binId).slice(0, limitCount);
    return all.slice(0, limitCount);
  }

  async addSensorReading(reading: SensorReading): Promise<SensorReading> {
    const all = await this.getSensorReadings(undefined, 500);
    const item = { ...reading, id: reading.id || `sr-${Date.now()}` };
    const updated = [item, ...all.slice(0, 499)];
    this.save(STORAGE_KEYS.READINGS, updated);
    return item;
  }

  // 4. COLLECTIONS
  async getCollections(collectorId?: string): Promise<CollectionRecord[]> {
    const list = this.load(STORAGE_KEYS.COLLECTIONS, INITIAL_COLLECTIONS);
    if (collectorId) return list.filter((c) => c.collectorId === collectorId);
    return list;
  }

  async getCollection(id: string): Promise<CollectionRecord | null> {
    const list = await this.getCollections();
    return list.find((c) => c.id === id) || null;
  }

  async createCollection(collection: CollectionRecord): Promise<CollectionRecord> {
    const list = await this.getCollections();
    const updated = [collection, ...list.filter((c) => c.id !== collection.id)];
    this.save(STORAGE_KEYS.COLLECTIONS, updated);
    this.notifyCollections(updated);
    return collection;
  }

  async updateCollection(id: string, data: Partial<CollectionRecord>): Promise<void> {
    const list = await this.getCollections();
    const updated = list.map((c) => (c.id === id ? { ...c, ...data } : c));
    this.save(STORAGE_KEYS.COLLECTIONS, updated);
    this.notifyCollections(updated);
  }

  async deleteCollection(id: string): Promise<void> {
    const list = await this.getCollections();
    const updated = list.filter((c) => c.id !== id);
    this.save(STORAGE_KEYS.COLLECTIONS, updated);
    this.notifyCollections(updated);
  }

  subscribeCollections(onUpdate: (records: CollectionRecord[]) => void): () => void {
    this.collectionsListeners.push(onUpdate);
    this.getCollections().then(onUpdate);
    return () => {
      this.collectionsListeners = this.collectionsListeners.filter((l) => l !== onUpdate);
    };
  }

  private notifyCollections(cols: CollectionRecord[]) {
    this.collectionsListeners.forEach((l) => l(cols));
  }

  // 5. ALERTS
  async getAlerts(): Promise<AlertItem[]> {
    return this.load(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
  }

  async getAlert(id: string): Promise<AlertItem | null> {
    const list = await this.getAlerts();
    return list.find((a) => a.id === id) || null;
  }

  async createAlert(alert: AlertItem): Promise<AlertItem> {
    const list = await this.getAlerts();
    const updated = [alert, ...list.filter((a) => a.id !== alert.id)];
    this.save(STORAGE_KEYS.ALERTS, updated);
    this.notifyAlerts(updated);
    return alert;
  }

  async updateAlert(id: string, data: Partial<AlertItem>): Promise<void> {
    const list = await this.getAlerts();
    const updated = list.map((a) => (a.id === id ? { ...a, ...data } : a));
    this.save(STORAGE_KEYS.ALERTS, updated);
    this.notifyAlerts(updated);
  }

  async resolveAlert(id: string, resolvedBy = 'Manual Operator Clearance'): Promise<void> {
    await this.updateAlert(id, {
      status: 'RESOLVED',
      resolvedAt: new Date().toISOString(),
      resolvedBy,
    });
  }

  async deleteAlert(id: string): Promise<void> {
    const list = await this.getAlerts();
    const updated = list.filter((a) => a.id !== id);
    this.save(STORAGE_KEYS.ALERTS, updated);
    this.notifyAlerts(updated);
  }

  subscribeAlerts(onUpdate: (alerts: AlertItem[]) => void): () => void {
    this.alertsListeners.push(onUpdate);
    this.getAlerts().then(onUpdate);
    return () => {
      this.alertsListeners = this.alertsListeners.filter((l) => l !== onUpdate);
    };
  }

  private notifyAlerts(alerts: AlertItem[]) {
    this.alertsListeners.forEach((l) => l(alerts));
  }

  // 6. ADVERTISEMENTS
  async getAds(advertiserId?: string): Promise<AdCampaign[]> {
    const list = this.load(STORAGE_KEYS.ADS, INITIAL_AD_CAMPAIGNS);
    if (advertiserId) return list.filter((a) => a.advertiserId === advertiserId);
    return list;
  }

  async getAd(id: string): Promise<AdCampaign | null> {
    const list = await this.getAds();
    return list.find((a) => a.id === id) || null;
  }

  async createAd(ad: AdCampaign): Promise<AdCampaign> {
    const list = await this.getAds();
    const updated = [ad, ...list.filter((a) => a.id !== ad.id)];
    this.save(STORAGE_KEYS.ADS, updated);
    this.notifyAds(updated);
    return ad;
  }

  async updateAd(id: string, data: Partial<AdCampaign>): Promise<void> {
    const list = await this.getAds();
    const updated = list.map((a) => (a.id === id ? { ...a, ...data } : a));
    this.save(STORAGE_KEYS.ADS, updated);
    this.notifyAds(updated);
  }

  async deleteAd(id: string): Promise<void> {
    const list = await this.getAds();
    const updated = list.filter((a) => a.id !== id);
    this.save(STORAGE_KEYS.ADS, updated);
    this.notifyAds(updated);
  }

  subscribeAds(onUpdate: (ads: AdCampaign[]) => void): () => void {
    this.adsListeners.push(onUpdate);
    this.getAds().then(onUpdate);
    return () => {
      this.adsListeners = this.adsListeners.filter((l) => l !== onUpdate);
    };
  }

  private notifyAds(ads: AdCampaign[]) {
    this.adsListeners.forEach((l) => l(ads));
  }

  // 7. ADVERTISERS
  async getAdvertisers(): Promise<Advertiser[]> {
    return this.load(STORAGE_KEYS.ADVERTISERS, INITIAL_ADVERTISERS);
  }

  async getAdvertiser(id: string): Promise<Advertiser | null> {
    const list = await this.getAdvertisers();
    return list.find((a) => a.id === id) || null;
  }

  async createAdvertiser(advertiser: Advertiser): Promise<Advertiser> {
    const list = await this.getAdvertisers();
    const updated = [advertiser, ...list.filter((a) => a.id !== advertiser.id)];
    this.save(STORAGE_KEYS.ADVERTISERS, updated);
    return advertiser;
  }

  async updateAdvertiser(id: string, data: Partial<Advertiser>): Promise<void> {
    const list = await this.getAdvertisers();
    const updated = list.map((a) => (a.id === id ? { ...a, ...data } : a));
    this.save(STORAGE_KEYS.ADVERTISERS, updated);
  }

  async deleteAdvertiser(id: string): Promise<void> {
    const list = await this.getAdvertisers();
    const updated = list.filter((a) => a.id !== id);
    this.save(STORAGE_KEYS.ADVERTISERS, updated);
  }

  // 8. AI INSIGHTS
  async getAiInsights(): Promise<AiInsight[]> {
    return this.load(STORAGE_KEYS.INSIGHTS, INITIAL_AI_INSIGHTS);
  }

  async getAiInsight(id: string): Promise<AiInsight | null> {
    const list = await this.getAiInsights();
    return list.find((i) => i.id === id) || null;
  }

  async createAiInsight(insight: AiInsight): Promise<AiInsight> {
    const list = await this.getAiInsights();
    const updated = [insight, ...list.filter((i) => i.id !== insight.id)];
    this.save(STORAGE_KEYS.INSIGHTS, updated);
    return insight;
  }

  async updateAiInsight(id: string, data: Partial<AiInsight>): Promise<void> {
    const list = await this.getAiInsights();
    const updated = list.map((i) => (i.id === id ? { ...i, ...data } : i));
    this.save(STORAGE_KEYS.INSIGHTS, updated);
  }

  async deleteAiInsight(id: string): Promise<void> {
    const list = await this.getAiInsights();
    const updated = list.filter((i) => i.id !== id);
    this.save(STORAGE_KEYS.INSIGHTS, updated);
  }

  // 9. MAINTENANCE RECORDS
  async getMaintenanceRecords(binId?: string): Promise<MaintenanceRecord[]> {
    const list = this.load(STORAGE_KEYS.MAINTENANCE, INITIAL_MAINTENANCE_RECORDS);
    if (binId) return list.filter((m) => m.binId === binId);
    return list;
  }

  async getMaintenanceRecord(id: string): Promise<MaintenanceRecord | null> {
    const list = await this.getMaintenanceRecords();
    return list.find((m) => m.id === id) || null;
  }

  async createMaintenanceRecord(record: MaintenanceRecord): Promise<MaintenanceRecord> {
    const list = await this.getMaintenanceRecords();
    const updated = [record, ...list.filter((m) => m.id !== record.id)];
    this.save(STORAGE_KEYS.MAINTENANCE, updated);
    return record;
  }

  async updateMaintenanceRecord(id: string, data: Partial<MaintenanceRecord>): Promise<void> {
    const list = await this.getMaintenanceRecords();
    const updated = list.map((m) => (m.id === id ? { ...m, ...data } : m));
    this.save(STORAGE_KEYS.MAINTENANCE, updated);
  }

  async deleteMaintenanceRecord(id: string): Promise<void> {
    const list = await this.getMaintenanceRecords();
    const updated = list.filter((m) => m.id !== id);
    this.save(STORAGE_KEYS.MAINTENANCE, updated);
  }

  async seedInitialData(): Promise<{ success: boolean; message: string }> {
    this.save(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.save(STORAGE_KEYS.BINS, INITIAL_SMART_BINS);
    this.save(STORAGE_KEYS.COLLECTIONS, INITIAL_COLLECTIONS);
    this.save(STORAGE_KEYS.ADS, INITIAL_AD_CAMPAIGNS);
    this.save(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
    this.save(STORAGE_KEYS.ADVERTISERS, INITIAL_ADVERTISERS);
    this.save(STORAGE_KEYS.INSIGHTS, INITIAL_AI_INSIGHTS);
    this.save(STORAGE_KEYS.MAINTENANCE, INITIAL_MAINTENANCE_RECORDS);
    return { success: true, message: 'Local storage reset to default mock fleet.' };
  }
}
