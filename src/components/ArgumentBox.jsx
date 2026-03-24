import ReadyButton from './ReadyButton'

export default function ArgumentBox({ 
  myRole, playerSide, isLocked, argument, onArgumentChange,
  player1Ready, player2Ready, onReady, status 
}) {
  const isMyBox = myRole === playerSide

  // ── Opponent Placeholder Panel ─────────────────────────────────────
  if (!isMyBox) {
    return (
      <>
        <div style={{
          width: '100%',
        minHeight: '140px',
        background: 'var(--surface-high)',
        border: '1px dashed var(--outline-variant)',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        marginTop: '1.5rem',
        padding: '1rem'
      }}>
        <div style={{
          color: 'var(--on-surface-variant)',
          fontSize: '0.85rem',
          fontWeight: 500,
          textAlign: 'center'
        }}>
          Opponent is building their case...
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--outline-variant)', animation: 'pulse-dot 1.4s infinite ease-in-out both', animationDelay: '-0.32s' }} />
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--outline-variant)', animation: 'pulse-dot 1.4s infinite ease-in-out both', animationDelay: '-0.16s' }} />
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--outline-variant)', animation: 'pulse-dot 1.4s infinite ease-in-out both' }} />
        </div>
      </div>
      
      <ReadyButton
        myRole={myRole}
        playerSide={playerSide}
        isReady={playerSide === "player1" ? player1Ready : player2Ready}
        onReady={onReady}
        status={status}
      />
    </>
    )
  }

  // ── Editable Text Area ─────────────────────────────────────────────
  const placeholderText = playerSide === 'player1' 
    ? "Why does your Pokémon win?\nMake your case..." 
    : "Argue for your Pokémon.\nWhat makes them unbeatable?"

  const charCount = argument.length
  const overLimitWarning = charCount > 280

  return (
    <div style={{ position: 'relative', width: '100%', marginTop: '1.5rem' }}>
      <textarea
        value={argument}
        onChange={(e) => {
          if (e.target.value.length <= 300) {
            onArgumentChange(e.target.value)
          }
        }}
        disabled={isLocked}
        placeholder={placeholderText}
        style={{
          width: '100%',
          minHeight: '140px',
          maxHeight: '200px',
          background: isLocked ? 'var(--surface-container)' : 'var(--surface-high)',
          border: `1.5px solid var(--outline-variant)`,
          borderRadius: '12px',
          padding: '1rem',
          paddingBottom: '2.5rem', // make room for counter
          color: 'var(--on-surface)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.9rem',
          resize: 'vertical',
          outline: 'none',
          opacity: isLocked ? 0.75 : 1,
          transition: 'all 0.2s ease',
          boxShadow: isLocked ? 'none' : 'var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow, 0 0 #0000)',
        }}
        onFocus={(e) => {
          if (!isLocked) {
            e.target.style.borderColor = 'var(--primary)'
            e.target.style.boxShadow = '0 0 0 3px rgba(189,157,255,0.15)'
          }
        }}
        onBlur={(e) => {
          if (!isLocked) {
            e.target.style.borderColor = 'var(--outline-variant)'
            e.target.style.boxShadow = 'none'
          }
        }}
      />
      
      {/* Lock Icon */}
      {isLocked && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          fontSize: '1.1rem',
          opacity: 0.8
        }}>
          🔒
        </div>
      )}

      {/* Character Counter */}
      <div style={{
        position: 'absolute',
        bottom: '1rem',
        right: '1rem',
        fontSize: '0.72rem',
        fontWeight: 600,
        color: overLimitWarning ? 'var(--error)' : 'var(--on-surface-variant)',
        pointerEvents: 'none',
        transition: 'color 0.2s ease'
      }}>
        {charCount}/300
      </div>

      <ReadyButton
        myRole={myRole}
        playerSide={playerSide}
        isReady={playerSide === "player1" ? player1Ready : player2Ready}
        onReady={onReady}
        status={status}
      />
    </div>
  )
}
