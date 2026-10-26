import { browserLocalPersistence, browserSessionPersistence, setPersistence, signInWithCustomToken } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import { auth, functions } from '../lib/firebase'
import type { EditableEvent } from '../content'

export async function signIn(identifier: string, password: string, remember: boolean) {
  await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence)
  const result = await httpsCallable<{ identifier: string; password: string }, { token: string }>(functions, 'adminSignIn')({ identifier, password })
  await signInWithCustomToken(auth, result.data.token)
}
export async function register(data: { username: string; email: string; password: string; code: string }) {
  await httpsCallable(functions, 'adminRegister')(data)
}
export async function saveEvent(data: EditableEvent) {
  return (await httpsCallable<EditableEvent, { revision: number }>(functions, 'adminSaveEvent')(data)).data
}
export async function inviteAdmin(email: string) {
  return (await httpsCallable<{ email: string }, { email: string; code: string; expiresAt: number }>(functions, 'adminCreateInvite')({ email })).data
}
export function errorMessage(error: unknown) {
  const e = error as { code?: string; message?: string }
  if (e.code === 'functions/not-found' || e.code === 'functions/unavailable' || e.code === 'functions/internal') {
    return 'The admin service is unavailable. Check your connection or ask the project owner to deploy the Firebase functions.'
  }
  if (e.code === 'auth/network-request-failed') return 'Could not connect. Check your internet connection and try again.'
  if (e.code === 'auth/too-many-requests') return 'Too many attempts. Please try again later.'
  if (e.code?.startsWith('functions/')) return e.message || 'The request could not be completed.'
  return 'The request could not be completed. Please try again.'
}
