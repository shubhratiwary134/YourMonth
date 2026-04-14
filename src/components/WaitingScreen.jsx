import { useRef, useState, useCallback } from 'react'

export default function WaitingScreen({ roomCode, onCancel }) {
  const [toastVisible, setToastVisible] = useState(false)
  const toastTimer = useRef(null)

  const handleCopy = useCallback(async () => {
    if (!roomCode) return
    try {
      await navigator.clipboard.writeText(roomCode)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = roomCode
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setToastVisible(true)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastVisible(false), 1800)
  }, [roomCode])

  return (
    <div className="relative flex items-center justify-center w-full z-10" style={{ minHeight: '100vh' }}>
      <div aria-hidden="true" style={{ position: 'absolute', top: '50%', left: '50%', width: 450, height: 400, background: 'radial-gradient(ellipse, rgba(138,76,252,0.16) 0%, transparent 70%)', pointerEvents: 'none', zIndex: -1, animation: 'breathe 4s ease-in-out infinite' }} />
      <div className="glass-card" role="status" aria-live="polite">
        <p className="card-eyebrow">Your Room Code</p>
        <div className="flex items-center gap-4" style={{ marginBottom: '2rem' }}>
          <span className="room-code" aria-label={`Room code: ${roomCode}`}>{roomCode}</span>
          <button className="btn-icon" onClick={handleCopy} aria-label="Copy room code to clipboard">
            <div className={`copy-toast${toastVisible ? ' show' : ''}`}>Copied!</div>
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
        </div>
        <div className="divider" />
        <div className="flex flex-col items-center gap-4" style={{ marginBottom: '2rem' }}>
          <div className="flex items-center gap-2" aria-hidden="true">
            <span className="dot" /><span className="dot" /><span className="dot" />
          </div>
          <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--on-surface-variant)', letterSpacing: '0.02em', textAlign: 'center' }}>
            Waiting for opponent to join…
          </p>
        </div>
        <button className="cancel-link" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
