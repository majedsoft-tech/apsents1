import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { 
  initializeFirestore, 
  getFirestore,
  persistentLocalCache, 
  persistentMultipleTabManager,
  setLogLevel,
  Firestore
} from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Suppress internal Firestore network and quota exhaustion backoff logs in console
try {
  setLogLevel("silent");
} catch (_) {}

// Explicit Firebase Project Configuration provided by user
export const firebaseConfig = {
  apiKey: "AIzaSyBfE_Uv7yi5V4MncLB-MPxlRMdiMHu2xdo",
  authDomain: "apsents1.firebaseapp.com",
  projectId: "apsents1",
  storageBucket: "apsents1.firebasestorage.app",
  messagingSenderId: "633702438157",
  appId: "1:633702438157:web:b3067132f4ea5c073a4c44",
  measurementId: "G-ZMDFXB1MPB"
};

// Initialize Firebase App
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

/**
 * Get active Firestore Database ID from localStorage or default to "(default)"
 */
export function getActiveFirestoreDatabaseId(): string {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("firestore_custom_database_id");
    if (saved && saved.trim()) return saved.trim();
  }
  return "(default)";
}

/**
 * Set active Firestore Database ID in localStorage
 */
export function setActiveFirestoreDatabaseId(id: string): void {
  if (typeof window !== "undefined") {
    const clean = id?.trim();
    if (!clean || clean === "(default)") {
      localStorage.removeItem("firestore_custom_database_id");
    } else {
      localStorage.setItem("firestore_custom_database_id", clean);
    }
  }
}

/**
 * Get a Firestore instance for a specific database ID
 */
export function getDbForDatabaseId(databaseId?: string): Firestore {
  const dbId = databaseId && databaseId !== "(default)" ? databaseId.trim() : undefined;
  try {
    if (dbId) {
      return getFirestore(app, dbId);
    }
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      }),
      ignoreUndefinedProperties: true,
    });
  } catch (_) {
    return dbId ? getFirestore(app, dbId) : getFirestore(app);
  }
}

const activeDbId = getActiveFirestoreDatabaseId();
export const db: Firestore = getDbForDatabaseId(activeDbId);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});


