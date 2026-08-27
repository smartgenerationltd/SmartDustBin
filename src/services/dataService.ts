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

export interface IDataService {
  // Service info
  readonly name: string;
  readonly isConnected: boolean;

  // 1. Users Model CRUD
  getUsers(): Promise<UserProfile[]>;
  getUser(id: string): Promise<UserProfile | null>;
  createUser(user: UserProfile): Promise<UserProfile>;
  updateUser(id: string, data: Partial<UserProfile>): Promise<void>;
  deleteUser(id: string): Promise<void>;

  // 2. SmartBins Model CRUD & Real-Time Sync
  getBins(): Promise<SmartBin[]>;
  getBin(binId: string): Promise<SmartBin | null>;
  createBin(bin: SmartBin): Promise<SmartBin>;
  updateBin(binId: string, data: Partial<SmartBin>): Promise<void>;
  deleteBin(binId: string): Promise<void>;
  subscribeBins(onUpdate: (bins: SmartBin[]) => void): () => void;

  // 3. Sensor Readings Model CRUD
  getSensorReadings(binId?: string, limitCount?: number): Promise<SensorReading[]>;
  addSensorReading(reading: SensorReading): Promise<SensorReading>;

  // 4. Collections Model CRUD & Real-Time Sync
  getCollections(collectorId?: string): Promise<CollectionRecord[]>;
  getCollection(id: string): Promise<CollectionRecord | null>;
  createCollection(collection: CollectionRecord): Promise<CollectionRecord>;
  updateCollection(id: string, data: Partial<CollectionRecord>): Promise<void>;
  deleteCollection(id: string): Promise<void>;
  subscribeCollections(onUpdate: (collections: CollectionRecord[]) => void): () => void;

  // 5. Alerts Model CRUD & Real-Time Sync
  getAlerts(): Promise<AlertItem[]>;
  getAlert(id: string): Promise<AlertItem | null>;
  createAlert(alert: AlertItem): Promise<AlertItem>;
  updateAlert(id: string, data: Partial<AlertItem>): Promise<void>;
  resolveAlert(id: string, resolvedBy?: string): Promise<void>;
  deleteAlert(id: string): Promise<void>;
  subscribeAlerts(onUpdate: (alerts: AlertItem[]) => void): () => void;

  // 6. Advertisements Model CRUD & Real-Time Sync
  getAds(advertiserId?: string): Promise<AdCampaign[]>;
  getAd(id: string): Promise<AdCampaign | null>;
  createAd(ad: AdCampaign): Promise<AdCampaign>;
  updateAd(id: string, data: Partial<AdCampaign>): Promise<void>;
  deleteAd(id: string): Promise<void>;
  subscribeAds(onUpdate: (ads: AdCampaign[]) => void): () => void;

  // 7. Advertisers Entity Model CRUD
  getAdvertisers(): Promise<Advertiser[]>;
  getAdvertiser(id: string): Promise<Advertiser | null>;
  createAdvertiser(advertiser: Advertiser): Promise<Advertiser>;
  updateAdvertiser(id: string, data: Partial<Advertiser>): Promise<void>;
  deleteAdvertiser(id: string): Promise<void>;

  // 8. AI Insights Model CRUD
  getAiInsights(): Promise<AiInsight[]>;
  getAiInsight(id: string): Promise<AiInsight | null>;
  createAiInsight(insight: AiInsight): Promise<AiInsight>;
  updateAiInsight(id: string, data: Partial<AiInsight>): Promise<void>;
  deleteAiInsight(id: string): Promise<void>;

  // 9. Maintenance Records Model CRUD
  getMaintenanceRecords(binId?: string): Promise<MaintenanceRecord[]>;
  getMaintenanceRecord(id: string): Promise<MaintenanceRecord | null>;
  createMaintenanceRecord(record: MaintenanceRecord): Promise<MaintenanceRecord>;
  updateMaintenanceRecord(id: string, data: Partial<MaintenanceRecord>): Promise<void>;
  deleteMaintenanceRecord(id: string): Promise<void>;

  // Initial Seeding
  seedInitialData(force?: boolean): Promise<{ success: boolean; message: string }>;
}
