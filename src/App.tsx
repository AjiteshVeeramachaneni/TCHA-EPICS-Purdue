import { useState } from 'react'
import { EVENTS, EventDisplay, C } from './events'
import { ChatbotPrototype } from './ChatbotPrototype'
import './lib/firebase'

/* ─── PERSISTENCE ─── */
function loadProgress(): { current: number; unlocked: number } {
  try { const s = localStorage.getItem('tcha-v3'); if (s) return JSON.parse(s) } catch { /**/ }
  return { current: 1, unlocked: 1 }
}
function saveProgress(current: number, unlocked: number) {
  localStorage.setItem('tcha-v3', JSON.stringify({ current, unlocked }))
}

/* ─── MEDAL SVG ─── */
function MedalSVG() {
  const ringDots = Array.from({ length: 36 }, (_, i) => {
    const a = (i * 10) * Math.PI / 180
    return { cx: Math.cos(a) * 84, cy: Math.sin(a) * 84 }
  })
  const pentaDots = [0, 72, 144, 216, 288].map(a => {
    const r = a * Math.PI / 180
    return { x: Math.cos(r) * 48, y: Math.sin(r) * 48 }
  })
  return (
    <svg width="200" height="200" viewBox="-100 -100 200 200" style={{ filter: 'drop-shadow(0 0 30px rgba(196,146,58,0.3))' }}>
      <circle r="90" fill="none" stroke={C.gold} strokeWidth="0.4" opacity="0.2" />
      <circle r="84" fill="none" stroke={C.gold} strokeWidth="1" opacity="0.6" />
      {ringDots.map((d, i) => <circle key={i} cx={d.cx} cy={d.cy} r={i % 3 === 0 ? 2 : 1} fill={C.gold} opacity={i % 3 === 0 ? 0.7 : 0.3} />)}
      <circle r="68" fill="rgba(196,146,58,0.04)" stroke={C.gold} strokeWidth="0.5" opacity="0.5" />
      <circle r="60" fill="rgba(196,146,58,0.06)" stroke="none" />
      {pentaDots.map((d, i) => <text key={i} x={d.x} y={d.y + 4} textAnchor="middle" fontSize="10" fill={C.gold} opacity="0.6">★</text>)}
      <text y="-10" textAnchor="middle" fontFamily="Lora,Georgia,serif" fontSize="30" fontWeight="700" fill={C.gold} letterSpacing="1">1811</text>
      <text y="10" textAnchor="middle" fontFamily="Source Sans 3,sans-serif" fontSize="8" fontWeight="600" fill={C.goldL} letterSpacing="4" opacity="0.9">TIPPECANOE</text>
      <text y="26" textAnchor="middle" fontFamily="Source Sans 3,sans-serif" fontSize="6.5" fill={C.goldL} letterSpacing="3" opacity="0.55">BATTLE GROUND</text>
      <line x1="-28" y1="-22" x2="28" y2="-22" stroke={C.gold} strokeWidth="0.5" opacity="0.4" />
      <line x1="-28" y1="34" x2="28" y2="34" stroke={C.gold} strokeWidth="0.5" opacity="0.4" />
    </svg>
  )
}

/* ─── STAR FIELD ─── */
const STARS = Array.from({ length: 80 }, (_, i) => ({
  x: (i * 137.508) % 100,
  y: (i * 53.291 + i * i * 0.07) % 100,
  r: [1, 1, 1, 1.5, 1.5, 2, 2.5][i % 7],
  op: 0.15 + (i % 9) * 0.07,
  dur: 2.5 + (i % 7) * 0.5,
  delay: (i % 13) * 0.28,
}))

/* ─── HOME SCREEN ─── */
function HomeScreen({ hasProgress, currentEvent, onBegin, onContinue }: {
  hasProgress: boolean
  currentEvent: number
  onBegin: () => void
  onContinue: () => void
}) {
  const doneCount = Math.max(0, currentEvent - 1)

  return (
    <div className="daylight-screen" style={{ minHeight: '100vh', overflowX: 'hidden' }}>

      {/* Star field */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {STARS.map((s, i) => (
          <div key={i} className="absolute rounded-full"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.r, height: s.r, background: 'white', opacity: s.op,
              animationName: 'star-twinkle', animationDuration: `${s.dur}s`, animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite', animationDelay: `${s.delay}s` }} />
        ))}
      </div>

      {/* Top badge */}
      <div className="relative flex justify-center pt-8" style={{ zIndex: 1 }}>
        <div className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest"
          style={{ background: 'rgba(196,146,58,0.1)', border: '1px solid rgba(196,146,58,0.25)', color: C.goldL }}>
          Tippecanoe County Historical Association · Official Digital Museum
        </div>
      </div>

      {/* Hero */}
      <div className="relative text-center px-6 pt-10 pb-12" style={{ zIndex: 1 }}>
        {/* Medal */}
        <div className="flex justify-center mb-6">
          <MedalSVG />
        </div>

        {/* Title */}
        <p className="text-xs font-bold uppercase tracking-[0.35em] mb-4" style={{ color: C.gold, opacity: 0.85 }}>
          An Interactive History
        </p>
        <h1 className="font-serif font-bold leading-none mb-2" style={{ fontSize: 'clamp(2.8rem,9vw,5.5rem)', color: C.ink }}>
          The Battle of
        </h1>
        <h1 className="font-serif font-bold leading-none mb-6" style={{ fontSize: 'clamp(2.8rem,9vw,5.5rem)', color: C.gold, textShadow: `0 0 60px ${C.gold}44` }}>
          Tippecanoe
        </h1>
        <p className="text-base max-w-md mx-auto leading-relaxed mb-2" style={{ color: C.ink, opacity: 0.78 }}>
          Explore 10 key events through games, puzzles, and activities.
        </p>
        <p className="text-sm mb-10" style={{ color: C.ink, opacity: 0.55 }}>
          Easy to read · Based on TCHA sources
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {hasProgress ? (
            <>
              <button onClick={onContinue}
                className="px-9 py-4 rounded-2xl font-bold text-lg transition-all duration-200"
                style={{ background: C.gold, color: C.parch, boxShadow: `0 0 50px ${C.gold}40, 0 4px 20px rgba(0,0,0,0.4)` }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = '' }}>
                Continue → Event {currentEvent}
              </button>
              <button onClick={onBegin}
                className="px-7 py-4 rounded-2xl font-semibold text-base transition-all"
                style={{ background: C.surface, color: C.ink, border: '1px solid rgba(31,46,61,0.18)' }}>
                Start Over
              </button>
            </>
          ) : (
            <button onClick={onBegin}
              className="px-12 py-4 rounded-2xl font-bold text-xl transition-all duration-200"
              style={{ background: C.gold, color: C.parch, boxShadow: `0 0 60px ${C.gold}44, 0 4px 24px rgba(0,0,0,0.5)` }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = '' }}>
              Begin Your Journey →
            </button>
          )}
        </div>
      </div>

      {/* Stats strip */}
      <div className="relative flex flex-wrap items-center justify-center gap-8 py-7 px-6" style={{ zIndex: 1, borderTop: '1px solid rgba(31,46,61,0.07)', borderBottom: '1px solid rgba(31,46,61,0.07)', background: 'rgba(31,46,61,0.02)' }}>
        {[
          { n: '10', label: 'Historical Events' },
          { n: '40+', label: 'Interactive Activities' },
          { n: '34', label: 'Years of History' },
          { n: '1,000', label: 'Soldiers in the Battle' },
        ].map(s => (
          <div key={s.n} className="text-center">
            <div className="font-serif font-bold text-3xl" style={{ color: C.gold }}>{s.n}</div>
            <div className="text-xs mt-0.5" style={{ color: C.ink, opacity: 0.62 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar if returning user */}
      {hasProgress && (
        <div className="relative px-6 py-5 text-center" style={{ zIndex: 1, background: 'rgba(47,75,60,0.08)' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.forestL }}>Your Progress</p>
          <div className="max-w-sm mx-auto">
            <div className="h-2 rounded-full mb-2" style={{ background: 'rgba(31,46,61,0.08)' }}>
              <div className="h-2 rounded-full transition-all" style={{ width: `${(doneCount / 10) * 100}%`, background: `linear-gradient(90deg, ${C.forest}, ${C.gold})` }} />
            </div>
            <p className="text-xs" style={{ color: C.ink, opacity: 0.62 }}>{doneCount} of 10 events completed</p>
          </div>
        </div>
      )}

      {/* Event journey preview */}
      <div className="relative px-6 py-12" style={{ zIndex: 1 }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-8 text-center" style={{ color: C.goldL }}>The Journey Ahead</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-4xl mx-auto">
          {EVENTS.map(e => {
            const isDone = hasProgress && currentEvent > e.id
            const isCurrent = hasProgress && currentEvent === e.id
            return (
              <div key={e.id} className="rounded-2xl p-4 text-center transition-all duration-200"
                style={{
                  background: isDone ? 'rgba(47,75,60,0.25)' : isCurrent ? `${e.accent}18` : 'rgba(31,46,61,0.03)',
                  border: `1px solid ${isDone ? C.forest : isCurrent ? e.accent : 'rgba(31,46,61,0.07)'}`,
                }}>
                <div className="text-3xl mb-2">{isDone ? '✅' : e.icon}</div>
                <p className="text-xs font-bold mb-1" style={{ color: isDone ? C.forestL : isCurrent ? e.accent : `${e.accent}99`, opacity: isDone ? 1 : 0.9 }}>
                  Event {e.id}
                </p>
                <p className="text-xs font-semibold leading-tight" style={{ color: C.ink, opacity: isDone ? 0.9 : isCurrent ? 1 : 0.65 }}>
                  {e.title}
                </p>
                <p className="text-xs mt-1" style={{ color: C.ink, opacity: 0.48 }}>{e.year}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* What you'll do */}
      <div className="relative px-6 pb-12 max-w-3xl mx-auto" style={{ zIndex: 1 }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-6 text-center" style={{ color: C.goldL }}>What You'll Do</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: '🌑', label: 'Simulate a solar eclipse', desc: 'Drag the moon to prove a prophecy' },
            { icon: '🗺️', label: 'Follow the army\'s march', desc: 'Click waypoints in the right order' },
            { icon: '❓', label: 'Identify mystery people', desc: 'Use clues to name historical figures' },
            { icon: '✍️', label: 'Fill in the story', desc: 'Complete the tale with the right words' },
            { icon: '🔎', label: 'Spot the differences', desc: 'Compare two very different accounts' },
            { icon: '🏛️', label: 'Examine real artifacts', desc: 'Tap hotspots on a 200-year-old flag' },
          ].map(a => (
            <div key={a.label} className="flex items-center gap-3 rounded-xl p-3" style={{ background: 'rgba(31,46,61,0.04)', border: '1px solid rgba(31,46,61,0.07)' }}>
              <span className="text-2xl">{a.icon}</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: C.ink }}>{a.label}</p>
                <p className="text-xs" style={{ color: C.ink, opacity: 0.62 }}>{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="relative text-center py-8 px-6" style={{ zIndex: 1, borderTop: '1px solid rgba(31,46,61,0.06)', background: C.navy }}>
        <p className="font-serif font-bold text-base mb-1" style={{ color: C.parch, opacity: 0.9 }}>Tippecanoe County Historical Association</p>
        <p className="text-xs mb-1" style={{ color: C.parch, opacity: 0.65 }}>tippecanoehistory.org · TCHA sources</p>
        <p className="text-xs" style={{ color: C.parch, opacity: 0.5 }}><em>Battle of Tippecanoe</em> · <em>The Great Whig Rally</em></p>
      </div>
    </div>
  )
}

/* ─── NAV DOT ─── */
function NavDot({ event, state, onClick }: {
  event: typeof EVENTS[0]
  state: 'locked' | 'available' | 'current' | 'done'
  onClick: () => void
}) {
  const locked = state === 'locked'
  return (
    <button onClick={locked ? undefined : onClick} disabled={locked}
      className="flex flex-col items-center gap-1 transition-all duration-200"
      style={{ cursor: locked ? 'default' : 'pointer', opacity: locked ? 0.28 : 1 }}
      title={`${event.id}. ${event.title}`}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
        style={{
          background: state === 'done' ? C.forest : state === 'current' ? event.accent : C.navyL,
          border: `2px solid ${state === 'done' ? C.forestL : state === 'current' ? event.accent : 'rgba(31,46,61,0.14)'}`,
          boxShadow: state === 'current' ? `0 0 14px ${event.accent}70` : 'none',
          color: C.parch,
        }}>
        {state === 'done' ? '✓' : locked ? '🔒' : event.id}
      </div>
      <span className="text-xs hidden lg:block" style={{
        color: state === 'current' ? event.accent : state === 'done' ? C.forestL : 'rgba(31,46,61,0.3)',
        maxWidth: 58, textAlign: 'center', lineHeight: 1.3, fontSize: 10,
        overflow: 'hidden', display: '-webkit-box',
        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
      }}>
        {event.title}
      </span>
    </button>
  )
}

/* ─── COMPLETION SCREEN ─── */
function CompletionScreen({ onRestart, onViewEvent }: { onRestart: () => void; onViewEvent: (eventId: number) => void }) {
  return (
    <div className="daylight-screen flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-10 rounded-full px-4 py-2 text-xs font-bold tracking-widest uppercase" style={{ background: C.parch, color: C.brick }}>
        Chatbot – TEST PROTOTYPE
      </div>
      <div className="mb-4"><MedalSVG /></div>
      <p className="font-serif font-bold text-4xl mb-3" style={{ color: C.gold }}>Journey Complete!</p>
      <p className="text-base mb-2" style={{ color: C.ink }}>You explored all 10 events.</p>
      <p className="text-sm max-w-sm mb-8 leading-relaxed" style={{ color: C.ink, opacity: 0.7 }}>
        You explored 34 years of Indiana history.
      </p>
      <div className="rounded-2xl p-5 max-w-xs w-full mb-6" style={{ background: 'rgba(31,46,61,0.04)', border: '1px solid rgba(31,46,61,0.1)' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.goldL }}>Events Completed</p>
        <div className="grid grid-cols-2 gap-1.5">
          {EVENTS.map(e => (
            <div key={e.id} className="flex items-center gap-1.5 text-xs" style={{ color: C.ink }}>
              <span style={{ color: C.forestL }}>✓</span><span>{e.icon} {e.title.split(' ').slice(0, 3).join(' ')}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs mb-6" style={{ color: C.ink, opacity: 0.55 }}>
        Tippecanoe County Historical Association · <span style={{ color: C.goldL }}>tippecanoehistory.org</span>
      </p>
      <button onClick={onRestart} className="px-8 py-3 rounded-xl font-bold" style={{ background: C.steel, color: C.parch }}>
        Return to Home
      </button>
      <ChatbotPrototype onViewEvent={onViewEvent} />
    </div>
  )
}

/* ─── APP ─── */
export default function App() {
  const [screen, setScreen] = useState<'home' | 'events' | 'complete'>('home')
  const [{ current, unlocked }, setProgress] = useState(loadProgress)

  const hasProgress = unlocked > 1 || current > 1

  const handleBegin = () => {
    localStorage.removeItem('tcha-v3')
    setProgress({ current: 1, unlocked: 1 })
    setScreen('events')
    window.scrollTo({ top: 0 })
  }

  const handleContinue = () => {
    setScreen('events')
    window.scrollTo({ top: 0 })
  }

  const handleEventComplete = () => {
    if (current === 10) {
      setScreen('complete')
      saveProgress(10, 10)
    } else {
      const next = current + 1
      const newUnlocked = Math.max(unlocked, next)
      setProgress({ current: next, unlocked: newUnlocked })
      saveProgress(next, newUnlocked)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goTo = (id: number) => {
    if (id <= unlocked) {
      setProgress(p => ({ ...p, current: id }))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleRestart = () => {
    localStorage.removeItem('tcha-v3')
    setProgress({ current: 1, unlocked: 1 })
    setScreen('home')
    window.scrollTo({ top: 0 })
  }

  const handleViewEvent = (id: number) => {
    setProgress(p => ({ ...p, current: id }))
    setScreen('events')
    window.scrollTo({ top: 0 })
  }

  if (screen === 'home') {
    return (
      <>
        <HomeScreen hasProgress={hasProgress} currentEvent={current} onBegin={handleBegin} onContinue={handleContinue} />
        <ChatbotPrototype onViewEvent={handleViewEvent} />
      </>
    )
  }
  if (screen === 'complete') {
    return <CompletionScreen onRestart={handleRestart} onViewEvent={handleViewEvent} />
  }

  const currentMeta = EVENTS[current - 1]
  const doneCount = unlocked - 1

  return (
    <div className="event-daylight-screen" style={{ minHeight: '100vh', fontFamily: "'Source Sans 3', system-ui, sans-serif" }}>
      {/* Top nav */}
      <nav className="sticky top-0 z-40" style={{ background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(31,46,61,0.12)' }}>
        {/* Brand row */}
        <div className="flex items-center justify-between px-5 py-2.5" style={{ borderBottom: '1px solid rgba(31,46,61,0.05)' }}>
          <button onClick={() => setScreen('home')} className="flex items-center gap-2.5 transition-opacity" style={{ opacity: 0.9 }}>
            <span className="text-lg">⚔️</span>
            <div className="text-left">
              <p className="font-serif font-bold text-sm leading-none" style={{ color: C.ink }}>Battle of Tippecanoe</p>
              <p className="text-xs mt-0.5" style={{ color: C.ink, opacity: 0.55 }}>← Home</p>
            </div>
          </button>
          <div className="flex items-center gap-2">
            {doneCount > 0 && (
              <div className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: `${C.forest}33`, border: `1px solid ${C.forest}44`, color: C.forestL }}>
                ⭐ {doneCount}/10
              </div>
            )}
          </div>
        </div>

        {/* Event dots */}
        <div className="overflow-x-auto px-5 py-3" style={{ scrollbarWidth: 'none' }}>
          <div className="flex items-start justify-between gap-1" style={{ minWidth: 480 }}>
            {EVENTS.map(e => {
              const state = e.id === current ? 'current' : e.id < unlocked ? 'done' : e.id <= unlocked ? 'available' : 'locked'
              return <NavDot key={e.id} event={e} state={state} onClick={() => goTo(e.id)} />
            })}
          </div>
        </div>

        {/* Current label */}
        <div className="px-5 pb-2.5 flex items-center gap-2">
          <div className="h-1 w-5 rounded-full" style={{ background: currentMeta.accent }} />
          <p className="text-xs font-semibold" style={{ color: currentMeta.accent }}>
            Event {current} · {currentMeta.title}
          </p>
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${currentMeta.accent}33, transparent)` }} />
          <p className="text-xs" style={{ color: C.ink, opacity: 0.55 }}>{currentMeta.year}</p>
        </div>
      </nav>

      <main>
        <EventDisplay key={current} eventId={current} onComplete={handleEventComplete} />
      </main>
      <ChatbotPrototype onViewEvent={handleViewEvent} />
    </div>
  )
}
