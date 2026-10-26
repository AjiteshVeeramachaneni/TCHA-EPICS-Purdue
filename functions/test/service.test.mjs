import test from 'node:test'
import assert from 'node:assert/strict'
import { createAdminService } from '../service.mjs'
import { hash } from '../policy.mjs'

function fixture() {
  const rows = new Map()
  const users = new Map()
  let time = 1000000
  let failClaims = false
  let lock = Promise.resolve()
  const snapshot = path => ({ exists: rows.has(path), data: () => structuredClone(rows.get(path)) })
  const db = {
    doc(path) { return { path, get: async () => snapshot(path), set: async value => rows.set(path, structuredClone(value)), update: async value => rows.set(path, { ...rows.get(path), ...value }) } },
    async runTransaction(callback) {
      const run = lock.then(async () => {
        const pending = []
        const result = await callback({
          get: async ref => snapshot(ref.path),
          set: (ref, value) => pending.push(() => rows.set(ref.path, structuredClone(value))),
          delete: ref => pending.push(() => rows.delete(ref.path)),
        })
        pending.forEach(write => write())
        return result
      })
      lock = run.catch(() => {})
      return run
    },
  }
  const auth = {
    async createUser(data) {
      if ([...users.values()].some(user => user.email === data.email)) throw Object.assign(new Error(), { code: 'auth/email-already-exists' })
      users.set(data.uid, { ...data, customClaims: {}, disabled: false })
    },
    async setCustomUserClaims(uid, claims) { if (failClaims) throw new Error('Claim write failed'); users.get(uid).customClaims = claims },
    async deleteUser(uid) { users.delete(uid) },
    async getUser(uid) { if (!users.has(uid)) throw new Error('User missing'); return users.get(uid) },
    async createCustomToken(uid) { return 'test-token:' + uid },
  }
  const service = createAdminService({ db, auth, now: () => time, passwordSignIn: async (email, password) => {
    const user = [...users.values()].find(user => user.email === email && user.password === password && !user.disabled)
    if (!user) throw new Error('Invalid credentials')
    return user.uid
  } })
  async function account(email = 'admin@example.org', username = 'museum_admin') {
    const invitation = await service.createInvite(email, 'operator')
    await service.register({ email, username, password: 'Test-only-password-123', code: invitation.code }, { ip: 'test' })
    const uid = rows.get('adminUsernames/' + username).uid
    return { uid, invitation, context: { auth: { uid, token: { admin: true } }, ip: 'test' } }
  }
  return { service, rows, users, account, advance: ms => { time += ms }, failClaims: () => { failClaims = true } }
}
const event = { id: 1, title: 'An updated title', year: '1806', summary: 'A short source-based introduction.', source: 'TCHA book, p. 1', revision: 0 }
const denied = (promise, code = 'permission-denied') => assert.rejects(promise, error => error.code === code)

test('registration requires an invitation tied to the same email; expiry and reuse are enforced', async () => {
  const f = fixture()
  const invite = await f.service.createInvite('approved@example.org', 'operator')
  assert.equal(f.rows.has('adminInvites/' + invite.code), false)
  assert.equal(f.rows.get('adminInvites/' + hash(invite.code)).email, 'approved@example.org')
  const data = { email: 'other@example.org', username: 'museum_staff', password: 'Test-only-password-123', code: invite.code }
  await denied(f.service.register(data, { ip: 'test' }))
  data.email = 'approved@example.org'
  f.advance(48 * 60 * 60 * 1000 + 1)
  await denied(f.service.register(data, { ip: 'test' }))
  const { invitation } = await f.account()
  await denied(f.service.register({ ...data, email: invitation.email, code: invitation.code }, { ip: 'test' }))
})
test('concurrent redemption creates exactly one administrator', async () => {
  const f = fixture()
  const invite = await f.service.createInvite('approved@example.org', 'operator')
  const results = await Promise.allSettled(['first_admin', 'second_admin'].map(username => f.service.register({
    email: invite.email, username, password: 'Test-only-password-123', code: invite.code,
  }, { ip: 'test' })))
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1)
  assert.equal(f.users.size, 1)
})
test('username uniqueness is case insensitive and a failed attempt does not consume the invite', async () => {
  const f = fixture()
  await f.account()
  const invite = await f.service.createInvite('second@example.org', 'operator')
  await denied(f.service.register({ email: invite.email, username: 'MUSEUM_ADMIN', password: 'Test-only-password-123', code: invite.code }, { ip: 'test' }), 'already-exists')
  assert.equal(f.rows.get('adminInvites/' + hash(invite.code)).usedBy, null)
})
test('partial registration failure removes the identity and releases profile, username and invitation', async () => {
  const f = fixture()
  f.failClaims()
  await assert.rejects(f.account())
  assert.equal(f.users.size, 0)
  assert.equal([...f.rows.keys()].some(key => key.startsWith('admins/') || key.startsWith('adminUsernames/')), false)
  assert.equal([...f.rows.values()].find(row => row.createdBy === 'operator').usedBy, null)
})
test('email and username sign-in work; incorrect credentials and non-admins get the same generic error', async () => {
  const f = fixture()
  const { uid } = await f.account()
  for (const identifier of ['MUSEUM_ADMIN', 'ADMIN@example.org']) {
    assert.equal((await f.service.signIn({ identifier, password: 'Test-only-password-123' }, { ip: 'test' })).token, 'test-token:' + uid)
  }
  let expected
  try { await f.service.signIn({ identifier: 'museum_admin', password: 'wrong' }, { ip: 'test' }) } catch (error) { expected = error.message }
  f.users.get(uid).customClaims = {}
  await assert.rejects(f.service.signIn({ identifier: 'museum_admin', password: 'Test-only-password-123' }, { ip: 'test' }), error => error.code === 'unauthenticated' && error.message === expected)
})
test('editing and inviting require live server-side claims and an active admin profile', async () => {
  const f = fixture()
  const { uid, context } = await f.account()
  await denied(f.service.saveEvent(event, {}))
  await denied(f.service.invite({ email: 'new@example.org' }, {}))
  f.users.get(uid).disabled = true
  await denied(f.service.saveEvent(event, context))
  f.users.get(uid).disabled = false
  f.rows.get('admins/' + uid).active = false
  await denied(f.service.invite({ email: 'new@example.org' }, context))
  f.rows.get('admins/' + uid).active = true
  f.users.get(uid).customClaims.admin = false
  await denied(f.service.saveEvent(event, context))
})
test('publishing records the editor and uses revisions to prevent lost updates', async () => {
  const f = fixture()
  const { uid, context } = await f.account()
  assert.deepEqual(await f.service.saveEvent(event, context), { revision: 1 })
  assert.equal(f.rows.get('museumEvents/1').updatedBy, uid)
  await denied(f.service.saveEvent({ ...event, title: 'Stale edit' }, context), 'aborted')
  assert.equal(f.rows.get('museumEvents/1').title, event.title)
  assert.deepEqual(await f.service.saveEvent({ ...event, revision: 1 }, context), { revision: 2 })
})
test('invalid or oversized event fields and weak setup passwords are rejected', async () => {
  const f = fixture()
  const { context } = await f.account()
  for (const data of [{ ...event, id: 11 }, { ...event, revision: -1 }, { ...event, title: ' ' }, { ...event, summary: 'a'.repeat(2001) }, { ...event, source: '' }]) {
    await denied(f.service.saveEvent(data, context), 'invalid-argument')
  }
  const invitation = await f.service.createInvite('other@example.org', 'operator')
  await denied(f.service.register({ ...invitation, username: 'staff', password: 'short' }, { ip: 'test' }), 'invalid-argument')
})
test('sign-in rate limits are durable and expire after 15 minutes', async () => {
  const f = fixture()
  for (let i = 0; i < 15; i++) await denied(f.service.signIn({ identifier: 'unknown', password: 'wrong' }, { ip: 'test' }), 'unauthenticated')
  await denied(f.service.signIn({ identifier: 'unknown', password: 'wrong' }, { ip: 'test' }), 'resource-exhausted')
  f.advance(900001)
  await denied(f.service.signIn({ identifier: 'unknown', password: 'wrong' }, { ip: 'test' }), 'unauthenticated')
})
