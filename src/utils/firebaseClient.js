import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

function getFirebaseConfigFromEnv() {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;

  if (!apiKey || !projectId) return null;

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };
}

export function hasFirebaseWebConfig() {
  return Boolean(getFirebaseConfigFromEnv());
}

export function getFirebaseFirestore() {
  const config = getFirebaseConfigFromEnv();
  if (!config) return null;

  if (!getApps().length) {
    initializeApp(config);
  }
  return getFirestore();
}

