import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, logEvent } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAeE_g30VNDcTePirqZpaycztg9zVO4Rwc",
  authDomain: "project1-9a1e4.firebaseapp.com",
  projectId: "project1-9a1e4",
  storageBucket: "project1-9a1e4.firebasestorage.app",
  messagingSenderId: "248159173379",
  appId: "1:248159173379:web:6aa981e974e50924d34736",
  measurementId: "G-T1JLSZ2BZW"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// ✅ FIXED (no async issue)
export const analytics =
  typeof window !== "undefined" ? getAnalytics(app) : null;

export { logEvent };