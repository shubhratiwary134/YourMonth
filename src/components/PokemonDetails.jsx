import React, { useState, useEffect } from 'react'

export default function PokemonDetails({ pokemon, playerColor, isRevealed, status }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (isRevealed) {
      const timer = setTimeout(() => setMounted(true), 800)
      return () => clearTimeout(timer)
    } else {
      setMounted(false)
    }
  }, [isRevealed])

  if (!pokemon || !isRevealed) return null

  const isCollapsed = status === 'debate'

  const barColor = playerColor === 'blue' ? 'var(--secondary)' : 'var(--tertiary)'

  const statConfig = [
    { label: 'HP', key: 'hp' },
    { label: 'ATK', key: 'attack' },
    { label: 'DEF', key: 'defense' },
    { label: 'SpATK', key: 'specialAttack' },
    { label: 'SpDEF', key: 'specialDefense' },
    { label: 'SPD', key: 'speed' },
  ]

  return (
    <div style={{
      width: '100%',
      background: 'var(--surface-container)',
      border: isCollapsed ? '0px solid transparent' : '1px solid rgba(189,157,255,0.08)',
      borderRadius: '12px',
      padding: isCollapsed ? '0 1rem' : '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      maxHeight: isCollapsed ? '0px' : '320px',
      overflowY: isCollapsed ? 'hidden' : 'auto',
      pointerEvents: isCollapsed ? 'none' : (mounted ? 'auto' : 'none'),
      opacity: isCollapsed ? 0 : (mounted ? 1 : 0),
      transform: mounted ? 'translateY(0)' : 'translateY(20px)',
      transition: 'opacity 0.4s ease, transform 0.5s ease, max-height 0.4s ease, padding 0.4s ease',
      marginTop: isCollapsed ? '0' : '1.5rem',
      flexShrink: 0
    }} className="custom-scrollbar">

      {/* A. STATS BAR SECTION */}
      <div>
        <div style={{
          fontFamily: 'var(--font-hed)',
          fontSize: '0.68rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--on-surface-variant)',
          marginBottom: '0.5rem'
        }}>Base Stats</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {statConfig.map(s => {
            const val = pokemon.stats?.[s.key] || 0
            const fillPct = Math.min((val / 255) * 100, 100)
            return (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.68rem',
                  color: 'var(--on-surface-variant)',
                  width: '44px',
                  textAlign: 'left'
                }}>{s.label}</div>
                
                <div style={{
                  flex: 1,
                  height: '5px',
                  background: 'rgba(189,157,255,0.1)',
                  borderRadius: '999px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: (mounted && !isCollapsed) ? `${fillPct}%` : '0%',
                    background: barColor,
                    borderRadius: '999px',
                    transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                  }} />
                </div>
                
                <div style={{
                  fontFamily: 'var(--font-hed)',
                  fontSize: '0.7rem',
                  color: 'var(--on-surface)',
                  fontWeight: 700,
                  width: '28px',
                  textAlign: 'right'
                }}>{val}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* B. MOVES SECTION */}
      {pokemon.moves && pokemon.moves.length > 0 && (
        <div>
          <div style={{
            fontFamily: 'var(--font-hed)',
            fontSize: '0.68rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--on-surface-variant)',
            marginBottom: '0.5rem'
          }}>Moves</div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.5rem'
          }}>
            {pokemon.moves.map(m => (
              <div key={m} className={`move-badge-${playerColor}`} style={{
                background: 'var(--surface-bright)',
                border: '1px solid var(--outline-variant)',
                borderRadius: '6px',
                padding: '0.3rem 0.6rem',
                fontFamily: 'var(--font-body)',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--on-surface)',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                cursor: 'default'
              }}>
                {m}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* C. QUICK INFO ROW */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div style={{
          background: 'var(--surface-high)',
          fontSize: '0.7rem',
          color: 'var(--on-surface-variant)',
          borderRadius: '6px',
          padding: '0.25rem 0.6rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem'
        }}>
          🔥 {(pokemon.types || [pokemon.type]).join(' / ')}
        </div>
        <div style={{
          background: 'var(--surface-high)',
          fontSize: '0.7rem',
          color: 'var(--on-surface-variant)',
          borderRadius: '6px',
          padding: '0.25rem 0.6rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem'
        }}>
          📏 {pokemon.height}
        </div>
        <div style={{
          background: 'var(--surface-high)',
          fontSize: '0.7rem',
          color: 'var(--on-surface-variant)',
          borderRadius: '6px',
          padding: '0.25rem 0.6rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem'
        }}>
          ⚖️ {pokemon.weight}
        </div>
      </div>

      {/* D. ABILITIES */}
      {pokemon.abilities && (
        <div>
          <div style={{
            fontFamily: 'var(--font-hed)',
            fontSize: '0.68rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--on-surface-variant)',
            marginBottom: '0.5rem'
          }}>Abilities</div>
          
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.75rem',
            color: 'var(--on-surface-variant)'
          }}>
            {Array.isArray(pokemon.abilities) ? pokemon.abilities.join(' · ') : pokemon.abilities.split(', ').join(' · ')}
          </div>
        </div>
      )}

      <style>{`
        .move-badge-blue:hover {
          background: rgba(105,156,255,0.12) !important;
          border-color: rgba(105,156,255,0.4) !important;
        }
        .move-badge-red:hover {
          background: rgba(255,113,106,0.12) !important;
          border-color: rgba(255,113,106,0.4) !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
      `}</style>
    </div>
  )
}
