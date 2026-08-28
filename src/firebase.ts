import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  initializeFirestore, 
  getFirestore,
  persistentLocalCache, 
  persistentMultipleTabManager,
  setLogLevel
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
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with IndexedDB local persistence and multi-tab synchronization
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    }),
    ignoreUndefinedProperties: true,
  });
} catch (_) {
  firestoreInstance = getFirestore(app);
}

export const db = firestoreInstance;

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

