import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Uses the Firebase project already configured in your repository.
const app = initializeApp({
  apiKey: 'AIzaSyB1Bnqs74i1g4Rx78Y4OxQZcP7rhByzJfA',
  authDomain: 'tcha-bfc71.firebaseapp.com',
  projectId: 'tcha-bfc71',
  appId: '1:719395909531:web:e69d790a6746c7d6433b3e',
})

export const auth = getAuth(app)
export const db = getFirestore(app)
