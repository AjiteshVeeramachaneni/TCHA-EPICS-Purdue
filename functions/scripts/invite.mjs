import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { emailValue, hash, newCode } from '../policy.mjs'

// Operator-only bootstrap using Application Default Credentials.
const email = emailValue(process.argv[2])
initializeApp()
const code = newCode()
const expiresAt = Date.now() + 48 * 60 * 60 * 1000
await getFirestore().doc('adminInvites/' + hash(code)).set({ email, expiresAt, usedBy: null, createdBy: 'operator' })
console.log('Invitation for ' + email + ' (expires ' + new Date(expiresAt).toISOString() + '):\n' + code + '\nShare privately. Open /admin, then Set up account.')
