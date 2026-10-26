import { Children, cloneElement, isValidElement, useEffect, useId, useRef, useState, type FormEvent, type ReactElement, type ReactNode } from 'react'
import { getIdTokenResult, onIdTokenChanged, sendPasswordResetEmail, signOut } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { useMuseumContent, type EditableEvent } from '../content'
import { errorMessage, inviteAdmin, register, saveEvent, signIn } from './api'
import './admin.css'

type Profile = { username: string; email: string }
type Mode = 'login' | 'setup' | 'reset'
function Seal() {
  return <div className="admin-seal" aria-hidden="true"><span>★ · ★ · ★</span><strong>1811</strong><span>TIPPECANOE</span><small>BATTLE GROUND</small></div>
}
function Brand() {
  return <a href="/" className="admin-brand"><span className="admin-brand-mark" aria-hidden="true">T</span><span>Tippecanoe County<br /><strong>Historical Association</strong></span></a>
}
function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  const id = useId()
  function controls(nodes: ReactNode): ReactNode {
    return Children.map(nodes, child => {
      if (!isValidElement(child)) return child
      const element = child as ReactElement<{ id?: string; children?: ReactNode; 'aria-describedby'?: string }>
      if (element.type === 'input' || element.type === 'textarea') return cloneElement(element, { id, 'aria-describedby': hint ? id + '-hint' : undefined })
      return element.props.children ? cloneElement(element, { children: controls(element.props.children) }) : element
    })
  }
  return <div className="admin-field"><label htmlFor={id}>{label}</label>{controls(children)}{hint && <small id={id + '-hint'}>{hint}</small>}</div>
}
function AuthPage({ initialError }: { initialError: string }) {
  const [mode, setMode] = useState<Mode>('login')
  const [identifier, setIdentifier] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [code, setCode] = useState('')
  const [remember, setRemember] = useState(false)
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(initialError)
  const [message, setMessage] = useState('')
  const noticeRef = useRef<HTMLParagraphElement>(null)
  useEffect(() => { if (error) noticeRef.current?.focus() }, [error])
  useEffect(() => { if (initialError) setError(initialError) }, [initialError])
  function changeMode(next: Mode) {
    setMode(next); setError(''); setMessage(''); setPassword(''); setConfirm(''); setCode('')
  }
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setMessage('')
    if (mode === 'setup' && password !== confirm) { setError('The passwords do not match.'); return }
    setBusy(true)
    try {
      if (mode === 'login') await signIn(identifier, password, remember)
      if (mode === 'setup') {
        await register({ username, email, password, code: code.trim() })
        setIdentifier(email); setMode('login'); setPassword(''); setConfirm(''); setCode('')
        setMessage('Your admin account is ready. Sign in to open the editor.')
      }
      if (mode === 'reset') {
        try { await sendPasswordResetEmail(auth, email) }
        catch (error) {
          if (!['auth/user-not-found', 'auth/invalid-email'].includes((error as { code: string }).code)) throw error
        }
        setMessage('If this email has an account, a password reset link has been sent. Check your inbox.')
      }
    } catch (error) { setError(errorMessage(error)) }
    finally { setBusy(false) }
  }
  return <main className="admin-root">
    <header className="admin-topbar"><Brand /><a href="/" className="admin-back">← Back to museum</a></header>
    <div className="admin-auth-layout">
      <section className="admin-intro">
        <span className="admin-eyebrow">THE PEOPLE BEHIND THE STORIES</span>
        <Seal />
        <h1>Preserve the past.<br /><em>Inspire the next<br />generation.</em></h1>
        <p>A dedicated space for the people who bring Tippecanoe history to life.</p>
        <div className="admin-intro-note"><span aria-hidden="true">✦</span><span>Museum staff &amp; approved administrators</span></div>
      </section>
      <section className="admin-auth-card" aria-labelledby="auth-title">
        <div className="admin-lock" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /><path d="M12 14v3" /></svg></div>
        <span className="admin-eyebrow">ADMIN PORTAL</span>
        <h2 id="auth-title">{mode === 'login' ? 'Welcome back' : mode === 'setup' ? 'Set up your account' : 'Reset your password'}</h2>
        <p className="admin-subtitle">{mode === 'login' ? 'Sign in to care for the museum’s stories.' : mode === 'setup' ? 'Use your invitation to join the museum team.' : 'We’ll send a reset link to your email.'}</p>
        {mode !== 'reset' && <div className="admin-tabs" aria-label="Account options">
          <button type="button" disabled={busy} aria-pressed={mode === 'login'} onClick={() => changeMode('login')}>Sign in</button>
          <button type="button" disabled={busy} aria-pressed={mode === 'setup'} onClick={() => changeMode('setup')}>Set up account</button>
        </div>}
        <form onSubmit={submit} aria-busy={busy}>
          <fieldset disabled={busy}>
            {mode === 'login' ? <Field label="Username or email"><input name="identifier" autoComplete="username" value={identifier} onChange={e => setIdentifier(e.target.value)} maxLength={254} placeholder="Enter your username or email" required /></Field> : <Field label="Email address" hint={mode === 'setup' ? 'Use the email address on your invitation.' : undefined}><input name="email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} maxLength={254} placeholder="you@example.org" required /></Field>}
            {mode === 'setup' && <>
              <Field label="Username" hint="3–30 characters. Start with a letter; use letters, numbers, _ or -."><input name="username" autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} pattern="[a-zA-Z][a-zA-Z0-9_-]{2,29}" minLength={3} maxLength={30} placeholder="Choose a username" required /></Field>
              <Field label="Invitation code"><input name="invitation" type="password" autoComplete="off" value={code} onChange={e => setCode(e.target.value)} placeholder="Paste your private invitation code" required /></Field>
            </>}
            {mode !== 'reset' && <>
              <Field label="Password" hint={mode === 'setup' ? 'Use a unique password with at least 12 characters.' : undefined}>
                <div className="admin-password"><input name="password" type={show ? 'text' : 'password'} autoComplete={mode === 'setup' ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} minLength={mode === 'setup' ? 12 : 1} maxLength={128} placeholder={mode === 'setup' ? 'Create a strong password' : 'Enter your password'} required />
                  <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}>{show ? 'Hide' : 'Show'}</button>
                </div>
              </Field>
              {mode === 'setup' && <Field label="Confirm password"><input name="confirmPassword" type={show ? 'text' : 'password'} autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} minLength={12} maxLength={128} placeholder="Enter your password again" required /></Field>}
            </>}
            {mode === 'login' && <div className="admin-form-options"><label className="admin-checkbox"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />Keep me signed in</label><button type="button" className="admin-text-button" onClick={() => changeMode('reset')}>Forgot password?</button></div>}
          </fieldset>
          {error && <p ref={noticeRef} tabIndex={-1} className="admin-notice admin-error" role="alert">{error}</p>}
          {message && <p className="admin-notice admin-success" role="status">{message}</p>}
          <button type="submit" className="admin-primary admin-full" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in to admin portal →' : mode === 'setup' ? 'Create admin account →' : 'Send reset link →'}</button>
        </form>
        {mode === 'reset' ? <button className="admin-text-button admin-return" disabled={busy} onClick={() => changeMode('login')}>← Back to sign in</button> : <p className="admin-access-note"><span aria-hidden="true">◇</span> Invitation-only access. Need an invitation?<br />Contact your museum administrator.</p>}
      </section>
    </div>
    <footer className="admin-footer">Tippecanoe County Historical Association <span>·</span> Official Digital Museum</footer>
  </main>
}

function EventEditor({ record, onDirty }: { record: EditableEvent; onDirty: (dirty: boolean) => void }) {
  const { loading, error: contentError, reload } = useMuseumContent()
  const [draft, setDraft] = useState(record)
  const [baseline, setBaseline] = useState(record)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const dirty = ['title', 'year', 'summary', 'source'].some(key => draft[key as keyof EditableEvent] !== baseline[key as keyof EditableEvent])
  const conflict = record.revision !== baseline.revision
  useEffect(() => { onDirty(dirty) }, [dirty, onDirty])
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault() }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])
  function update(key: 'title' | 'year' | 'summary' | 'source', value: string) {
    setDraft(old => ({ ...old, [key]: value })); setMessage(''); setError('')
  }
  function loadLatest() { setDraft(record); setBaseline(record); setError(''); setMessage('Latest content loaded.'); reload() }
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('')
    try {
      const result = await saveEvent(draft)
      const saved = { ...draft, revision: result.revision }
      setDraft(saved); setBaseline(saved)
      setMessage('Changes published. They are now available in the museum experience.')
    } catch (error) { setError(errorMessage(error)) }
    finally { setBusy(false) }
  }
  return <section className="admin-editor" aria-labelledby="editor-title">
    <div className="admin-editor-heading"><div><span className="admin-eyebrow">EVENT {record.id.toString().padStart(2, '0')}</span><h2 id="editor-title">Edit the story</h2></div><span className="admin-status">{dirty ? 'Unsaved changes' : 'Up to date'}</span></div>
    <p className="admin-subtitle">Keep it clear, welcoming, and grounded in TCHA sources.</p>
    {contentError && <div className="admin-notice admin-error" role="alert">{contentError} <button className="admin-text-button" onClick={reload}>Retry connection</button></div>}
    {conflict && <div className="admin-notice admin-error" role="alert">This event has a newer version. <button className="admin-text-button" onClick={loadLatest}>Discard edits and load latest</button></div>}
    <form onSubmit={save} aria-busy={busy}>
      <fieldset disabled={busy || loading || !!contentError}>
        <Field label="Event title"><input value={draft.title} onChange={e => update('title', e.target.value)} maxLength={120} required /></Field>
        <Field label="Date or year"><input value={draft.year} onChange={e => update('year', e.target.value)} maxLength={80} required /></Field>
        <Field label="Introduction" hint="Aim for a fifth-grade reading level."><textarea value={draft.summary} onChange={e => update('summary', e.target.value)} rows={5} maxLength={2000} required /></Field>
        <Field label="Source credit" hint="Include the TCHA source document and page or section."><input value={draft.source} onChange={e => update('source', e.target.value)} maxLength={500} required /></Field>
      </fieldset>
      {error && <p className="admin-notice admin-error" role="alert">{error}</p>}
      {message && <p className="admin-notice admin-success" role="status">{message}</p>}
      <div className="admin-editor-actions"><button className="admin-primary" type="submit" disabled={!dirty || busy || loading || !!contentError || conflict}>{busy ? 'Publishing…' : 'Publish changes →'}</button><button type="button" className="admin-secondary" disabled={busy || !dirty} onClick={loadLatest}>Discard changes</button></div>
    </form>
    <div className="admin-preview"><span className="admin-eyebrow">VISITOR PREVIEW</span><p className="admin-preview-date">{draft.year}</p><h3>{draft.title}</h3><p>{draft.summary}</p><small>{draft.source}</small></div>
  </section>
}

function Dashboard({ profile }: { profile: Profile }) {
  const { records, loading, error: contentError } = useMuseumContent()
  const [selected, setSelected] = useState(1)
  const [dirty, setDirty] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [invitation, setInvitation] = useState<{ code: string; email: string; expiresAt: number } | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  function canLeave() { return !dirty || window.confirm('Discard your unpublished changes?') }
  async function logout() {
    if (!canLeave()) return
    try { await signOut(auth) } catch (error) { setError(errorMessage(error)) }
  }
  async function invite(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setInvitation(null)
    try { setInvitation(await inviteAdmin(inviteEmail)); setInviteEmail('') }
    catch (error) { setError(errorMessage(error)) }
    finally { setBusy(false) }
  }
  const record = records[selected - 1]
  return <main className="admin-root">
    <header className="admin-topbar"><Brand /><div className="admin-user"><span>{profile.username}</span><button className="admin-secondary" onClick={logout}>Sign out</button></div></header>
    <div className="admin-workspace">
      <div className="admin-workspace-heading"><div><span className="admin-eyebrow">MUSEUM CONTENT</span><h1>Care for the stories.</h1><p>Welcome, {profile.username}. Make history come alive.</p></div><a className="admin-secondary" href="/" onClick={event => { if (!canLeave()) event.preventDefault() }}>View museum ↗</a></div>
      {error && <p className="admin-notice admin-error" role="alert">{error}</p>}
      <div className="admin-dashboard-grid">
        <aside className="admin-sidebar"><h2>The journey</h2><p>10 historical events</p><nav aria-label="Choose an event">{records.map(item => <button key={item.id} aria-current={selected === item.id ? 'page' : undefined} onClick={() => { if (item.id !== selected && canLeave()) { setSelected(item.id); setDirty(false) } }}><span>{String(item.id).padStart(2, '0')}</span><span>{item.title}<small>{item.year}</small></span></button>)}</nav></aside>
        <div>{loading ? <section className="admin-editor" role="status">Loading the latest museum content…</section> : <EventEditor key={selected} record={record} onDirty={setDirty} />}
          <section className="admin-invite"><span className="admin-eyebrow">YOUR MUSEUM TEAM</span><h2>Invite an administrator</h2><p>Invitations grant editing access. Share the one-use code privately with the named recipient; it expires in 48 hours.</p><form onSubmit={invite}><Field label="Administrator’s email"><input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colleague@example.org" maxLength={254} required disabled={busy} /></Field><button className="admin-secondary" disabled={busy || !!contentError}>{busy ? 'Creating invitation…' : 'Create invitation'}</button></form>
            {invitation && <div className="admin-notice admin-success" role="status"><strong>Invitation ready for {invitation.email}</strong><p>Ask them to open {window.location.origin}/admin and choose Set up account.</p><label className="admin-field"><span>Private invitation code</span><input readOnly value={invitation.code} onFocus={e => e.target.select()} /></label><small>Expires {new Date(invitation.expiresAt).toLocaleString()}. No email has been sent.</small><button className="admin-text-button" onClick={() => setInvitation(null)}>Hide invitation</button></div>}
          </section>
        </div>
      </div>
    </div>
  </main>
}
export default function AdminApp() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    document.title = 'Admin portal · TCHA'
    let active = true
    let sequence = 0
    let stopProfile: (() => void) | undefined
    const stopAuth = onIdTokenChanged(auth, async user => {
      const current = ++sequence
      stopProfile?.(); stopProfile = undefined
      if (!user) { if (active) { setProfile(null); setChecking(false) } return }
      setChecking(true)
      try {
        const token = await getIdTokenResult(user)
        if (!active || sequence !== current) return
        if (token.claims.admin !== true) throw new Error('not-admin')
        stopProfile = onSnapshot(doc(db, 'admins', user.uid), snapshot => {
          if (!active || sequence !== current) return
          const data = snapshot.data()
          if (!data?.active) {
            setProfile(null); setError('Administrator access is required. Contact the museum administrator.'); setChecking(false)
            void signOut(auth)
          } else {
            setProfile({ username: data.username, email: data.email }); setChecking(false); setError('')
          }
        }, () => {
          if (!active || sequence !== current) return
          setProfile(null); setChecking(false); setError('Could not verify administrator access. Check your connection and sign in again.')
          void signOut(auth)
        })
      } catch {
        if (!active || sequence !== current) return
        setProfile(null); setChecking(false); setError('This account does not have administrator access.')
        void signOut(auth)
      }
    })
    return () => { active = false; sequence++; stopAuth(); stopProfile?.() }
  }, [])
  if (checking) return <main className="admin-loading" role="status">Checking administrator access…</main>
  return profile ? <Dashboard profile={profile} /> : <AuthPage initialError={error} />
}
