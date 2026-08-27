import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './firebaseError';
import type { IDataService } from './dataService';
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

// Firestore Collection Names
const COLLECTIONS = {
  USERS: 'users',
  BINS: 'bins',
  READINGS: 'sensorReadings',
  COLLECTIONS: 'collections',
  ALERTS: 'alerts',
  ADS: 'advertisements',
  ADVERTISERS: 'advertisers',
  INSIGHTS: 'aiInsights',
  MAINTENANCE: 'maintenanceRecords',
} as const;

export class FirestoreDataService implements IDataService {
  readonly name = 'Firebase Firestore';
  readonly isConnected = true;

  // -------------------------------------------------------------
  // 1. USERS MODEL
  // -------------------------------------------------------------
  async getUsers(): Promise<UserProfile[]> {
    try {
      const snap = await getDocs(collection(db, COLLECTIONS.USERS));
      if (snap.empty) return [];
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as UserProfile));
    } catch (err) {
      console.warn('[Firestore] Error getting users:', err);
      return [];
    }
  }

  async getUser(id: string): Promise<UserProfile | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTIONS.USERS, id));
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() } as UserProfile;
    } catch (err) {
      console.warn(`[Firestore] Error getting user ${id}:`, err);
      return null;
    }
  }

  async createUser(user: UserProfile): Promise<UserProfile> {
    try {
      const docRef = doc(db, COLLECTIONS.USERS, user.id);
      await setDoc(docRef, {
        ...user,
        createdAt: user.createdAt || new Date().toISOString(),
        lastActive: new Date().toISOString(),
      });
      return user;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `${COLLECTIONS.USERS}/${user.id}`);
    }
  }

  async updateUser(id: string, data: Partial<UserProfile>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.USERS, id);
      await updateDoc(docRef, { ...data, lastActive: new Date().toISOString() });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${COLLECTIONS.USERS}/${id}`);
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.USERS, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${COLLECTIONS.USERS}/${id}`);
    }
  }

  // -------------------------------------------------------------
  // 2. SMARTBINS MODEL
  // -------------------------------------------------------------
  async getBins(): Promise<SmartBin[]> {
    try {
      const snap = await getDocs(collection(db, COLLECTIONS.BINS));
      if (snap.empty) return [];
      return snap.docs.map((d) => ({ binId: d.id, ...d.data() } as SmartBin));
    } catch (err) {
      console.warn('[Firestore] Error getting bins:', err);
      return [];
    }
  }

  async getBin(binId: string): Promise<SmartBin | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTIONS.BINS, binId));
      if (!snap.exists()) return null;
      return { binId: snap.id, ...snap.data() } as SmartBin;
    } catch (err) {
      console.warn(`[Firestore] Error getting bin ${binId}:`, err);
      return null;
    }
  }

  async createBin(bin: SmartBin): Promise<SmartBin> {
    try {
      const docRef = doc(db, COLLECTIONS.BINS, bin.binId);
      await setDoc(docRef, bin);
      return bin;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `${COLLECTIONS.BINS}/${bin.binId}`);
    }
  }

  async updateBin(binId: string, data: Partial<SmartBin>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.BINS, binId);
      await updateDoc(docRef, data);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${COLLECTIONS.BINS}/${binId}`);
    }
  }

  async deleteBin(binId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.BINS, binId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${COLLECTIONS.BINS}/${binId}`);
    }
  }

  subscribeBins(onUpdate: (bins: SmartBin[]) => void): () => void {
    const q = query(collection(db, COLLECTIONS.BINS));
    return onSnapshot(
      q,
      (snap) => {
        if (!snap.empty) {
          const bins = snap.docs.map((d) => ({ binId: d.id, ...d.data() } as SmartBin));
          onUpdate(bins);
        }
      },
      (err) => {
        console.warn('[Firestore] subscribeBins error:', err);
      }
    );
  }

  // -------------------------------------------------------------
  // 3. SENSOR READINGS MODEL
  // -------------------------------------------------------------
  async getSensorReadings(binId?: string, limitCount = 50): Promise<SensorReading[]> {
    try {
      let q = query(
        collection(db, COLLECTIONS.READINGS),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      if (binId) {
        q = query(
          collection(db, COLLECTIONS.READINGS),
          where('binId', '==', binId),
          orderBy('timestamp', 'desc'),
          limit(limitCount)
        );
      }
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SensorReading));
    } catch (err) {
      console.warn('[Firestore] Error getting sensor readings:', err);
      return [];
    }
  }

  async addSensorReading(reading: SensorReading): Promise<SensorReading> {
    try {
      const id = reading.id || `sr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const docRef = doc(db, COLLECTIONS.READINGS, id);
      const payload = { ...reading, id, timestamp: reading.timestamp || new Date().toISOString() };
      await setDoc(docRef, payload);
      return payload;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, COLLECTIONS.READINGS);
    }
  }

  // -------------------------------------------------------------
  // 4. COLLECTIONS MODEL
  // -------------------------------------------------------------
  async getCollections(collectorId?: string): Promise<CollectionRecord[]> {
    try {
      let q = query(collection(db, COLLECTIONS.COLLECTIONS), orderBy('scheduledDate', 'desc'));
      if (collectorId) {
        q = query(
          collection(db, COLLECTIONS.COLLECTIONS),
          where('collectorId', '==', collectorId)
        );
      }
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CollectionRecord));
    } catch (err) {
      console.warn('[Firestore] Error getting collections:', err);
      return [];
    }
  }

  async getCollection(id: string): Promise<CollectionRecord | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTIONS.COLLECTIONS, id));
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() } as CollectionRecord;
    } catch (err) {
      console.warn(`[Firestore] Error getting collection ${id}:`, err);
      return null;
    }
  }

  async createCollection(record: CollectionRecord): Promise<CollectionRecord> {
    try {
      const docRef = doc(db, COLLECTIONS.COLLECTIONS, record.id);
      await setDoc(docRef, record);
      return record;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `${COLLECTIONS.COLLECTIONS}/${record.id}`);
    }
  }

  async updateCollection(id: string, data: Partial<CollectionRecord>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.COLLECTIONS, id);
      await updateDoc(docRef, data);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${COLLECTIONS.COLLECTIONS}/${id}`);
    }
  }

  async deleteCollection(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.COLLECTIONS, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${COLLECTIONS.COLLECTIONS}/${id}`);
    }
  }

  subscribeCollections(onUpdate: (records: CollectionRecord[]) => void): () => void {
    const q = query(collection(db, COLLECTIONS.COLLECTIONS));
    return onSnapshot(
      q,
      (snap) => {
        if (!snap.empty) {
          const records = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CollectionRecord));
          onUpdate(records);
        }
      },
      (err) => {
        console.warn('[Firestore] subscribeCollections error:', err);
      }
    );
  }

  // -------------------------------------------------------------
  // 5. ALERTS MODEL
  // -------------------------------------------------------------
  async getAlerts(): Promise<AlertItem[]> {
    try {
      const snap = await getDocs(collection(db, COLLECTIONS.ALERTS));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AlertItem));
    } catch (err) {
      console.warn('[Firestore] Error getting alerts:', err);
      return [];
    }
  }

  async getAlert(id: string): Promise<AlertItem | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTIONS.ALERTS, id));
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() } as AlertItem;
    } catch (err) {
      console.warn(`[Firestore] Error getting alert ${id}:`, err);
      return null;
    }
  }

  async createAlert(alert: AlertItem): Promise<AlertItem> {
    try {
      const docRef = doc(db, COLLECTIONS.ALERTS, alert.id);
      await setDoc(docRef, alert);
      return alert;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `${COLLECTIONS.ALERTS}/${alert.id}`);
    }
  }

  async updateAlert(id: string, data: Partial<AlertItem>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.ALERTS, id);
      await updateDoc(docRef, data);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${COLLECTIONS.ALERTS}/${id}`);
    }
  }

  async resolveAlert(id: string, resolvedBy = 'Operator Manual Clearance'): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.ALERTS, id);
      await updateDoc(docRef, {
        status: 'RESOLVED',
        resolvedAt: new Date().toISOString(),
        resolvedBy,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${COLLECTIONS.ALERTS}/${id}`);
    }
  }

  async deleteAlert(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.ALERTS, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${COLLECTIONS.ALERTS}/${id}`);
    }
  }

  subscribeAlerts(onUpdate: (alerts: AlertItem[]) => void): () => void {
    const q = query(collection(db, COLLECTIONS.ALERTS));
    return onSnapshot(
      q,
      (snap) => {
        if (!snap.empty) {
          const alerts = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AlertItem));
          onUpdate(alerts);
        }
      },
      (err) => {
        console.warn('[Firestore] subscribeAlerts error:', err);
      }
    );
  }

  // -------------------------------------------------------------
  // 6. ADVERTISEMENTS MODEL
  // -------------------------------------------------------------
  async getAds(advertiserId?: string): Promise<AdCampaign[]> {
    try {
      let q = query(collection(db, COLLECTIONS.ADS));
      if (advertiserId) {
        q = query(collection(db, COLLECTIONS.ADS), where('advertiserId', '==', advertiserId));
      }
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdCampaign));
    } catch (err) {
      console.warn('[Firestore] Error getting ads:', err);
      return [];
    }
  }

  async getAd(id: string): Promise<AdCampaign | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTIONS.ADS, id));
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() } as AdCampaign;
    } catch (err) {
      console.warn(`[Firestore] Error getting ad ${id}:`, err);
      return null;
    }
  }

  async createAd(ad: AdCampaign): Promise<AdCampaign> {
    try {
      const docRef = doc(db, COLLECTIONS.ADS, ad.id);
      await setDoc(docRef, ad);
      return ad;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `${COLLECTIONS.ADS}/${ad.id}`);
    }
  }

  async updateAd(id: string, data: Partial<AdCampaign>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.ADS, id);
      await updateDoc(docRef, data);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${COLLECTIONS.ADS}/${id}`);
    }
  }

  async deleteAd(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.ADS, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${COLLECTIONS.ADS}/${id}`);
    }
  }

  subscribeAds(onUpdate: (ads: AdCampaign[]) => void): () => void {
    const q = query(collection(db, COLLECTIONS.ADS));
    return onSnapshot(
      q,
      (snap) => {
        if (!snap.empty) {
          const ads = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdCampaign));
          onUpdate(ads);
        }
      },
      (err) => {
        console.warn('[Firestore] subscribeAds error:', err);
      }
    );
  }

  // -------------------------------------------------------------
  // 7. ADVERTISERS ENTITY MODEL
  // -------------------------------------------------------------
  async getAdvertisers(): Promise<Advertiser[]> {
    try {
      const snap = await getDocs(collection(db, COLLECTIONS.ADVERTISERS));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Advertiser));
    } catch (err) {
      console.warn('[Firestore] Error getting advertisers:', err);
      return [];
    }
  }

  async getAdvertiser(id: string): Promise<Advertiser | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTIONS.ADVERTISERS, id));
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() } as Advertiser;
    } catch (err) {
      console.warn(`[Firestore] Error getting advertiser ${id}:`, err);
      return null;
    }
  }

  async createAdvertiser(advertiser: Advertiser): Promise<Advertiser> {
    try {
      const docRef = doc(db, COLLECTIONS.ADVERTISERS, advertiser.id);
      await setDoc(docRef, advertiser);
      return advertiser;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `${COLLECTIONS.ADVERTISERS}/${advertiser.id}`);
    }
  }

  async updateAdvertiser(id: string, data: Partial<Advertiser>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.ADVERTISERS, id);
      await updateDoc(docRef, data);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${COLLECTIONS.ADVERTISERS}/${id}`);
    }
  }

  async deleteAdvertiser(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.ADVERTISERS, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${COLLECTIONS.ADVERTISERS}/${id}`);
    }
  }

  // -------------------------------------------------------------
  // 8. AI INSIGHTS MODEL
  // -------------------------------------------------------------
  async getAiInsights(): Promise<AiInsight[]> {
    try {
      const snap = await getDocs(collection(db, COLLECTIONS.INSIGHTS));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AiInsight));
    } catch (err) {
      console.warn('[Firestore] Error getting AI insights:', err);
      return [];
    }
  }

  async getAiInsight(id: string): Promise<AiInsight | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTIONS.INSIGHTS, id));
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() } as AiInsight;
    } catch (err) {
      console.warn(`[Firestore] Error getting insight ${id}:`, err);
      return null;
    }
  }

  async createAiInsight(insight: AiInsight): Promise<AiInsight> {
    try {
      const docRef = doc(db, COLLECTIONS.INSIGHTS, insight.id);
      await setDoc(docRef, insight);
      return insight;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `${COLLECTIONS.INSIGHTS}/${insight.id}`);
    }
  }

  async updateAiInsight(id: string, data: Partial<AiInsight>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.INSIGHTS, id);
      await updateDoc(docRef, data);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${COLLECTIONS.INSIGHTS}/${id}`);
    }
  }

  async deleteAiInsight(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.INSIGHTS, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${COLLECTIONS.INSIGHTS}/${id}`);
    }
  }

  // -------------------------------------------------------------
  // 9. MAINTENANCE RECORDS MODEL
  // -------------------------------------------------------------
  async getMaintenanceRecords(binId?: string): Promise<MaintenanceRecord[]> {
    try {
      let q = query(collection(db, COLLECTIONS.MAINTENANCE));
      if (binId) {
        q = query(collection(db, COLLECTIONS.MAINTENANCE), where('binId', '==', binId));
      }
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MaintenanceRecord));
    } catch (err) {
      console.warn('[Firestore] Error getting maintenance records:', err);
      return [];
    }
  }

  async getMaintenanceRecord(id: string): Promise<MaintenanceRecord | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTIONS.MAINTENANCE, id));
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() } as MaintenanceRecord;
    } catch (err) {
      console.warn(`[Firestore] Error getting maintenance record ${id}:`, err);
      return null;
    }
  }

  async createMaintenanceRecord(record: MaintenanceRecord): Promise<MaintenanceRecord> {
    try {
      const docRef = doc(db, COLLECTIONS.MAINTENANCE, record.id);
      await setDoc(docRef, record);
      return record;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `${COLLECTIONS.MAINTENANCE}/${record.id}`);
    }
  }

  async updateMaintenanceRecord(id: string, data: Partial<MaintenanceRecord>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.MAINTENANCE, id);
      await updateDoc(docRef, data);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${COLLECTIONS.MAINTENANCE}/${id}`);
    }
  }

  async deleteMaintenanceRecord(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.MAINTENANCE, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${COLLECTIONS.MAINTENANCE}/${id}`);
    }
  }

  // -------------------------------------------------------------
  // SEED INITIAL DATA TO FIRESTORE
  // -------------------------------------------------------------
  async seedInitialData(force = false): Promise<{ success: boolean; message: string }> {
    try {
      // Check if data already exists
      const existingBins = await getDocs(query(collection(db, COLLECTIONS.BINS), limit(1)));
      if (!existingBins.empty && !force) {
        return { success: true, message: 'Firestore already populated with smart city fleet data.' };
      }

      const batch = writeBatch(db);

      // Seed Users
      INITIAL_USERS.forEach((u) => {
        batch.set(doc(db, COLLECTIONS.USERS, u.id), u);
      });

      // Seed SmartBins
      INITIAL_SMART_BINS.forEach((b) => {
        batch.set(doc(db, COLLECTIONS.BINS, b.binId), b);
      });

      // Seed Collections
      INITIAL_COLLECTIONS.forEach((c) => {
        batch.set(doc(db, COLLECTIONS.COLLECTIONS, c.id), c);
      });

      // Seed Ads
      INITIAL_AD_CAMPAIGNS.forEach((a) => {
        batch.set(doc(db, COLLECTIONS.ADS, a.id), a);
      });

      // Seed Alerts
      INITIAL_ALERTS.forEach((alt) => {
        batch.set(doc(db, COLLECTIONS.ALERTS, alt.id), alt);
      });

      // Seed Advertisers
      INITIAL_ADVERTISERS.forEach((adv) => {
        batch.set(doc(db, COLLECTIONS.ADVERTISERS, adv.id), adv);
      });

      // Seed AI Insights
      INITIAL_AI_INSIGHTS.forEach((ins) => {
        batch.set(doc(db, COLLECTIONS.INSIGHTS, ins.id), ins);
      });

      // Seed Maintenance Records
      INITIAL_MAINTENANCE_RECORDS.forEach((m) => {
        batch.set(doc(db, COLLECTIONS.MAINTENANCE, m.id), m);
      });

      await batch.commit();
      return { success: true, message: 'Successfully seeded 9 Firestore collections with SG SmartBin models!' };
    } catch (err: any) {
      console.warn('[Firestore] Notice during initial data seeding:', err?.message || err);
      return { success: false, message: err?.message || 'Failed to seed Firestore data.' };
    }
  }
}
