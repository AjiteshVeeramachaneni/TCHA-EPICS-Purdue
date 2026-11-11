import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { doc, getFirestore, increment, setDoc } from 'firebase/firestore'

// Uses the Firebase project already configured in your repository.
const app = initializeApp({
  apiKey: 'AIzaSyB1Bnqs74i1g4Rx78Y4OxQZcP7rhByzJfA',
  authDomain: 'tcha-bfc71.firebaseapp.com',
  projectId: 'tcha-bfc71',
  appId: '1:719395909531:web:e69d790a6746c7d6433b3e',
})

export const auth = getAuth(app)
export const db = getFirestore(app)

async function addAnswerCount(field: 'correctAnswers' | 'incorrectAnswers', count = 1): Promise<void> {
  const user = auth.currentUser

  if (!user) {
    throw new Error('You must be signed in to record an answer.')
  }

  if (!Number.isInteger(count) || count < 1) {
    throw new RangeError('Answer count must be a positive integer.')
  }

  await setDoc(doc(db, 'users', user.uid), { [field]: increment(count) }, { merge: true })
}

export function addCorrect(count = 1): Promise<void> {
  return addAnswerCount('correctAnswers', count)
}

export function addIncorrect(count = 1): Promise<void> {
  return addAnswerCount('incorrectAnswers', count)
}
