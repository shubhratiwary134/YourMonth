import React, { useState, useEffect } from 'react'
import { TYPE_COLORS } from './PokemonCard'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'white', padding: '2rem', background: '#331111', height: '100vh', width: '100vw' }}>
          <h2>Result Screen Crashed</h2>
          <pre style={{ color: 'white' }}>{this.state.error.toString()}</pre>
          <button className="btn-primary" onClick={() => window.location.reload()}>Reload App</button>
        </div>
      )
    }
    return this.props.children
  }
}

function hexToRgba(hex, alpha) {
  if (!hex) return `rgba(0,0,0,${alpha})`
  const h = hex.replace('#', '')
  if (h.length !== 6) return `rgba(0,0,0,${alpha})`
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function ResultScreen({ result, player1Pokemon, player2Pokemon, myRole, onPlayAgain }) {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const timings = [500, 1000, 2000, 2800, 3500, 4500, 5200, 5800]
    const timers = timings.map((t, i) => 
      setTimeout(() => setStage(i + 1), t)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  const verdictWords = result?.verdict?.split(' ') || []
  const [typedWords, setTypedWords] = useState([])
  const isTyping = stage >= 5 && typedWords.length < verdictWords.length

  useEffect(() => {
    if (stage >= 5) {
      let i = 0
      const interval = setInterval(() => {
        setTypedWords(verdictWords.slice(0, i + 1))
        i++
        if (i >= verdictWords.length) clearInterval(interval)
      }, 75) // 75ms per word
      return () => clearInterval(interval)
    }
  }, [stage, result])

  // Generate 12 random particles once
  const [particles] = useState(() => Array.from({ length: 12 }).map(() => ({
    left: `${Math.random() * 100}vw`,
    size: `${Math.random() * 2 + 3}px`,
    duration: `${Math.random() * 4 + 4}s`,
    delay: `${Math.random() * 3}s`
  })))

  // === EARLY RETURN ===
  if (!result || !player1Pokemon || !player2Pokemon) {
    console.error("ResultScreen Data Missing:", { result, p1: player1Pokemon, p2: player2Pokemon })
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexDirection: 'column', gap: '1rem' }}>
        <p>Loading result data...</p>
        <button onClick={onPlayAgain} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Force Reset</button>
      </div>
    )
  }

  const winnerKey = result.winner // "player1" or "player2"
  const isP1Winner = winnerKey === 'player1'
  const isMyWin = winnerKey === myRole

  const winnerPokemon = isP1Winner ? player1Pokemon : player2Pokemon
  const winnerTypeColor = TYPE_COLORS[winnerPokemon?.type?.toLowerCase()] || TYPE_COLORS.normal

  const renderCard = (pokemon, isWinner) => {
    const typeColor = TYPE_COLORS[pokemon?.type?.toLowerCase()] || TYPE_COLORS.normal
    const isLoserPhase = stage >= 3 && !isWinner
    const isWinnerPhase = stage >= 3 && isWinner

    return (
      <div style={{
        position: 'relative',
        width: isWinnerPhase ? '180px' : (isLoserPhase ? '155px' : '160px'),
        height: isWinnerPhase ? '252px' : (isLoserPhase ? '217px' : '224px'),
        transition: 'all 0.6s ease',
        transform: isLoserPhase ? 'rotate(-5deg) scale(0.95)' : isWinnerPhase ? 'scale(1.08)' : 'none',
        filter: isLoserPhase ? 'grayscale(70%) brightness(0.55)' : 'none',
        opacity: isLoserPhase ? 0.6 : 1,
        borderRadius: '16px',
        background: 'var(--surface-container)',
        border: isWinnerPhase ? '2px solid #f59e0b' : isLoserPhase ? '2px solid var(--outline-variant)' : `2px solid ${typeColor}`,
        boxShadow: isWinnerPhase ? '0 0 40px rgba(245,158,11,0.5), 0 0 80px rgba(245,158,11,0.2)' : `0 0 24px ${hexToRgba(typeColor, 0.4)}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'visible' // allow crown to overflow
      }}>
        {isWinnerPhase && (
          <div style={{
            position: 'absolute',
            top: '-2.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '2rem',
            animation: 'crown-drop 0.5s cubic-bezier(0.34,1.56,0.64,1)',
            zIndex: 10
          }}>
            👑
          </div>
        )}
        
        {/* Top Section */}
        <div style={{ height: '40%', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '1rem', gap: '0.4rem' }}>
          {(pokemon.types || [pokemon.type]).map(tName => {
            const tColor = TYPE_COLORS[tName.toLowerCase()] || TYPE_COLORS.normal
            return (
              <div key={tName} style={{
                background: isWinnerPhase ? 'rgba(245,158,11,0.1)' : hexToRgba(tColor, 0.2),
                border: isWinnerPhase ? '1px solid #f59e0b' : `1px solid ${hexToRgba(tColor, 0.6)}`,
                color: isWinnerPhase ? '#f59e0b' : tColor,
                padding: '0.2rem 0.8rem',
                borderRadius: '999px',
                fontSize: '0.6rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                transition: 'all 0.6s ease'
              }}>
                {tName}
              </div>
            )
          })}
        </div>

        {/* Middle Section */}
        <div style={{ height: '40%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img 
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
            alt={pokemon.name}
            style={{
              width: isWinnerPhase ? '140px' : '120px',
              height: isWinnerPhase ? '140px' : '120px',
              objectFit: 'contain',
              filter: isWinnerPhase ? 'drop-shadow(0 4px 16px rgba(245,158,11,0.6))' : `drop-shadow(0 4px 12px ${hexToRgba(typeColor, 0.6)})`,
              transition: 'all 0.6s ease'
            }}
          />
        </div>

        {/* Bottom Section */}
        <div style={{ height: '20%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: '1rem' }}>
          <div style={{
            fontFamily: 'var(--font-hed)',
            fontSize: isWinnerPhase ? '1.1rem' : '0.95rem',
            fontWeight: 800,
            color: isWinnerPhase ? '#f59e0b' : 'var(--on-surface)',
            textTransform: 'capitalize',
            marginBottom: '0.1rem',
            transition: 'all 0.6s ease'
          }}>
            {pokemon.name}
          </div>
        </div>
      </div>
    )
  }

  const renderFeedback = (pokemon, feedbackText, playerKey) => {
    const isPlayer1 = playerKey === 'player1'
    const isWinner = winnerKey === playerKey
    const isMe = myRole === playerKey

    const colorVar = isPlayer1 ? 'var(--secondary)' : 'var(--tertiary)'
    const bgRgba = isPlayer1 ? 'rgba(105,156,255,0.05)' : 'rgba(255,113,106,0.05)'
    const borderRgba = isPlayer1 ? 'rgba(105,156,255,0.12)' : 'rgba(255,113,106,0.12)'

    return (
      <div style={{
        flex: 1,
        background: bgRgba,
        border: `1px solid ${borderRgba}`,
        borderRadius: '12px',
        padding: '0.85rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        animation: 'fade-in 0.5s ease-out both'
      }}>
        {/* Header Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <img 
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`} 
            alt={pokemon.name}
            style={{ width: '32px', height: '32px', objectFit: 'contain' }}
          />
          <span style={{ 
            fontFamily: 'var(--font-hed)', 
            fontSize: '0.78rem', 
            textTransform: 'uppercase', 
            color: colorVar,
            fontWeight: 700
          }}>
            {pokemon.name}
          </span>
          {isMe && (
            <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>← You</span>
          )}
          {isWinner && (
            <span style={{ 
              background: 'rgba(245,158,11,0.15)', 
              color: '#f59e0b', 
              fontSize: '0.65rem', 
              fontWeight: 800, 
              padding: '0.15rem 0.4rem', 
              borderRadius: '4px',
              textTransform: 'uppercase',
              marginLeft: 'auto'
            }}>
              🏆 Winner
            </span>
          )}
        </div>
        
        {/* Feedback Text */}
        <div style={{ 
          fontFamily: 'var(--font-body)', 
          fontSize: '0.83rem', 
          color: 'var(--on-surface-variant)', 
          lineHeight: 1.5 
        }}>
          {feedbackText}
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: 'var(--surface)',
      position: 'relative',
      overflowX: 'hidden',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '4rem 1rem 6rem 1rem',
      animation: 'fade-in 1s ease-out'
    }}>
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-down { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes drop-bounce { 0% { transform: translate(-50%, -30px); opacity: 0; } 100% { transform: translate(-50%, 0); opacity: 1; } }
        @keyframes crown-drop { from { transform: translateX(-50%) translateY(-30px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }
        @keyframes slide-right { from { transform: translateX(-50px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slide-left { from { transform: translateX(50px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes float-up { 0% { transform: translateY(0) scale(1); opacity: 0.15; } 100% { transform: translateY(-100vh) scale(0); opacity: 0; } }
      `}</style>

      {/* Background glow and particles */}
      {stage >= 3 && (
        <>
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(circle at center, ${hexToRgba(winnerTypeColor, 0.08)} 0%, transparent 400px)`,
            pointerEvents: 'none',
            zIndex: 0,
            animation: 'fade-in 2s ease-out'
          }} />
          {particles.map((p, i) => (
            <div key={i} style={{
              position: 'fixed',
              bottom: 0,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: 'var(--primary)',
              opacity: 0, // governed by animation
              left: p.left,
              animation: `float-up ${p.duration} ease-in infinite`,
              animationDelay: p.delay,
              pointerEvents: 'none',
              zIndex: 0
            }} />
          ))}
        </>
      )}

      {/* Personal Victory/Defeat Banner */}
      {stage >= 1 && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          background: isMyWin ? 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(138,76,252,0.15))' : 'rgba(255,110,132,0.06)',
          borderBottom: isMyWin ? '2px solid #f59e0b' : '1px solid rgba(255,110,132,0.15)',
          padding: '1rem',
          textAlign: 'center',
          fontFamily: 'var(--font-hed)',
          fontSize: isMyWin ? '1.4rem' : '0.95rem',
          fontWeight: isMyWin ? 800 : 600,
          color: isMyWin ? '#f59e0b' : 'var(--on-surface-variant)',
          animation: isMyWin ? 'slide-down 0.6s cubic-bezier(0.16, 1, 0.3, 1) both' : 'fade-in 0.6s ease both',
          zIndex: 10
        }}>
          {isMyWin ? '🏆 YOU WON!' : 'Better luck next time...'}
        </div>
      )}

      <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '800px', marginTop: '1rem' }}>
        
        {/* 1. HEADER */}
        {stage >= 1 && (
          <div style={{
            fontFamily: 'var(--font-hed)',
            fontSize: '0.75rem',
            letterSpacing: '0.25em',
            color: 'var(--on-surface-variant)',
            textTransform: 'uppercase',
            marginBottom: '1.5rem',
            marginTop: '1.5rem',
            animation: 'fade-in 0.5s ease-out'
          }}>
            ⚖️ The Verdict
          </div>
        )}

        {/* 2. CARDS ROW */}
        {stage >= 2 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: stage >= 3 ? '1.5rem' : '2.5rem',
            marginBottom: '2rem',
            minHeight: '260px',
            transition: 'gap 0.8s ease'
          }}>
            <div style={{ animation: 'slide-right 0.8s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
              {renderCard(player1Pokemon, isP1Winner)}
            </div>

            <div style={{
              fontFamily: 'var(--font-hed)',
              fontSize: stage >= 3 ? '1rem' : '2rem',
              fontWeight: 800,
              color: 'var(--outline)',
              textShadow: stage >= 3 ? 'none' : '0 0 30px rgba(189,157,255,0.8)',
              alignSelf: 'center',
              transition: 'all 0.8s ease',
              animation: 'fade-in 0.8s ease'
            }}>
              VS
            </div>

            <div style={{ animation: 'slide-left 0.8s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
              {renderCard(player2Pokemon, !isP1Winner)}
            </div>
          </div>
        )}

        {/* 3 & 4. BADGES */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '2rem', minHeight: '80px' }}>
          {stage >= 3 && (
            <div style={{
              background: result?.marginOfVictory === 'dominant' ? 'rgba(245,158,11,0.12)' : 'rgba(189,157,255,0.10)',
              border: result?.marginOfVictory === 'dominant' ? '1px solid rgba(245,158,11,0.35)' : '1px solid rgba(189,157,255,0.3)',
              color: result?.marginOfVictory === 'dominant' ? '#f59e0b' : 'var(--primary)',
              fontFamily: 'var(--font-hed)',
              fontSize: '0.72rem',
              letterSpacing: '0.15em',
              padding: '0.3rem 0.9rem',
              borderRadius: '999px',
              textTransform: 'uppercase',
              animation: 'fade-in 0.5s ease-out both'
            }}>
              {result?.marginOfVictory === 'dominant' ? '👑 Dominant Victory' : '⚡ Close Battle'}
            </div>
          )}

          {stage >= 4 && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(138,76,252,0.18), rgba(245,158,11,0.08))',
              border: '1px solid rgba(189,157,255,0.25)',
              borderRadius: '12px',
              padding: '0.55rem 1.1rem',
              fontFamily: 'var(--font-hed)',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: 'var(--primary)',
              textTransform: 'uppercase',
              animation: 'drop-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both'
            }}>
              ⚡ {result?.finishingMove || 'Final Blow'}
            </div>
          )}
        </div>

        {/* 5. VERDICT TEXT BOX */}
        {stage >= 5 && (
          <div style={{
            background: 'var(--surface-container)',
            border: '1px solid rgba(189,157,255,0.12)',
            borderLeft: '3px solid var(--primary)',
            borderRadius: '0 12px 12px 0',
            padding: '1.1rem 1.3rem',
            maxWidth: '580px',
            margin: '0 auto',
            width: '100%',
            marginBottom: '1rem',
            animation: 'fade-in 0.5s ease-out both'
          }}>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem',
              color: 'var(--on-surface)',
              lineHeight: 1.75,
              fontStyle: 'italic'
            }}>
              "{typedWords.join(' ')}"
              {isTyping && <span style={{ fontFamily: 'monospace', marginLeft: '2px', animation: 'blink 1s step-end infinite' }}>▌</span>}
            </div>
          </div>
        )}

        {/* 6. KEY FACTOR */}
        {stage >= 7 && (
          <div style={{
            background: 'var(--surface-high)',
            border: '1px solid var(--outline-variant)',
            borderRadius: '8px',
            padding: '0.45rem 0.9rem',
            fontSize: '0.8rem',
            color: 'var(--on-surface-variant)',
            marginBottom: '2.5rem',
            animation: 'slide-up 0.5s ease-out both'
          }}>
            🎯 Key Factor: <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{result?.keyFactor || 'Superior strategy'}</span>
          </div>
        )}

        {/* 7. PLAYER FEEDBACK */}
        {stage >= 6 && (
          <div style={{
            display: 'flex',
            gap: '1rem',
            width: '100%',
            maxWidth: '580px',
            margin: '0 auto 2.5rem auto',
            flexDirection: 'row'
          }}>
            {renderFeedback(player1Pokemon, result?.player1Feedback || 'Good effort.', 'player1')}
            {renderFeedback(player2Pokemon, result?.player2Feedback || 'Good effort.', 'player2')}
          </div>
        )}

        {/* 8. PLAY AGAIN */}
        {stage >= 8 && (
          <button 
            className="btn-primary" 
            onClick={onPlayAgain}
            style={{ width: '100%', maxWidth: '300px', padding: '1rem', fontSize: '1.1rem', marginTop: '2rem', animation: 'fade-in 0.5s ease-out both' }}
          >
            ⚔️ Play Again
          </button>
        )}
      </div>
    </div>
    </ErrorBoundary>
  )
}
