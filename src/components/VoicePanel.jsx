import { useEffect, useRef } from 'react'

export default function VoicePanel({ myRole, playerSide, isMyTurn, transcript, isListening, error, roundNumber, status, isSaved }) {
  const isP1 = playerSide === 'player1'
  const transcriptEndRef = useRef(null)

  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [transcript])

  const isOpponentSpeaking = !isMyTurn && status === 'debate'

  let buttonState = 'inactive'
  if (isMyTurn && status === 'debate') buttonState = 'active'
  else if (isOpponentSpeaking) buttonState = 'opponent-speaking'

  return (
    <div className="w-full flex flex-col items-center gap-4 mt-6">

      {/* 1. ROUND LABEL */}
      {status === 'debate' && (
        <div style={{
          backgroundColor: isP1 ? 'var(--secondary)' : 'var(--tertiary)',
          color: '#fff',
          padding: '4px 12px',
          borderRadius: '999px',
          fontFamily: 'var(--font-hed)',
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          fontWeight: 700
        }}>
          {roundNumber === 3 ? 'Live Debate' : 'Opening Argument'}
        </div>
      )}

      {/* 2. MIC BUTTON */}
      <div className="relative flex flex-col items-center">
        {buttonState === 'active' && (
          <>
            <style>{`
              @keyframes sonar {
                0% { transform: scale(1); opacity: 0.6; }
                100% { transform: scale(2.2); opacity: 0; }
              }
            `}</style>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--primary)', opacity: 0.3, animation: 'sonar 1.5s ease infinite' }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--primary)', opacity: 0.3, animation: 'sonar 1.5s ease 0.5s infinite' }} />
          </>
        )}

        <button style={{
          position: 'relative', zIndex: 10,
          width: '80px', height: '80px', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.3s ease',
          ...(buttonState === 'active' ? {
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%)',
            border: 'none', color: '#fff', cursor: 'pointer'
          } : buttonState === 'opponent-speaking' ? {
            background: 'var(--surface-container)',
            border: '2px solid var(--outline-variant)', color: 'var(--outline-variant)', cursor: 'not-allowed'
          } : {
            background: 'var(--surface-high)',
            border: '2px solid var(--outline-variant)', color: 'var(--outline)', cursor: 'not-allowed'
          })
        }}>
          {buttonState === 'opponent-speaking' ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          )}
        </button>

        {buttonState === 'opponent-speaking' && (
          <div style={{ marginTop: '6px', fontSize: '0.75rem', color: 'var(--outline-variant)', fontWeight: 600 }}>Mic Off</div>
        )}
      </div>

      {/* 3. STATUS TEXT */}
      <div style={{ height: '24px', display: 'flex', alignItems: 'center' }}>
        {status === 'debate' ? (
          isMyTurn ? (
            <span style={{ color: 'var(--error)', fontWeight: 700, fontSize: '0.85rem' }}>
              {isListening ? '🔴 Recording...' : '⏳ Starting mic...'}
            </span>
          ) : (
            <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.82rem' }}>Listening to opponent...</span>
          )
        ) : (
          <span style={{ color: 'var(--outline)', fontSize: '0.82rem' }}>Stand by...</span>
        )}
      </div>

      {/* 4. ERROR STATE */}
      {error && (
        <div style={{
          background: 'rgba(255,110,132,0.10)',
          border: '1px solid var(--error)',
          borderRadius: '8px',
          padding: '0.5rem 0.8rem',
          fontSize: '0.78rem',
          color: 'var(--error)',
          width: '100%',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {/* 5. TRANSCRIPT BOX */}
      <div style={{
        width: '100%',
        position: 'relative',
        minHeight: '100px',
        maxHeight: '160px',
        background: isSaved ? 'var(--surface-container)' : 'var(--surface-container)',
        border: `1px solid ${isSaved ? 'var(--outline-variant)' : isListening ? 'var(--primary)' : 'var(--outline-variant)'}`,
        borderRadius: '12px',
        padding: isSaved ? '1.4rem 1rem 0.9rem 1rem' : '0.9rem 1rem',
        overflowY: 'auto',
        fontFamily: 'var(--font-body)',
        fontSize: '0.88rem',
        color: 'var(--on-surface)',
        lineHeight: 1.6,
        textAlign: 'left',
        transition: 'border-color 0.3s ease'
      }}>
        {isSaved && (
          <div style={{
            position: 'absolute',
            top: '6px',
            right: '12px',
            fontSize: '0.7rem',
            color: 'var(--success)',
            letterSpacing: '0.1em',
            fontWeight: 700,
            textTransform: 'uppercase'
          }}>
            Saved ✓
          </div>
        )}
        {!transcript ? (
          <span style={{ color: 'var(--outline)' }}>
            {isMyTurn ? 'Start speaking — your words appear here...' : "Opponent's words will appear here..."}
          </span>
        ) : (
          <>
            {transcript}
            {isListening && !isSaved && (
              <span style={{ display: 'inline-block', marginLeft: '2px', animation: 'blink 1s step-end infinite' }}>▌</span>
            )}
          </>
        )}
        <div ref={transcriptEndRef} />
      </div>

      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  )
}
