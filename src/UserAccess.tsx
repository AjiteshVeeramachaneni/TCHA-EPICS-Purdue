import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from './lib/firebase'

export default function UserAccess({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState('')
  const [savedEmail, setSavedEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    const unsubscribe = onAuthStateChanged(auth, async user => {
      setLoading(true)
      setNotice('')
      if (!user) {
        if (active) setLoading(false)
        return
      }

      try {
        const profile = await getDoc(doc(db, 'users', user.uid))
        if (!active) return
        const storedEmail = profile.data()?.email
        if (typeof storedEmail === 'string') {
          setEmail(storedEmail)
          setSavedEmail(storedEmail)
          setProfileSaved(true)
        } else {
          setSavedEmail('')
          setProfileSaved(false)
        }
      } catch {
        if (active) {
          setNotice('Could not load your profile. Check your connection and try again.')
        }
      } finally {
        if (active) setLoading(false)
      }
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) return

    setBusy(true)
    setNotice('')
    try {
      const user = auth.currentUser ?? (await signInAnonymously(auth)).user
      await setDoc(doc(db, 'users', user.uid), { email: normalizedEmail }, { merge: true })
      setEmail(normalizedEmail)
      setSavedEmail(normalizedEmail)
      setProfileSaved(true)
      setEditing(false)
    } catch (error) {
      const code = (error as { code?: string }).code
      setNotice(code === 'auth/operation-not-allowed'
        ? 'Anonymous sign-in is not enabled. Ask the Firebase project administrator to enable it.'
        : code === 'permission-denied'
          ? 'Your profile could not be saved. Check that the latest Firestore rules are published.'
          : 'Could not continue. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <main className="daylight-screen" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <p role="status" style={{ color: '#2B2A28' }}>Loading your profile…</p>
    </main>
  }

  if (profileSaved && !editing) {
    return <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '8px 20px', background: '#f3ecdd', color: '#2b2a28', fontSize: 13 }}>
        <span>{email} <span style={{ opacity: 0.65 }}>(unverified)</span></span>
        <button type="button" onClick={() => setEditing(true)} style={{ textDecoration: 'underline' }}>Change email</button>
      </div>
      {children}
    </>
  }

  return <main className="daylight-screen" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
    <section style={{ width: 'min(100%, 440px)', padding: 32, borderRadius: 16, background: '#f3ecdd', color: '#2b2a28', boxShadow: '0 12px 40px rgba(0,0,0,0.2)' }}>
      <p style={{ margin: '0 0 8px', color: '#85540f', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em' }}>
        TIPPECANOE COUNTY HISTORICAL ASSOCIATION
      </p>
      <h1 style={{ margin: '0 0 10px', fontFamily: 'Lora, Georgia, serif', fontSize: 30 }}>Welcome to the museum</h1>
      <p style={{ margin: '0 0 20px', lineHeight: 1.5 }}>
        Enter your email to save your activity on this browser.
      </p>
      <form onSubmit={submit}>
        <label htmlFor="museum-email" style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Email address</label>
        <input
          id="museum-email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          value={email}
          onChange={event => setEmail(event.target.value)}
          style={{ width: '100%', padding: 12, border: '1px solid #8a8172', borderRadius: 8, background: '#fffdf8', color: '#2b2a28' }}
        />
        <button
          type="submit"
          disabled={busy}
          style={{ width: '100%', marginTop: 16, padding: 12, border: 0, borderRadius: 8, background: '#85540f', color: '#fff', fontWeight: 700, cursor: busy ? 'wait' : 'pointer' }}
        >
          {busy ? 'Please wait…' : 'Continue'}
        </button>
      </form>
      {editing && <button type="button" onClick={() => {
        setEmail(savedEmail)
        setEditing(false)
      }} style={{ marginTop: 12, textDecoration: 'underline' }}>Cancel</button>}
      {notice && <p role="alert" style={{ marginBottom: 0 }}>{notice}</p>}
    </section>
  </main>
}
