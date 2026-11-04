import { useEffect, useState, type FormEvent } from 'react'
import {
  browserSessionPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from './lib/firebase'
import './admin.css'

export default function Admin() {
  const [user, setUser] = useState<User | null>(null)
  const [approved, setApproved] = useState(false)
  const [checking, setChecking] = useState(true)
  const [adminId, setAdminId] = useState('')
  const [password, setPassword] = useState('')
  const [announcement, setAnnouncement] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    let version = 0
    let stopApproval: (() => void) | undefined

    const stopAuth = onAuthStateChanged(auth, current => {
      const attempt = ++version
      stopApproval?.()
      setUser(current)
      setApproved(false)
      setChecking(!!current)

      if (!current) return

      stopApproval = onSnapshot(
        doc(db, 'admins', current.uid),
        snapshot => {
          if (!active || attempt !== version) return
          setApproved(snapshot.data()?.active === true)
          setChecking(false)
        },
        () => {
          if (active && attempt === version) {
            setChecking(false)
            setNotice('Could not check admin access. Please sign out and try again.')
          }
        },
      )
    })

    return () => {
      active = false
      version++
      stopAuth()
      stopApproval?.()
    }
  }, [])

  useEffect(() => {
    if (!approved) return

    return onSnapshot(
      doc(db, 'settings', 'announcement'),
      snapshot => setAnnouncement(snapshot.data()?.message || ''),
      () => setNotice('Could not load the announcement.'),
    )
  }, [approved])

  async function submit(event: FormEvent) {
    event.preventDefault()
    setNotice('')

    const normalizedId = adminId.trim().toLowerCase()

    if (!/^[a-z0-9][a-z0-9-]{2,31}$/.test(normalizedId)) {
      setNotice('Use an Admin ID with 3–32 letters, numbers, or hyphens.')
      return
    }

    setBusy(true)

    try {
      await setPersistence(auth, browserSessionPersistence)

      // Firebase uses this generated email internally.
      // The admin only enters their ID and password.
      await signInWithEmailAndPassword(
        auth,
        `${normalizedId}@admins.tcha-bfc71.firebaseapp.com`,
        password,
      )

      setPassword('')
    } catch (error) {
      const code = (error as { code?: string }).code

      setNotice(
        code === 'auth/invalid-credential' ||
          code === 'auth/user-not-found' ||
          code === 'auth/wrong-password'
          ? 'Admin ID or password is incorrect.'
          : 'Could not sign in. Check Firebase setup and your connection, then try again.',
      )
    } finally {
      setBusy(false)
    }
  }

  async function logout() {
    setNotice('')

    try {
      await signOut(auth)
    } catch {
      setNotice('Could not sign out. Please try again.')
    }
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setNotice('')

    try {
      await setDoc(doc(db, 'settings', 'announcement'), {
        message: announcement.trim(),
        updatedAt: serverTimestamp(),
      })
      setNotice('Announcement saved.')
    } catch {
      setNotice('Could not save. Check your connection and admin approval.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="basic-admin">
      <section className="basic-admin-card">
        <a href="/" className="basic-admin-back">← Back to museum</a>
        <p className="basic-admin-brand">
          TIPPECANOE COUNTY HISTORICAL ASSOCIATION
        </p>
        <h1>{approved ? 'Admin page' : 'Admin access'}</h1>

        {checking ? (
          <p role="status">Checking your access…</p>
        ) : approved ? (
          <>
            <p>Welcome, {adminId || user?.displayName || 'admin'}.</p>
            <form onSubmit={save}>
              <label htmlFor="announcement">Museum announcement</label>
              <textarea
                id="announcement"
                rows={5}
                maxLength={1000}
                value={announcement}
                onChange={event => setAnnouncement(event.target.value)}
                disabled={busy}
              />
              <small>
                This message appears above the museum home page. Leave it empty to hide it.
              </small>
              <button disabled={busy}>
                {busy ? 'Saving…' : 'Save changes'}
              </button>
            </form>
            <button className="basic-admin-link" onClick={logout}>
              Sign out
            </button>
          </>
        ) : user ? (
          <>
            <p>
              This Admin ID is not enabled for access. Please double check.
            </p>
            <button className="basic-admin-link" onClick={logout}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <p>Sign in with your Admin ID and password.</p>
            <form onSubmit={submit}>
              <fieldset disabled={busy}>
                <label htmlFor="admin-id">Admin ID</label>
                <input
                  id="admin-id"
                  autoComplete="username"
                  value={adminId}
                  onChange={event => setAdminId(event.target.value)}
                  minLength={3}
                  maxLength={32}
                  required
                />

                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  autoComplete="current-password"
                  onChange={event => setPassword(event.target.value)}
                  maxLength={128}
                  required
                />
              </fieldset>

              <button disabled={busy}>
                {busy ? 'Please wait…' : 'Sign in'}
              </button>
            </form>
          </>
        )}

        {notice && (
          <p role="status" className="basic-admin-notice">
            {notice}
          </p>
        )}
      </section>
    </main>
  )
}
