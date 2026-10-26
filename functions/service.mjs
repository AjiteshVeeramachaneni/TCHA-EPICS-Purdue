import { AdminError, emailValue, eventValues, hash, newCode, requireValue, setupValues } from './policy.mjs'

// Explicit dependencies allow tests without production Firebase access.
export function createAdminService({ db, auth, passwordSignIn, now = Date.now }) {
  async function limit(scope, key, maximum) {
    const ref = db.doc('adminRateLimits/' + hash(scope + ':' + key))
    await db.runTransaction(async tx => {
      const old = (await tx.get(ref)).data()
      const active = old && old.expiresAt > now()
      const attempts = active ? old.attempts : 0
      requireValue(attempts < maximum, 'resource-exhausted', 'Too many attempts. Try again in 15 minutes.')
      tx.set(ref, { attempts: attempts + 1, expiresAt: active ? old.expiresAt : now() + 900000 })
    })
  }
  async function requireAdmin(context) {
    requireValue(context?.auth?.uid && context.auth.token.admin === true, 'permission-denied', 'Administrator access is required.')
    const uid = context.auth.uid
    const [user, profile] = await Promise.all([auth.getUser(uid), db.doc('admins/' + uid).get()])
    requireValue(!user.disabled && user.customClaims?.admin === true && profile.data()?.active === true, 'permission-denied', 'Administrator access is required.')
    return uid
  }
  async function createInvite(email, createdBy) {
    const normalized = emailValue(email)
    const code = newCode()
    const expiresAt = now() + 48 * 60 * 60 * 1000
    await db.doc('adminInvites/' + hash(code)).set({ email: normalized, expiresAt, createdBy, usedBy: null })
    return { code, email: normalized, expiresAt }
  }
  return {
    createInvite,
    async invite(data, context) { return createInvite(data?.email, await requireAdmin(context)) },
    async register(data, context) {
      await limit('setup-ip', context?.ip || 'unknown', 20)
      const { email, username, password, code } = setupValues(data)
      const uid = newCode()
      const inviteRef = db.doc('adminInvites/' + hash(code))
      const usernameRef = db.doc('adminUsernames/' + username)
      const profileRef = db.doc('admins/' + uid)
      await db.runTransaction(async tx => {
        const [invitation, name] = await Promise.all([tx.get(inviteRef), tx.get(usernameRef)])
        const invite = invitation.data()
        requireValue(invite && !invite.usedBy && invite.email === email && invite.expiresAt > now(), 'permission-denied', 'This invitation is invalid or expired.')
        requireValue(!name.exists, 'already-exists', 'That username is unavailable.')
        tx.set(inviteRef, { ...invite, usedBy: uid })
        tx.set(usernameRef, { uid, email })
        tx.set(profileRef, { username, email, active: false, createdAt: now() })
      })
      let created = false
      try {
        await auth.createUser({ uid, email, password, displayName: username })
        created = true
        await auth.setCustomUserClaims(uid, { admin: true })
        await profileRef.update({ active: true })
      } catch (error) {
        // Keep reservations until an incomplete identity is safely removed.
        if (created) await auth.deleteUser(uid)
        await db.runTransaction(async tx => {
          const invitation = (await tx.get(inviteRef)).data()
          if (invitation?.usedBy === uid) {
            tx.set(inviteRef, { ...invitation, usedBy: null })
            tx.delete(usernameRef)
            tx.delete(profileRef)
          }
        })
        if (error.code === 'auth/email-already-exists') throw new AdminError('already-exists', 'This email already has an account. Sign in or reset your password.')
        throw error
      }
      return { created: true }
    },
    async signIn(data, context) {
      const identifier = typeof data?.identifier === 'string' ? data.identifier.trim().toLowerCase() : ''
      requireValue(identifier.length > 0 && identifier.length <= 254 && typeof data.password === 'string' && data.password.length > 0 && data.password.length <= 128, 'invalid-argument', 'Enter your username or email and password.')
      await limit('login-ip', context?.ip || 'unknown', 40)
      await limit('login-account', identifier, 15)
      const invalid = () => new AdminError('unauthenticated', 'The sign-in details are incorrect or this account is not an administrator.')
      let email = identifier
      if (!identifier.includes('@')) {
        if (!/^[a-z][a-z0-9_-]{2,29}$/.test(identifier)) throw invalid()
        const name = await db.doc('adminUsernames/' + identifier).get()
        email = name.data()?.email || 'unknown-admin@invalid.example'
      }
      let uid
      try { uid = await passwordSignIn(email, data.password) } catch { throw invalid() }
      try { await requireAdmin({ auth: { uid, token: { admin: true } } }) } catch { throw invalid() }
      return { token: await auth.createCustomToken(uid) }
    },
    async saveEvent(data, context) {
      const uid = await requireAdmin(context)
      const fields = eventValues(data)
      return db.runTransaction(async tx => {
        const ref = db.doc('museumEvents/' + fields.id)
        const old = (await tx.get(ref)).data()
        requireValue((old?.revision || 0) === data.revision, 'aborted', 'Another admin changed this event. Reload its latest version before saving.')
        const revision = data.revision + 1
        tx.set(ref, { ...fields, revision, updatedBy: uid, updatedAt: now() })
        return { revision }
      })
    },
  }
}
