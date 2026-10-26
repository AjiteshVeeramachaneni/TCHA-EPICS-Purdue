import test from 'node:test'
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'

// Opt-in only. Never run these fixtures against a real project.
test('Firebase emulators: invitation, login, role enforcement, publishing and database rules', {
  skip: process.env.RUN_FIREBASE_EMULATOR_TESTS !== 'true',
}, async () => {
  assert.equal(process.env.GCLOUD_PROJECT, 'demo-tcha-admin')
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST?.startsWith('127.0.0.1:'))
  assert.ok(process.env.FIREBASE_AUTH_EMULATOR_HOST?.startsWith('127.0.0.1:'))
  const { initializeApp } = await import('firebase-admin/app')
  const { getAuth } = await import('firebase-admin/auth')
  const { getFirestore } = await import('firebase-admin/firestore')
  initializeApp({ projectId: 'demo-tcha-admin' })
  const auth = getAuth(), db = getFirestore()
  const suffix = randomBytes(6).toString('hex')
  const password = 'Emulator-test-password-123!'
  const email = 'operator-' + suffix + '@example.org'
  const user = await auth.createUser({ email, password })
  await auth.setCustomUserClaims(user.uid, { admin: true })
  await db.doc('admins/' + user.uid).set({ username: 'operator_' + suffix, email, active: true })
  async function authRest(method, data) {
    const response = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:' + method + '?key=demo-key', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    })
    const body = await response.json()
    assert.equal(response.ok, true, JSON.stringify(body))
    return body
  }
  async function call(name, data, token) {
    const response = await fetch('http://127.0.0.1:5001/demo-tcha-admin/us-central1/' + name, {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      body: JSON.stringify({ data }),
    })
    return { status: response.status, body: await response.json() }
  }
  async function document(path, token, method = 'GET', body) {
    return fetch('http://127.0.0.1:8080/v1/projects/demo-tcha-admin/databases/(default)/documents/' + path, {
      method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
  }
  const operator = await authRest('signInWithPassword', { email, password, returnSecureToken: true })
  assert.equal((await call('adminCreateInvite', { email: 'new-' + suffix + '@example.org' })).status, 403)
  const invitation = await call('adminCreateInvite', { email: 'new-' + suffix + '@example.org' }, operator.idToken)
  assert.equal(invitation.status, 200, JSON.stringify(invitation.body))
  const setup = { email: invitation.body.result.email, code: invitation.body.result.code, username: 'staff_' + suffix, password }
  assert.equal((await call('adminRegister', { ...setup, email: 'wrong@example.org' })).status, 403)
  const registration = await call('adminRegister', setup)
  assert.equal(registration.status, 200, JSON.stringify(registration.body))
  assert.equal((await call('adminRegister', setup)).status, 403)
  assert.equal((await call('adminSignIn', { identifier: setup.username, password: 'incorrect' })).status, 401)
  const login = await call('adminSignIn', { identifier: setup.username.toUpperCase(), password })
  assert.equal(login.status, 200, JSON.stringify(login.body))
  const session = await authRest('signInWithCustomToken', { token: login.body.result.token, returnSecureToken: true })
  const token = session.idToken
  const sessionUid = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()).sub
  assert.equal((await call('adminSignIn', { identifier: setup.email, password })).status, 200)
  const eventId = 1
  const revision = (await db.doc('museumEvents/' + eventId).get()).data()?.revision || 0
  const edit = { id: eventId, title: 'Emulator published title', year: '1806', summary: 'A test introduction.', source: 'TCHA, emulator fixture', revision }
  assert.equal((await call('adminSaveEvent', edit)).status, 403)
  const saved = await call('adminSaveEvent', edit, token)
  assert.equal(saved.status, 200, JSON.stringify(saved.body))
  assert.equal((await call('adminSaveEvent', edit, token)).status, 409)
  assert.equal((await db.doc('museumEvents/' + eventId).get()).data().updatedBy, sessionUid)
  assert.equal((await document('museumEvents/1')).status, 200)
  assert.equal((await document('museumEvents')).status, 200)
  for (const path of ['adminInvites', 'adminUsernames', 'adminRateLimits', 'users']) {
    assert.equal((await document(path)).status, 403, 'Visitor must not list ' + path)
    assert.equal((await document(path, token)).status, 403, 'Admin client must not list ' + path)
  }
  assert.equal((await document('admins/' + sessionUid, token)).status, 200)
  assert.equal((await document('admins/' + user.uid, token)).status, 403)
  assert.equal((await document('museumEvents/1', token, 'PATCH', { fields: { title: { stringValue: 'Bypass' } } })).status, 403)
  const outsider = await authRest('signUp', { email: 'outsider-' + suffix + '@example.org', password, returnSecureToken: true })
  assert.equal((await call('adminSaveEvent', edit, outsider.idToken)).status, 403)
  assert.equal((await call('adminSignIn', { identifier: 'outsider-' + suffix + '@example.org', password })).status, 401)
  await db.doc('admins/' + sessionUid).update({ active: false })
  assert.equal((await call('adminSaveEvent', { ...edit, revision: revision + 1 }, token)).status, 403)
  assert.equal((await document('admins/' + sessionUid, token)).status, 403)
  console.log('Emulator checks passed: registration, login, publication, stale-edit rejection, raw-write denial, private-data denial and role revocation.')
})
