// lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB2Bo80Bxjf_Zj3Nm5uY_wAKr3A9lZGzBQ",
  authDomain: "praskla-ems.firebaseapp.com",
  databaseURL: "https://praskla-ems-default-rtdb.firebaseio.com",
  projectId: "praskla-ems",
  storageBucket: "praskla-ems.appspot.com",
  messagingSenderId: "667460273299",
  appId: "1:667460273299:web:5c9aefc673744ae63a3966",
  measurementId: "G-RW48L08YJQ",
};

// Prevent multiple initializations in Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firestore
const db = getFirestore(app);

// Authentication
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Optional: Analytics (client-side only)
if (typeof window !== "undefined") {
  import("firebase/analytics")
    .then(({ getAnalytics }) => {
      getAnalytics(app);
      console.log("✅ Firebase analytics loaded");
    })
    .catch((err) => {
      console.warn("⚠️ Analytics load failed:", err);
    });
}

export { db, auth, provider };
