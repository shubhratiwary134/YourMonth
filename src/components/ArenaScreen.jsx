import { useState, useEffect } from 'react'
import { ref, update } from 'firebase/database'
import PokemonCard from './PokemonCard'
import ArgumentBox from './ArgumentBox'
import BattleTimer from './BattleTimer'
import usePokemon from '../hooks/usePokemon'
import useTimer from '../hooks/useTimer'
import { db } from '../hooks/useRoom'

export default function ArenaScreen({ roomCode, myRole, roomData }) {
  const [isFetching, setIsFetching] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [myArgument, setMyArgument] = useState("")
  const [isLocked, setIsLocked] = useState(false)

  const { fetchRandomPokemon } = usePokemon()

  // Derive state from Firebase roomData instead of local state
  const player1Pokemon = roomData?.player1?.pokemon || null
  const player2Pokemon = roomData?.player2?.pokemon || null
  const player1Ready = roomData?.player1?.ready || false
  const player2Ready = roomData?.player2?.ready || false
  const status = roomData?.status || 'waiting'
  
  const startedAt = roomData?.timer?.startedAt || null
  const { timeLeft, isExpired } = useTimer(startedAt, 90)

  const bothReady = player1Ready && player2Ready
  const isRevealed = status === 'reveal' || status === 'debate' || status === 'judging'

  // Determine labels based on role
  const p1Label = myRole === 'player1' ? 'YOU' : 'OPPONENT'
  const p2Label = myRole === 'player2' ? 'YOU' : 'OPPONENT'

  const handleGenerateBattle = async () => {
    setIsFetching(true)
    setFetchError('')
    
    try {
      const [p1, p2] = await Promise.all([
        fetchRandomPokemon(),
        fetchRandomPokemon()
      ])
      
      // Dramatic pause before revealing via Firebase
      setTimeout(async () => {
        try {
          await update(ref(db, `rooms/${roomCode}`), {
            "player1/pokemon": p1,
            "player2/pokemon": p2,
            "status": "reveal"
          })
        } catch (dbErr) {
          console.error(dbErr)
          setFetchError('Failed to sync with room. Try again.')
        } finally {
          setIsFetching(false)
        }
      }, 800)
      
    } catch (err) {
      console.error(err)
      setFetchError('Failed to fetch Pokémon. Try again.')
      setIsFetching(false)
    }
  }

  const handleReady = async () => {
    const myReadyPath = `rooms/${roomCode}/${myRole}/ready`
    await update(ref(db, `rooms/${roomCode}`), {
      [`${myRole}/ready`]: true
    })
  }

  // Push status to debate when both are ready (avoiding race conditions by only doing it on P1)
  useEffect(() => {
    if (bothReady && status === 'reveal' && myRole === 'player1') {
      update(ref(db, `rooms/${roomCode}`), {
        status: 'debate'
      })
    }
  }, [bothReady, status, myRole, roomCode])

  // Unlock arguments when debate starts
  useEffect(() => {
    if (status === 'debate' && !isExpired) {
      setIsLocked(false)
    } else {
      setIsLocked(true) // Start locked during reveal phase until ready
    }
  }, [status, isExpired])

  // Timer start logic (Player 1 writes to Firebase)
  useEffect(() => {
    if (status === 'debate' && myRole === 'player1' && !roomData?.timer?.startedAt) {
      update(ref(db, `rooms/${roomCode}/timer`), {
        startedAt: Date.now(),
        duration: 90
      })
    }
  }, [status, myRole, roomData?.timer?.startedAt, roomCode])

  // Timer expiration logic
  useEffect(() => {
    if (isExpired && status === 'debate') {
      setIsLocked(true)
      
      // Both players push their final arguments to Firebase
      update(ref(db, `rooms/${roomCode}/${myRole}`), {
        argument: myArgument
      })

      // Player 1 advances the room status
      if (myRole === 'player1') {
        update(ref(db, `rooms/${roomCode}`), {
          status: 'judging' // or evaluation
        })
      }
    }
  }, [isExpired, status, myRole, myArgument, roomCode])

  return (
    <div className="relative w-full min-h-screen flex flex-col md:flex-row overflow-hidden z-10" style={{ padding: 0 }}>
      {/* ── Player 1 Side ──────────────────────────────────────────────── */}
      <div 
        className={`relative flex-1 flex flex-col items-center px-4 md:basis-2/5 ${isRevealed ? 'justify-start pt-8' : 'justify-center py-12'}`}
        style={{ background: 'rgba(105,156,255,0.04)', transition: 'padding 0.5s ease' }}
      >
        <div style={{
          color: 'var(--secondary)',
          border: '1px solid var(--secondary)',
          padding: '0.4rem 1.2rem',
          borderRadius: '999px',
          fontSize: '0.85rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: '2rem',
          transition: 'all 0.5s ease'
        }}>
          {p1Label}
        </div>

        <PokemonCard 
          isRevealed={isRevealed}
          pokemon={player1Pokemon}
          playerColor="blue"
        />

        {isRevealed && (
          <ArgumentBox
            myRole={myRole}
            playerSide="player1"
            isLocked={isLocked}
            argument={myRole === "player1" ? myArgument : ""}
            onArgumentChange={setMyArgument}
            player1Ready={player1Ready}
            player2Ready={player2Ready}
            onReady={handleReady}
            status={status}
          />
        )}
      </div>

      {/* ── VS Center ──────────────────────────────────────────────────── */}
      <div className="relative flex flex-col items-center justify-center py-6 md:py-12 md:basis-1/5 shrink-0">
        {/* Top/Left Divider */}
        <div className="hidden md:block w-px h-full" style={{ background: 'rgba(189,157,255,0.10)' }} />
        <div className="block md:hidden h-px w-full" style={{ background: 'rgba(189,157,255,0.10)' }} />

        <div className="flex flex-col items-center justify-center text-center">
          {status === 'debate' || status === 'judging' ? (
            <BattleTimer timeLeft={timeLeft} isExpired={isExpired || status === 'judging'} totalTime={90} />
          ) : bothReady ? (
            <div style={{
              margin: '2rem 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.8rem'
            }}>
              <div style={{
                fontFamily: 'var(--font-hed)',
                fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                fontWeight: 800,
                color: 'var(--primary)',
                textShadow: '0 0 20px rgba(189,157,255,0.4)'
              }}>
                Battle starts in...
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div className="w-3 h-3 rounded-full" style={{ background: 'var(--primary)', animation: 'pulse-dot 1s infinite ease-in-out both', animationDelay: '-0.32s' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: 'var(--primary)', animation: 'pulse-dot 1s infinite ease-in-out both', animationDelay: '-0.16s' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: 'var(--primary)', animation: 'pulse-dot 1s infinite ease-in-out both' }} />
              </div>
            </div>
          ) : (
            <>
              <div style={{
                fontFamily: 'var(--font-hed)',
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 800,
                color: '#fff',
                textShadow: '0 0 30px rgba(189,157,255,0.8)',
                margin: '1.5rem 0',
                animation: 'breathe 3s ease-in-out infinite'
              }}>
                VS
              </div>

              {/* Action Area */}
              {!isRevealed && !player1Pokemon && (
                <div className="flex flex-col items-center gap-2 mt-2 px-4">
                  {myRole === 'player1' ? (
                    <>
                  <button 
                    className="btn-primary flex items-center gap-2" 
                    style={{ width: 'fit-content', padding: '0.8rem 1.5rem', fontSize: '0.85rem' }}
                    onClick={handleGenerateBattle}
                    disabled={isFetching}
                  >
                    {isFetching ? 'Drawing Pokémon...' : '⚔️ Generate Battle'}
                  </button>
                  
                  {fetchError && (
                    <p role="alert" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--error)', marginTop: '0.5rem', textAlign: 'center' }}>
                      {fetchError}
                    </p>
                  )}
                </>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                  marginTop: '1rem'
                }}>
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'var(--on-surface-variant)',
                    letterSpacing: '0.05em',
                    fontWeight: 500,
                    textAlign: 'center'
                  }}>
                    Waiting for opponent to generate Pokémon...
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: 'var(--primary)', animation: 'pulse-dot 1.4s infinite ease-in-out both', animationDelay: '-0.32s' }} />
                    <div className="w-2 h-2 rounded-full" style={{ background: 'var(--primary)', animation: 'pulse-dot 1.4s infinite ease-in-out both', animationDelay: '-0.16s' }} />
                    <div className="w-2 h-2 rounded-full" style={{ background: 'var(--primary)', animation: 'pulse-dot 1.4s infinite ease-in-out both' }} />
                  </div>
                </div>
              )}
            </div>
          )}
          </>
        )}
        </div>

        {/* Bottom/Right Divider */}
        <div className="hidden md:block w-px h-full" style={{ background: 'rgba(189,157,255,0.10)' }} />
        <div className="block md:hidden h-px w-full" style={{ background: 'rgba(189,157,255,0.10)' }} />
      </div>

      {/* ── Player 2 Side ──────────────────────────────────────────────── */}
      <div 
        className={`relative flex-1 flex flex-col items-center px-4 md:basis-2/5 ${isRevealed ? 'justify-start pt-8' : 'justify-center py-12'}`}
        style={{ background: 'rgba(255,113,106,0.04)', transition: 'padding 0.5s ease' }}
      >
        <div style={{
          color: 'var(--tertiary)',
          border: '1px solid var(--tertiary)',
          padding: '0.4rem 1.2rem',
          borderRadius: '999px',
          fontSize: '0.85rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: '2rem',
          transition: 'all 0.5s ease'
        }}>
          {p2Label}
        </div>

        <PokemonCard 
          isRevealed={isRevealed}
          pokemon={player2Pokemon}
          playerColor="red"
        />

        {isRevealed && (
          <ArgumentBox
            myRole={myRole}
            playerSide="player2"
            isLocked={isLocked}
            argument={myRole === "player2" ? myArgument : ""}
            onArgumentChange={setMyArgument}
            player1Ready={player1Ready}
            player2Ready={player2Ready}
            onReady={handleReady}
            status={status}
          />
        )}
      </div>

      {/* ── Bottom Center Room Code ────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: 'var(--on-surface-variant)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        zIndex: 20
      }}>
        Room: {roomCode}
      </div>
    </div>
  )
}
