// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDqZvECrRCzgJ7mZI9WwC1gVGXXjLaKJxI",
  authDomain: "dha-application-ad082.firebaseapp.com",
  projectId: "dha-application-ad082",
  storageBucket: "dha-application-ad082.firebasestorage.app",
  messagingSenderId: "973280178115",
  appId: "1:973280178115:web:5c0a9612ab64bc27a4d776",
  measurementId: "G-MFJTB5JB24"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in production)
let analytics;
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
  analytics = getAnalytics(app);
}

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Enable network for Firestore to resolve offline issues
enableNetwork(db).catch((error) => {
  console.warn('Failed to enable Firestore network:', error);
});

// Development mode setup (optional - for local testing)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Only connect to emulators if not already connected
  try {
    // Uncomment these lines if you want to use Firebase emulators in development
    // connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    // connectFirestoreEmulator(db, 'localhost', 8080);
    // connectStorageEmulator(storage, "localhost", 9199);
  } catch (error) {
    console.log('Emulators already connected or not available');
  }
}

// Helper function to check network status
export const checkFirestoreConnection = async () => {
  try {
    await enableNetwork(db);
    return true;
  } catch (error) {
    console.error('Firestore connection failed:', error);
    return false;
  }
};

// Helper function to handle offline scenarios
export const handleOfflineMode = async () => {
  try {
    await disableNetwork(db);
    console.log('Firestore offline mode enabled');
  } catch (error) {
    console.error('Failed to enable offline mode:', error);
  }
};

export { auth, db, storage, analytics };
export default app;