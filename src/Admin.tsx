import { useEffect, useState, type FormEvent } from 'react'
import {
  browserSessionPersistence, createUserWithEmailAndPassword, onAuthStateChanged,
  sendEmailVerification, setPersistence, signInWithEmailAndPassword, signOut,
  updateProfile, type User,
} from 'firebase/auth'
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from './lib/firebase'
import './admin.css'

export default function Admin() {
  const [mode, setMode] = useState<'login' | 'setup'>('login')
  const [user, setUser] = useState<User | null>(null)
  const [approved, setApproved] = useState(false)
  const [checking, setChecking] = useState(true)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [announcement, setAnnouncement] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    let version = 0
    let stopApproval: (() => void) | undefined
    const stopAuth = onAuthStateChanged(auth, async current => {
      const attempt = ++version
      stopApproval?.()
      setUser(current); setApproved(false); setChecking(!!current)
      if (!current) return
      try {
        await current.reload()
        await current.getIdToken(true)
        if (!active || attempt !== version) return
        if (!current.emailVerified) { setChecking(false); return }
        stopApproval = onSnapshot(doc(db, 'admins', current.uid), snapshot => {
          if (!active || attempt !== version) return
          setApproved(snapshot.data()?.active === true); setChecking(false)
        }, () => {
          if (active && attempt === version) {
            setChecking(false); setNotice('Could not check admin access. Please sign out and try again.')
          }
        })
      } catch {
        if (active && attempt === version) { setChecking(false); setNotice('Could not connect. Please try again.') }
      }
    })
    return () => { active = false; version++; stopAuth(); stopApproval?.() }
  }, [])

  useEffect(() => {
    if (!approved) return
    return onSnapshot(doc(db, 'settings', 'announcement'), snapshot => {
      setAnnouncement(snapshot.data()?.message || '')
    }, () => setNotice('Could not load the announcement.'))
  }, [approved])

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setNotice('')
    try {
      await setPersistence(auth, browserSessionPersistence)
      if (mode === 'setup') {
        const account = await createUserWithEmailAndPassword(auth, email.trim(), password)
        await updateProfile(account.user, { displayName: username.trim() })
        await sendEmailVerification(account.user)
        await signOut(auth)
        setPassword(''); setMode('login')
        setNotice('Account created. Verify your email, then ask the project owner to approve your admin access.')
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password)
        setPassword('')
      }
    } catch (error) {
      const code = (error as { code?: string }).code
      setNotice(code === 'auth/email-already-in-use'
        ? 'That email already has an account. Please sign in.'
        : code === 'auth/weak-password'
          ? 'Please use a stronger password.'
          : 'Could not continue. Check your details and connection, then try again.')
    } finally { setBusy(false) }
  }

  async function logout() {
    setNotice('')
    try { await signOut(auth) } catch { setNotice('Could not sign out. Please try again.') }
  }

  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setNotice('')
    try {
      await setDoc(doc(db, 'settings', 'announcement'), {
        message: announcement.trim(), updatedAt: serverTimestamp(),
      })
      setNotice('Announcement saved.')
    } catch { setNotice('Could not save. Check your connection and admin approval.') }
    finally { setBusy(false) }
  }

  return <main className="basic-admin">
    <section className="basic-admin-card">
      <a href="/" className="basic-admin-back">← Back to museum</a>
      <p className="basic-admin-brand">TIPPECANOE COUNTY HISTORICAL ASSOCIATION</p>
      <h1>{approved ? 'Admin page' : 'Admin access'}</h1>

      {checking ? <p role="status">Checking your access…</p> : approved ? <>
        <p>Welcome, {user?.displayName || 'admin'}.</p>
        <form onSubmit={save}>
          <label htmlFor="announcement">Museum announcement</label>
          <textarea id="announcement" rows={5} maxLength={1000} value={announcement}
            onChange={e => setAnnouncement(e.target.value)} disabled={busy} />
          <small>This appears above the museum home page. Leave it empty to hide it.</small>
          <button disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
        </form>
        <button className="basic-admin-link" onClick={logout}>Sign out</button>
      </> : user ? <>
        <p>Verify your email and ask the project owner to approve your admin account. Then sign out and sign in again.</p>
        <button className="basic-admin-link" onClick={logout}>Sign out</button>
      </> : <>
        <p>{mode === 'setup' ? 'Create your staff account.' : 'Sign in to manage the museum website.'}</p>
        <form onSubmit={submit}>
          <fieldset disabled={busy}>
            {mode === 'setup' && <>
              <label htmlFor="username">Username</label>
              <input id="username" value={username} onChange={e => setUsername(e.target.value)}
                autoComplete="username" minLength={2} maxLength={40} required />
            </>}
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" value={email}
              onChange={e => setEmail(e.target.value)} required />
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password}
              autoComplete={mode === 'setup' ? 'new-password' : 'current-password'}
              onChange={e => setPassword(e.target.value)}
              minLength={mode === 'setup' ? 12 : 1} maxLength={128} required />
          </fieldset>
          <button disabled={busy}>{busy ? 'Please wait…' : mode === 'setup' ? 'Create account' : 'Sign in'}</button>
        </form>
        <button className="basic-admin-link" disabled={busy} onClick={() => {
          setMode(mode === 'login' ? 'setup' : 'login'); setNotice(''); setPassword('')
        }}>{mode === 'login' ? 'Set up an account' : 'Already have an account? Sign in'}</button>
      </>}
      {notice && <p role="status" className="basic-admin-notice">{notice}</p>}
    </section>
  </main>
}
