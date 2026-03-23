import { useState, useRef, useCallback } from 'react'

export default function HomeScreen({ onCreateRoom, onJoinRoom, loading }) {
  const [joinOpen,   setJoinOpen]   = useState(false)
  const [joinValue,  setJoinValue]  = useState('')
  const [joinError,  setJoinError]  = useState('')
  const inputRef = useRef(null)

  const toggleJoin = () => {
    const next = !joinOpen
    setJoinOpen(next)
    setJoinError('')
    if (next) setTimeout(() => inputRef.current?.focus(), 60)
  }

  const handleJoinSubmit = async () => {
    if (!joinValue.trim()) {
      setJoinError('Please enter a room code.')
      inputRef.current?.focus()
      return
    }
    const result = await onJoinRoom(joinValue)
    if (!result.success) {
      setJoinError(result.error)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleJoinSubmit()
  }

  const handleInput = (e) => {
    setJoinValue(e.target.value)
    if (joinError) setJoinError('')
  }

  return (
    <div className="flex flex-col items-center gap-12 relative z-10">
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: '50%', left: '50%',
          width: 520, height: 520,
          background: 'radial-gradient(ellipse, rgba(138,76,252,0.22) 0%, transparent 68%)',
          pointerEvents: 'none', zIndex: -1,
          animation: 'breathe-home 5s ease-in-out infinite',
        }}
      />

      {/* Live arena badge */}
      <div
        className="flex items-center gap-2 rounded-full px-4 py-1.5"
        style={{ background: 'rgba(189,157,255,0.08)', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--primary)' }}
        aria-label="Live arena"
      >
        <span
          style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block', animation: 'pulse-dot 1.5s ease infinite' }}
        />
        Live Arena
      </div>

      {/* Wordmark + tagline */}
      <div className="flex flex-col items-center gap-2 text-center" style={{ marginTop: '-1rem' }}>
        <h1
          style={{
            fontFamily: 'var(--font-hed)', fontSize: 'clamp(2.8rem, 7vw, 5rem)', fontWeight: 800,
            letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1,
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            userSelect: 'none',
          }}
        >
          De<span style={{ WebkitTextFillColor: 'var(--tertiary)' }}>battle</span>
        </h1>
        <p style={{ fontFamily: 'var(--font-hed)', fontSize: 'clamp(0.85rem, 2vw, 1.05rem)', fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginTop: '-0.6rem' }}>
          The Debate Arena
        </p>
      </div>

      {/* Buttons + join panel */}
      <div className="flex flex-col items-center gap-3" style={{ width: 'min(380px, 100%)' }}>
        <button
          className="btn-primary"
          onClick={onCreateRoom}
          disabled={loading}
          aria-label="Create a new debate room"
        >
          {/* Sword icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="m13 19 6-6"/><path d="m2 2 20 20"/><path d="M20 17v4h-4"/>
          </svg>
          Create Room
        </button>

        <button
          className="btn-ghost"
          onClick={toggleJoin}
          disabled={loading}
          aria-label="Join an existing room"
          aria-expanded={joinOpen}
          aria-controls="join-panel"
        >
          {/* Enter icon */}
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          Join Room
        </button>

        {/* Slide-down join panel */}
        <div
          id="join-panel"
          aria-hidden={!joinOpen}
          style={{
            width: '100%', overflow: 'hidden',
            maxHeight: joinOpen ? 180 : 0,
            opacity: joinOpen ? 1 : 0,
            transition: 'max-height 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.28s ease',
          }}
        >
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex gap-2 items-stretch">
              <input
                ref={inputRef}
                id="join-input"
                className={`join-input${joinError ? ' error' : ''}`}
                type="text"
                maxLength={10}
                placeholder="Enter room code"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                aria-label="Room code"
                value={joinValue}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
              />
              <button
                className="btn-join"
                onClick={handleJoinSubmit}
                disabled={loading}
              >
                Join
              </button>
            </div>
            <p
              role="alert"
              aria-live="assertive"
              style={{
                fontSize: '0.8rem', fontWeight: 600, color: 'var(--error)',
                letterSpacing: '0.02em', minHeight: '1.1rem',
                opacity: joinError ? 1 : 0, transition: 'opacity 0.2s ease',
              }}
            >
              {joinError}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
