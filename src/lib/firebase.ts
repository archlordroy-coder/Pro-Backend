import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import logger from './logger';

let db: Firestore | null = null;

export async function initializeFirebase(): Promise<Firestore | null> {
  try {
    if (getApps().length > 0) {
      const adminApp = getApp();
      db = getFirestore(adminApp);
      logger.info('Firebase already initialized');
      return db;
    }

    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    
    if (serviceAccountJson) {
      try {
        const serviceAccount = JSON.parse(serviceAccountJson);
        const adminApp = initializeApp({
          credential: cert(serviceAccount),
        });
        db = getFirestore(adminApp);
        logger.info('Firebase initialized with service account JSON');
      } catch (parseError) {
        logger.error('Failed to parse Firebase service account:', parseError);
        logger.warn('Falling back to default credentials');
        const adminApp = initializeApp();
        db = getFirestore(adminApp);
      }
    } else {
      const adminApp = initializeApp();
      db = getFirestore(adminApp);
      logger.info('Firebase initialized with default credentials');
    }

    return db;
  } catch (error) {
    logger.error('Firebase initialization error:', error);
    logger.warn('API will run in mock mode without database');
    return null;
  }
}

export function getDB(): Firestore | null {
  return db;
}

export async function setDB(database: Firestore | null): Promise<void> {
  db = database;
}
