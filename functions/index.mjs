import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineString } from 'firebase-functions/params'
import { createAdminService } from './service.mjs'
import { AdminError } from './policy.mjs'

initializeApp()
const apiKey = defineString('TCHA_WEB_API_KEY')
const service = createAdminService({
  db: getFirestore(), auth: getAuth(),
  async passwordSignIn(email, password) {
    const emulator = process.env.FIREBASE_AUTH_EMULATOR_HOST
    const base = emulator ? 'http://' + emulator + '/identitytoolkit.googleapis.com' : 'https://identitytoolkit.googleapis.com'
    const response = await fetch(base + '/v1/accounts:signInWithPassword?key=' + encodeURIComponent(apiKey.value()), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
      signal: AbortSignal.timeout(10000),
    })
    const result = await response.json()
    if (!response.ok || !result.localId) throw new Error('Invalid credentials')
    return result.localId
  },
})
function callable(method) {
  return onCall({ region: 'us-central1', maxInstances: 10, invoker: 'public' }, async request => {
    try { return await service[method](request.data, { auth: request.auth, ip: request.rawRequest.ip }) }
    catch (error) {
      if (error instanceof AdminError) throw new HttpsError(error.code, error.message)
      // Never log request bodies, passwords or invitation codes.
      console.error('Admin ' + method + ' failed', { code: error.code || 'internal' })
      throw new HttpsError('internal', 'The request could not be completed. Please try again.')
    }
  })
}
export const adminRegister = callable('register')
export const adminSignIn = callable('signIn')
export const adminCreateInvite = callable('invite')
export const adminSaveEvent = callable('saveEvent')
