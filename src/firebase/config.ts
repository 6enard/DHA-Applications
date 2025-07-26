// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage, analytics };
export default app;