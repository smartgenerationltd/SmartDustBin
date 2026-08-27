import type { IDataService } from './dataService';
import { FirestoreDataService } from './firestoreDataService';
import { MockDataService } from './mockDataService';

// Create singleton service instances
export const firestoreDataService = new FirestoreDataService();
export const mockDataService = new MockDataService();

// Default data service is FirestoreDataService
let activeDataService: IDataService = firestoreDataService;

export function getDataService(): IDataService {
  return activeDataService;
}

export function setDataServiceBackend(type: 'firestore' | 'mock'): IDataService {
  activeDataService = type === 'firestore' ? firestoreDataService : mockDataService;
  return activeDataService;
}

export type { IDataService };
export * from './firebase';
