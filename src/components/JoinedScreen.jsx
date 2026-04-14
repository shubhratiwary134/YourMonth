export default function JoinedScreen({ roomCode }) {
  return (
    <div className="relative flex items-center justify-center w-full z-10" style={{ minHeight: '100vh' }}>
      <div aria-hidden="true" style={{ position: 'absolute', top: '50%', left: '50%', width: 480, height: 420, background: 'radial-gradient(ellipse, rgba(105,156,255,0.20) 0%, transparent 70%)', pointerEvents: 'none', zIndex: -1, animation: 'breathe 4s ease-in-out infinite' }} />
      <div className="joined-card" role="status" aria-live="polite">
        <div className="check-ring">
          <span style={{ fontSize: '1.8rem', lineHeight: 1, filter: 'drop-shadow(0 0 8px rgba(105,156,255,0.7))' }}>⚔️</span>
        </div>
        <p style={{ fontFamily: 'var(--font-hed)', fontSize: '1.05rem', fontWeight: 700, letterSpacing: '0.05em', textAlign: 'center', color: 'var(--on-surface)', marginBottom: '0.4rem' }}>
          You joined room <span style={{ background: 'linear-gradient(135deg, var(--secondary) 0%, #4479e8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{roomCode}</span>!
        </p>
        <p style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--on-surface-variant)', textAlign: 'center', marginBottom: '2rem', letterSpacing: '0.02em' }}>
          Get ready, the battle is starting…
        </p>
        <div className="spinner-blue" />
        <div className="flex items-center gap-2" aria-hidden="true" style={{ marginTop: '-0.6rem' }}>
          <span className="dot" style={{ background: 'var(--secondary)' }} />
          <span className="dot" style={{ background: 'var(--secondary)' }} />
          <span className="dot" style={{ background: 'var(--secondary)' }} />
        </div>
      </div>
    </div>
  )
}
