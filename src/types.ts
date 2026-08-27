export type CompartmentType = 'FOOD' | 'RECYCLING' | 'GENERAL';

export type ConnectivityStatus = 'ONLINE' | 'OFFLINE' | 'DEGRADED';
export type MaintenanceStatus = 'OPTIMAL' | 'INSPECTION_DUE' | 'MAINTENANCE_REQUIRED' | 'SENSOR_CALIBRATION';
export type SolarStatus = 'CHARGING' | 'IDLE' | 'FAULT';

export type UserRole = 'ADMIN' | 'OPERATOR' | 'COLLECTOR' | 'ADVERTISER' | 'VIEWER';

export type FillStatus = 'NORMAL' | 'WARNING' | 'COLLECTION_REQUIRED';

// 1. Sensor Reading Model
export interface SensorReading {
  id?: string;
  binId?: string;
  timestamp: string;
  foodFillLevel: number;
  recyclingFillLevel: number;
  generalFillLevel: number;
  temperature: number;
  humidity: number;
  batteryLevel: number;
  solarVoltage?: number;
}

export interface SensorEvent {
  id: string;
  timestamp: string;
  type: 'LID_OPENED' | 'DISPOSAL_DETECTED' | 'COLLECTION_CLEARED' | 'BATTERY_LOW' | 'TEMP_SPIKE' | 'TELEMETRY_SYNC';
  description: string;
  compartment?: CompartmentType;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

// 2. SmartBin Model
export interface SmartBin {
  binId: string;
  name: string;
  location: string;
  district: string;
  latitude: number;
  longitude: number;
  foodFillLevel: number;
  recyclingFillLevel: number;
  generalFillLevel: number;
  temperature: number;
  humidity: number;
  batteryLevel: number;
  solarStatus: SolarStatus;
  connectivityStatus: ConnectivityStatus;
  lastUpdated: string;
  maintenanceStatus: MaintenanceStatus;
  firmwareVersion: string;
  hardwareModel: string;
  installedDate: string;
  activeAdCampaignId?: string;
  recentReadings: SensorReading[];
  events: SensorEvent[];
  qrCodeId: string;
  totalCollectionsCount: number;
}

// 3. Collection Record Model
export interface CollectionRecord {
  id: string;
  binId: string;
  binName: string;
  location: string;
  collectorName: string;
  collectorId: string;
  scheduledDate: string;
  completedDate?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  wasteCategories: CompartmentType[];
  approximateKg: number;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
  notes?: string;
}

// 4. Advertisement Campaign Model
export interface AdCampaign {
  id: string;
  name: string;
  advertiser: string;
  advertiserId?: string;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
  startDate: string;
  endDate: string;
  targetBinIds: string[];
  status: 'DRAFT' | 'ACTIVE' | 'SCHEDULED' | 'EXPIRED';
  impressions: number;
  dailyGoalImpressions: number;
  revenueRwf: number;
  revenueUsd: number;
  headline: string;
  tagline: string;
  brandColor: string;
  ctaText?: string;
  durationSeconds?: number;
}

// 5. Advertiser Entity Model
export interface Advertiser {
  id: string;
  name: string;
  contactEmail: string;
  contactPhone: string;
  companyName: string;
  industry: string;
  activeCampaignsCount: number;
  totalSpentRwf: number;
  logoUrl: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  createdAt: string;
}

export type AlertType =
  | 'HIGH_FILL_LEVEL'
  | 'LOW_BATTERY'
  | 'HIGH_TEMPERATURE'
  | 'OFFLINE_BIN'
  | 'MAINTENANCE_REQUIRED'
  | 'SENSOR_ERROR';

// 6. Alert Item Model
export interface AlertItem {
  id: string;
  binId: string;
  binName: string;
  location: string;
  type: AlertType;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  time: string;
  status: 'ACTIVE' | 'RESOLVED' | 'ACKNOWLEDGED';
  message: string;
  compartment?: CompartmentType;
  resolvedAt?: string;
  resolvedBy?: string;
  read?: boolean;
}

// 7. User Profile Model
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  assignedZone?: string;
  organization: string;
  avatarUrl: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastActive: string;
  advertiserId?: string;
  createdAt?: string;
}

// 8. AI Insights Model
export interface AiInsight {
  id: string;
  title: string;
  category: 'OPTIMIZATION' | 'ANOMALY' | 'PREDICTION' | 'MAINTENANCE' | 'SUSTAINABILITY';
  impactLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendation: string;
  kigaliDistrict?: string;
  generatedAt: string;
  metrics?: Record<string, string | number>;
  isActionable: boolean;
  status: 'NEW' | 'APPLIED' | 'DISMISSED';
}

// 9. Maintenance Record Model
export interface MaintenanceRecord {
  id: string;
  binId: string;
  binName: string;
  technicianId: string;
  technicianName: string;
  type: 'PREVENTATIVE' | 'SENSOR_REPAIR' | 'SOLAR_CHECK' | 'CLEANING' | 'BATTERY_REPLACEMENT';
  description: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledDate: string;
  completedDate?: string;
  partsReplaced?: string[];
  costRwf?: number;
  notes?: string;
}

export interface WasteClassificationResult {
  category: 'FOOD' | 'RECYCLING' | 'GENERAL';
  compartment: 'FOOD WASTE' | 'RECYCLING WASTE' | 'GENERAL WASTE';
  confidence: number;
  itemIdentified: string;
  reasoning: string;
  environmentalTip: string;
  biodegradable: boolean;
  recyclable: boolean;
}

export interface ESP32TelemetryPayload {
  binId: string;
  timestamp: string;
  foodFillLevel: number;
  recyclingFillLevel: number;
  generalFillLevel: number;
  temperature: number;
  humidity: number;
  batteryLevel: number;
  connectivity: string;
}

export interface RolePermissions {
  canViewDashboard: boolean;
  canViewAllBins: boolean;
  canEditBins: boolean;
  canPerformSelfTest: boolean;
  canViewAllCollections: boolean;
  canScheduleCollections: boolean;
  canCompleteCollections: boolean;
  canViewAllAds: boolean;
  canManageAds: boolean;
  canViewAnalytics: boolean;
  canAccessAI: boolean;
  canResolveAlerts: boolean;
  canManageUsers: boolean;
  canAccessSystemSettings: boolean;
}
