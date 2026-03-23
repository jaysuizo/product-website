const env = import.meta.env;

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyDxWkLTCnP8fXqCuKj1U2Lyseb2_ReXw0U",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "my-store-website-5ec32.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "my-store-website-5ec32",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "my-store-website-5ec32.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "920863724828",
  appId: env.VITE_FIREBASE_APP_ID || "1:920863724828:web:bbb06ac849926aec1c96d9"
};

export const missingFirebaseConfigKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => typeof value !== "string" || value.trim() === "" || value.includes("REPLACE_ME"))
  .map(([key]) => key);
