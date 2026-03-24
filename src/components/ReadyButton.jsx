export default function ReadyButton({ myRole, playerSide, isReady, onReady, status }) {
  const isMySide = myRole === playerSide

  if (isMySide) {
    if (status !== 'reveal') return null

    if (!isReady) {
      return (
        <button
          className="btn-primary"
          style={{ width: '100%', marginTop: '1rem', animation: 'btn-pulse 2s infinite' }}
          onClick={onReady}
        >
          I'm Ready ⚔️
        </button>
      )
    }

    return (
      <div style={{
        width: '100%',
        marginTop: '1rem',
        background: 'rgba(109,255,179,0.10)',
        border: '1px solid var(--success)',
        color: 'var(--success)',
        padding: '0.8rem 1rem',
        borderRadius: '8px',
        textAlign: 'center',
        fontWeight: 600,
        fontSize: '0.9rem',
        animation: 'scale-up 0.3s ease-out',
        cursor: 'default'
      }}>
        ✓ Ready!
      </div>
    )
  }

  // Opponent Indicator Side
  if (status !== 'reveal') return null

  if (!isReady) {
    return (
      <div style={{
        marginTop: '1rem',
        color: 'var(--on-surface-variant)',
        fontSize: '0.8rem',
        textAlign: 'center',
        fontWeight: 500
      }}>
        ⏳ Not ready yet
      </div>
    )
  }

  return (
    <div style={{
      marginTop: '1rem',
      color: 'var(--success)',
      fontSize: '0.85rem',
      textAlign: 'center',
      fontWeight: 600,
      textShadow: '0 0 10px rgba(109,255,179,0.3)',
      animation: 'scale-up 0.3s ease-out'
    }}>
      ✓ Opponent is ready!
    </div>
  )
}
