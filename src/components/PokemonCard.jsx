import { useState, useEffect } from 'react'

const TYPE_COLORS = {
  fire:     '#ff9741',
  water:    '#4fc3f7',
  grass:    '#78c850',
  electric: '#ffd700',
  psychic:  '#f85888',
  ice:      '#98d8d8',
  dragon:   '#7038f8',
  dark:     '#705848',
  fairy:    '#ee99ac',
  fighting: '#c03028',
  flying:   '#a890f0',
  poison:   '#a040a0',
  ground:   '#e0c068',
  rock:     '#b8a038',
  bug:      '#a8b820',
  ghost:    '#705898',
  steel:    '#b8b8d0',
  normal:   '#a8a878',
}

function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function PokemonCard({ isRevealed, pokemon, playerColor }) {
  const [justFlipped, setJustFlipped] = useState(false)
  const [flashActive, setFlashActive] = useState(false)
  const [prevRevealed, setPrevRevealed] = useState(isRevealed)

  useEffect(() => {
    if (isRevealed && !prevRevealed) {
      // Trigger flash mid-flip (approx 0.35s)
      setTimeout(() => setFlashActive(true), 150)
      setTimeout(() => setFlashActive(false), 550)

      // Trigger final glow pulse on completion (approx 0.7s)
      setTimeout(() => setJustFlipped(true), 700)
      setTimeout(() => setJustFlipped(false), 1300)
    }
    setPrevRevealed(isRevealed)
  }, [isRevealed, prevRevealed])

  const glowColor = playerColor === 'blue' ? 'rgba(105,156,255,0.2)' : 'rgba(255,110,132,0.2)'
  const typeColor = pokemon ? (TYPE_COLORS[pokemon.type.toLowerCase()] || TYPE_COLORS.normal) : TYPE_COLORS.normal

  return (
    <div style={{
      width: isRevealed ? '160px' : '200px',
      height: isRevealed ? '224px' : '280px',
      perspective: '1000px',
      transition: 'all 0.5s ease',
      // We apply the pulse-glow animation here so the whole card glows
      animation: justFlipped ? 'pulse-glow 0.6s ease-out' : 'none',
      color: pokemon ? typeColor : glowColor // passing color for the drop-shadow in pulse-glow
    }}>
      <div style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1)',
        transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}>
        
        {/* FLASH OVERLAY (renders mid-flip over the card container) */}
        {flashActive && (
          <div style={{
            position: 'absolute',
            inset: -40,
            background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(189,157,255,0.4) 40%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 10,
            animation: 'flash-overlay 0.4s ease-in-out forwards',
            transform: isRevealed ? 'rotateY(180deg) translateZ(1px)' : 'translateZ(1px)', // Keeps it above current face
          }} />
        )}

        {/* ── CARD FRONT (Hidden State) ────────────────────────────────── */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          borderRadius: '16px',
          border: '2px solid rgba(189,157,255,0.15)',
          boxShadow: `0 0 20px ${glowColor}`,
          background: 'linear-gradient(135deg, var(--surface-high) 0%, var(--surface-bright) 50%, var(--surface-high) 100%)',
          backgroundSize: '200% 200%',
          animation: 'shimmer 2s ease infinite',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          transform: 'rotateY(0deg)', // explicitly zero for Safari
        }}>
          <span style={{
            fontSize: '4rem',
            fontFamily: 'var(--font-hed)',
            color: 'var(--outline)',
            fontWeight: 800,
            opacity: 0.6,
            lineHeight: 1
          }}>?</span>
          <span style={{
            fontSize: '0.75rem',
            color: 'var(--on-surface-variant)',
            letterSpacing: '0.1em',
            fontWeight: 600,
            textTransform: 'uppercase'
          }}>Waiting...</span>
        </div>

        {/* ── CARD BACK (Revealed State) ───────────────────────────────── */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          borderRadius: '16px',
          background: 'var(--surface-container)',
          border: `2px solid ${typeColor}`,
          boxShadow: `0 0 24px ${hexToRgba(typeColor, 0.4)}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transform: 'rotateY(180deg)',
        }}>
          {pokemon && (
            <>
              {/* Top Section (40%) */}
              <div style={{ height: '40%', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '1rem' }}>
                <div style={{
                  background: hexToRgba(typeColor, 0.2),
                  border: `1px solid ${hexToRgba(typeColor, 0.6)}`,
                  color: typeColor,
                  padding: '0.2rem 1rem',
                  borderRadius: '999px',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase'
                }}>
                  {pokemon.type}
                </div>
              </div>

              {/* Middle Section (40%) */}
              <div style={{ height: '40%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img 
                  src={pokemon.imageUrl}
                  alt={pokemon.name}
                  style={{
                    width: '120px',
                    height: '120px',
                    objectFit: 'contain',
                    filter: `drop-shadow(0 4px 12px ${hexToRgba(typeColor, 0.6)})`
                  }}
                />
              </div>

              {/* Bottom Section (20%) */}
              <div style={{ height: '20%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: '1rem' }}>
                <div style={{
                  fontFamily: 'var(--font-hed)',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: 'var(--on-surface)',
                  textTransform: 'capitalize',
                  marginBottom: '0.1rem'
                }}>
                  {pokemon.name}
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  color: 'var(--on-surface-variant)',
                  fontWeight: 600
                }}>
                  No.{pokemon.id}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
