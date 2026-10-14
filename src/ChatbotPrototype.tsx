import { FormEvent, useEffect, useRef, useState } from 'react'

type ChatState = 'empty' | 'loading' | 'answer' | 'redirect' | 'error'

const STARTER_QUESTIONS = [
  "Why wasn't Harrison on his white horse?",
  'What happened at the Vincennes meeting?',
  'What was the Great Whig Rally?',
]

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 12L20 4l-6 16-2.5-6.5L4 12Z" strokeLinejoin="round" />
      <path d="M11.5 13.5 20 4" strokeLinecap="round" />
    </svg>
  )
}

function ArchiveIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h16v13H4zM3 4h18v3H3zM9 11h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ChatbotPrototype({ onViewEvent }: { onViewEvent: (eventId: number) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [chatState, setChatState] = useState<ChatState>('empty')
  const [question, setQuestion] = useState('')
  const [input, setInput] = useState('')
  const launcherRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const timerRef = useRef<number | null>(null)

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => () => clearTimer(), [])

  useEffect(() => {
    if (!isOpen) return
    closeRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        clearTimer()
        setIsOpen(false)
        window.setTimeout(() => launcherRef.current?.focus(), 0)
        return
      }

      if (event.key !== 'Tab') return
      const panel = document.querySelector<HTMLElement>('[data-chat-panel]')
      const focusable = panel?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const openPanel = () => {
    setQuestion('')
    setInput('')
    setChatState('empty')
    setIsOpen(true)
  }

  const closePanel = () => {
    clearTimer()
    setIsOpen(false)
    window.setTimeout(() => launcherRef.current?.focus(), 0)
  }

  const askQuestion = (nextQuestion: string) => {
    if (!nextQuestion.trim()) return
    clearTimer()
    const cleanQuestion = nextQuestion.trim()
    setQuestion(cleanQuestion)
    setInput('')
    setChatState('loading')

    timerRef.current = window.setTimeout(() => {
      const normalized = cleanQuestion.toLowerCase()
      if (normalized.includes('breakfast')) {
        setChatState('redirect')
      } else if (normalized.includes('test error')) {
        setChatState('error')
      } else {
        setChatState('answer')
      }
      timerRef.current = null
    }, 1000)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    askQuestion(input)
  }

  const retry = () => {
    if (question) askQuestion(question.replace(/test error/gi, '').trim() || "Why wasn't Harrison on his white horse?")
  }

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        onClick={openPanel}
        className={`chat-launcher ${isOpen ? 'chat-launcher-hidden' : ''}`}
        aria-haspopup="dialog"
      >
        <ArchiveIcon />
        <span>Ask the Archive</span>
      </button>

      {isOpen && (
        <>
          <div className="chat-mobile-backdrop" aria-hidden="true" onClick={closePanel} />
          <aside
            data-chat-panel
            role="dialog"
            aria-modal="true"
            aria-labelledby="archive-chat-title"
            aria-describedby="archive-chat-note"
            className="chat-panel"
          >
            <header className="chat-header">
              <div>
                <p className="chat-eyebrow">Chatbot – TEST PROTOTYPE</p>
                <h2 id="archive-chat-title" className="chat-title">Ask the Archive</h2>
              </div>
              <button ref={closeRef} type="button" onClick={closePanel} className="chat-icon-button" aria-label="Close Ask the Archive">
                <CloseIcon />
              </button>
            </header>

            <p id="archive-chat-note" className="chat-source-note">
              Answers come only from TCHA&apos;s Battlefield Book and Whig Rally article.
            </p>

            <div className="chat-messages" aria-live="polite" aria-atomic="false">
              <div className="chat-welcome">
                <span className="chat-avatar" aria-hidden="true"><ArchiveIcon /></span>
                <div>
                  <p className="chat-welcome-title">What would you like to know?</p>
                  <p className="chat-welcome-copy">Ask a question about the history in this museum.</p>
                </div>
              </div>

              {chatState === 'empty' && (
                <div className="chat-starters" aria-label="Starter questions">
                  {STARTER_QUESTIONS.map((starter) => (
                    <button key={starter} type="button" className="chat-chip" onClick={() => askQuestion(starter)}>
                      {starter}
                    </button>
                  ))}
                </div>
              )}

              {question && (
                <div className="chat-user-row">
                  <div className="chat-user-bubble">{question}</div>
                </div>
              )}

              {chatState === 'loading' && (
                <div className="chat-bot-row" aria-label="Ask the Archive is typing">
                  <div className="chat-bot-bubble chat-typing">
                    <span /><span /><span />
                  </div>
                </div>
              )}

              {chatState === 'answer' && (
                <div className="chat-bot-row">
                  <div>
                    <div className="chat-bot-bubble">
                      Harrison usually rode a white horse. On the night of the battle, he was not riding it. Warriors sent to find him attacked someone else instead.
                    </div>
                    <button type="button" className="chat-citation" aria-label="Source: Battlefield Book, pages 6 to 8">
                      Battlefield Book, pp. 6–8
                    </button>
                    <button type="button" className="chat-learn-link" onClick={() => onViewEvent(5)}>
                      Learn more in Shabonee&apos;s Raid
                    </button>
                  </div>
                </div>
              )}

              {chatState === 'redirect' && (
                <div className="chat-bot-row">
                  <div>
                    <div className="chat-bot-bubble">
                      Our museum&apos;s sources don&apos;t cover that. Want to learn about Tecumseh&apos;s meeting with Harrison at Vincennes instead?
                    </div>
                    <button type="button" className="chat-suggestion" onClick={() => onViewEvent(2)}>
                      Visit the Vincennes meeting event
                    </button>
                  </div>
                </div>
              )}

              {chatState === 'error' && (
                <div className="chat-bot-row">
                  <div className="chat-error-card" role="alert">
                    <p>Something went wrong. Please try again.</p>
                    <button type="button" className="chat-retry" onClick={retry}>Retry</button>
                  </div>
                </div>
              )}
            </div>

            <form className="chat-composer" onSubmit={handleSubmit}>
              <label htmlFor="archive-question" className="sr-only">Ask a question about this event</label>
              <input
                id="archive-question"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask a history question..."
                className="chat-input"
                disabled={chatState === 'loading'}
              />
              <button
                type="submit"
                className="chat-send"
                aria-label="Send question"
                disabled={!input.trim() || chatState === 'loading'}
              >
                <SendIcon />
              </button>
            </form>
          </aside>
        </>
      )}
    </>
  )
}
