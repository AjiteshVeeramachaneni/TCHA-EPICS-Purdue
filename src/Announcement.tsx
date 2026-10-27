import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from './lib/firebase'

export default function Announcement() {
  const [message, setMessage] = useState('')
  useEffect(() => onSnapshot(doc(db, 'settings', 'announcement'),
    snapshot => setMessage(snapshot.data()?.message || ''),
    () => setMessage(''),
  ), [])
  if (!message) return null
  return <aside aria-label="Museum announcement" style={{
    padding: '12px 20px', background: '#f3ecdd', color: '#2b2a28',
    textAlign: 'center', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere',
  }}>{message}</aside>
}
