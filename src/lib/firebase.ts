import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions'

// Web configuration is public; claims and rules enforce authorization.
const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyB1Bnqs74i1g4Rx78Y4OxQZcP7rhByzJfA',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'tcha-bfc71.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'tcha-bfc71',
  storageBucket: 'tcha-bfc71.firebasestorage.app',
  messagingSenderId: '719395909531',
  appId: '1:719395909531:web:e69d790a6746c7d6433b3e',
})
export const auth = getAuth(app)
export const db = getFirestore(app)
export const functions = getFunctions(app, 'us-central1')
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
  connectFunctionsEmulator(functions, '127.0.0.1', 5001)
}
