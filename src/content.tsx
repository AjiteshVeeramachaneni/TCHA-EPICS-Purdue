import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { EVENTS, EVENT_INTROS } from './event-data'

export interface EditableEvent {
  id: number; title: string; year: string; summary: string; source: string
  revision: number; updatedAt?: number; updatedBy?: string
}
const sources = ['2013_Battlefield_Book.pdf, p. 1', '2013_Battlefield_Book.pdf, p. 3', '2013_Battlefield_Book.pdf, pp. 3–4', '2013_Battlefield_Book.pdf, pp. 4–5', '2013_Battlefield_Book.pdf, pp. 6–8', '2013_Battlefield_Book.pdf, p. 5', '2013_Battlefield_Book.pdf, pp. 9–10', '2013_Battlefield_Book.pdf, p. 11', 'Battle_Ground_StoryWhigRally_combined.docx, Part I', 'Battle_Ground_StoryWhigRally_combined.docx, Part II']
export const DEFAULT_CONTENT: EditableEvent[] = EVENTS.map((event, i) => ({
  id: event.id, title: event.title, year: event.year, summary: EVENT_INTROS[i].summary,
  source: 'TCHA · ' + sources[i], revision: 0,
}))
const ContentContext = createContext({
  records: DEFAULT_CONTENT, loading: true, error: '', reload: () => {},
})
export function MuseumContentProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState(DEFAULT_CONTENT)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let cancelled = false
    let stop: (() => void) | undefined
    setLoading(true); setError('')
    async function subscribe() {
      try {
        const [{ db }, { collection, onSnapshot }] = await Promise.all([import('./lib/firebase'), import('firebase/firestore')])
        if (cancelled) return
        stop = onSnapshot(collection(db, 'museumEvents'), snapshot => {
          // Ignore malformed records and retain bundled content when nothing has been published.
          const updates = new Map<number, EditableEvent>()
          snapshot.forEach(doc => {
            const data = doc.data()
            if (String(data.id) === doc.id && data.id >= 1 && data.id <= 10 &&
                ['title', 'year', 'summary', 'source'].every(key => typeof data[key] === 'string') &&
                Number.isInteger(data.revision) && data.revision > 0) {
              updates.set(data.id, data as EditableEvent)
            }
          })
          setRecords(DEFAULT_CONTENT.map(item => updates.get(item.id) || item))
          setLoading(false); setError('')
        }, () => {
          setLoading(false)
          setError('Live content is unavailable. Bundled museum content is shown. Check your connection and deployed database rules.')
        })
      } catch {
        if (!cancelled) { setLoading(false); setError('Could not connect to the content service.') }
      }
    }
    void subscribe()
    return () => { cancelled = true; stop?.() }
  }, [attempt])
  return <ContentContext.Provider value={{ records, loading, error, reload: () => setAttempt(a => a + 1) }}>{children}</ContentContext.Provider>
}
export function useMuseumContent() {
  const context = useContext(ContentContext)
  return {
    ...context,
    events: EVENTS.map((event, i) => ({ ...event, title: context.records[i].title, year: context.records[i].year })),
    introductions: EVENT_INTROS.map((intro, i) => ({ ...intro, summary: context.records[i].summary, source: context.records[i].source })),
  }
}
