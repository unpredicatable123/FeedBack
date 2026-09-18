import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const config = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID
};

/**
 * True once every required key is present. Until the developer fills in
 * `.env`, the app stays fully usable — submissions fall back to localStorage
 * so the UI can be demoed without a Firebase project.
 */
export const isFirebaseConfigured = Boolean(
	config.apiKey && config.projectId && config.appId
);

let db: Firestore | null = null;

export function getDb(): Firestore | null {
	if (!isFirebaseConfigured) return null;
	if (db) return db;

	const app: FirebaseApp = getApps().length ? getApp() : initializeApp(config);
	db = getFirestore(app);
	return db;
}
