import { useState, useEffect } from 'react'
import { ref, update } from 'firebase/database'
import PokemonCard from './PokemonCard'
import PokemonDetails from './PokemonDetails'
import VoicePanel from './VoicePanel'
import ReadyButton from './ReadyButton'
import BattleTimer from './BattleTimer'
import usePokemon, { fetchPokemonStats } from '../hooks/usePokemon'
import useTimer from '../hooks/useTimer'
import useSpeechRecognition from '../hooks/useSpeechRecognition'
import { db } from '../hooks/useRoom'
import { callGemini, buildJudgePrompt } from '../services/gemini'

export default function ArenaScreen({ roomCode, myRole, roomData }) {
  const [isFetching, setIsFetching] = useState(false)
  const [fetchError, setFetchError] = useState('')

  const [transcripts, setTranscripts] = useState({ p1Opening: '', p2Opening: '', p1Debate: '', p2Debate: '' })

  const p1Speech = useSpeechRecognition()
  const p2Speech = useSpeechRecognition()

  const [geminiError, setGeminiError] = useState(null)
  const [isCallingGemini, setIsCallingGemini] = useState(false)
  const [judgeMsgIdx, setJudgeMsgIdx] = useState(0)

  const judgingMessages = [
    "Reviewing the opening arguments...",
    "Analyzing battle stats...",
    "Weighing the debate performance...",
    "Consulting ancient battle records...",
    "The AI Judge is deliberating...",
    "Calculating victory probability...",
    "Almost ready to announce..."
  ]

  const { fetchRandomPokemon } = usePokemon()

  const player1Pokemon = roomData?.player1?.pokemon || null
  const player2Pokemon = roomData?.player2?.pokemon || null
  const player1Ready   = roomData?.player1?.ready   || false
  const player2Ready   = roomData?.player2?.ready   || false
  const status         = roomData?.status           || 'waiting'

  const bothReady  = player1Ready && player2Ready
  const isRevealed = status === 'reveal' || status === 'debate' || status === 'judging' || status === 'result'

  const p1Label = myRole === 'player1' ? 'YOU' : 'OPPONENT'
  const p2Label = myRole === 'player2' ? 'YOU' : 'OPPONENT'

  // ── Round Data and Timers ────────────────────────────────────────────────
  const currentRound = roomData?.currentRound || null
  const round1StartedAt = roomData?.rounds?.round1?.startedAt || null
  const round2StartedAt = roomData?.rounds?.round2?.startedAt || null
  const round3StartedAt = roomData?.rounds?.round3?.startedAt || null

  const timer1 = useTimer(round1StartedAt, 45)
  const timer2 = useTimer(round2StartedAt, 45)
  const timer3 = useTimer(round3StartedAt, 45)

  const p1IsMyTurn = currentRound === 1 || currentRound === 3
  const p2IsMyTurn = currentRound === 2 || currentRound === 3

  // ── Sync local transcripts ───────────────────────────────────────────────
  useEffect(() => {
    setTranscripts(prev => ({
      ...prev,
      p1Opening: currentRound === 1 ? p1Speech.transcript : prev.p1Opening,
      p2Opening: currentRound === 2 ? p2Speech.transcript : prev.p2Opening,
      p1Debate:  currentRound === 3 ? p1Speech.transcript : prev.p1Debate,
      p2Debate:  currentRound === 3 ? p2Speech.transcript : prev.p2Debate,
    }))
  }, [p1Speech.transcript, p2Speech.transcript, currentRound])

  // Combine live local state with Firebase recorded state for the UI
  const allTranscripts = roomData?.transcripts || {}
  const displayP1Opening = currentRound === 1 ? (transcripts.p1Opening || p1Speech.transcript) : (allTranscripts.p1Opening || transcripts.p1Opening)
  const displayP2Opening = currentRound === 2 ? (transcripts.p2Opening || p2Speech.transcript) : (allTranscripts.p2Opening || transcripts.p2Opening)
  const displayP1Debate  = currentRound === 3 ? (transcripts.p1Debate || p1Speech.transcript)  : (allTranscripts.p1Debate || transcripts.p1Debate)
  const displayP2Debate  = currentRound === 3 ? (transcripts.p2Debate || p2Speech.transcript)  : (allTranscripts.p2Debate || transcripts.p2Debate)

  const p1DisplayTranscript = currentRound === 3 || status === 'judging' || status === 'result' ? displayP1Debate : displayP1Opening
  const p2DisplayTranscript = currentRound === 3 || status === 'judging' || status === 'result' ? displayP2Debate : displayP2Opening

  const p1Saved = status === 'judging' || status === 'result' || currentRound > 1 || (currentRound === 1 && timer1.isExpired)
  const p2Saved = status === 'judging' || status === 'result' || currentRound > 2 || (currentRound === 2 && timer2.isExpired)
  const p1DebateSaved = status === 'judging' || status === 'result' || (currentRound === 3 && timer3.isExpired)
  const p2DebateSaved = status === 'judging' || status === 'result' || (currentRound === 3 && timer3.isExpired)

  const p1VoicePanelSaved = currentRound === 3 || status === 'judging' || status === 'result' ? p1DebateSaved : p1Saved
  const p2VoicePanelSaved = currentRound === 3 || status === 'judging' || status === 'result' ? p2DebateSaved : p2Saved

  // ────────────────────────────────────────────────────────────────────────
  const handleGenerateBattle = async () => {
    setIsFetching(true)
    setFetchError('')
    try {
      const [p1, p2] = await Promise.all([fetchRandomPokemon(), fetchRandomPokemon()])
      setTimeout(async () => {
        try {
          await update(ref(db, `rooms/${roomCode}`), {
            'player1/pokemon': p1,
            'player2/pokemon': p2,
            status: 'reveal'
          })
        } catch (err) {
          console.error(err)
          setFetchError('Failed to sync. Try again.')
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
    await update(ref(db, `rooms/${roomCode}`), { [`${myRole}/ready`]: true })
  }

  const startRound = (round) => {
    if (round === 1) {
      p1Speech.resetTranscript()
      if (myRole === 'player1') p1Speech.startListening()
    }
    if (round === 2) {
      p2Speech.resetTranscript()
      if (myRole === 'player2') p2Speech.startListening()
    }
    if (round === 3) {
      if (myRole === 'player1') { p1Speech.resetTranscript(); p1Speech.startListening() }
      if (myRole === 'player2') { p2Speech.resetTranscript(); p2Speech.startListening() }
    }
  }

  const stopRound = () => {
    p1Speech.stopListening()
    p2Speech.stopListening()
  }

  // ── Auto Transitions & Transcript Syncing ────────────────────────────────
  
  // Enter Debate mode from Reveal
  useEffect(() => {
    if (bothReady && status === 'reveal') {
      const t = setTimeout(() => {
        update(ref(db, `rooms/${roomCode}`), { status: 'debate' })
          .catch(err => console.error('Failed to update status:', err))
      }, 2500)
      return () => clearTimeout(t)
    }
  }, [bothReady, status, roomCode])

  // STEP A — Start Round 1
  useEffect(() => {
    if (status === 'debate' && myRole === 'player1' && !currentRound && !round1StartedAt) {
      update(ref(db, `rooms/${roomCode}`), {
        currentRound: 1,
        'rounds/round1/startedAt': Date.now()
      })
    }
  }, [status, myRole, currentRound, round1StartedAt, roomCode])

  // STEP B — Round 1 -> Round 2
  useEffect(() => {
    if (timer1.isExpired && currentRound === 1) {
      if (myRole === 'player1') {
        stopRound()
        update(ref(db, `rooms/${roomCode}`), {
          currentRound: 2,
          'rounds/round2/startedAt': Date.now() + 4000,
          'transcripts/p1Opening': p1Speech.transcript || 'No argument provided'
        })
      }
    }
  }, [timer1.isExpired, currentRound, myRole, roomCode, p1Speech.transcript])

  // STEP C — Round 2 -> Round 3
  useEffect(() => {
    if (timer2.isExpired && currentRound === 2) {
      if (myRole === 'player2') {
        update(ref(db, `rooms/${roomCode}/transcripts`), {
          p2Opening: p2Speech.transcript || 'No argument provided'
        })
      }
      if (myRole === 'player1') {
        stopRound()
        update(ref(db, `rooms/${roomCode}`), {
          currentRound: 3,
          'rounds/round3/startedAt': Date.now() + 4000
        })
      }
    }
  }, [timer2.isExpired, currentRound, myRole, roomCode, p2Speech.transcript])

  // R3 End -> Write Transcripts
  useEffect(() => {
    if (timer3.isExpired && currentRound === 3) {
      if (myRole === 'player1') {
        update(ref(db, `rooms/${roomCode}/transcripts`), {
          p1Debate: p1Speech.transcript || 'No argument provided'
        })
      } else if (myRole === 'player2') {
        update(ref(db, `rooms/${roomCode}/transcripts`), {
          p2Debate: p2Speech.transcript || 'No argument provided'
        })
      }
    }
  }, [timer3.isExpired, currentRound, myRole, roomCode, p1Speech.transcript, p2Speech.transcript])

  // STEP D — Round 3 -> Judging (Wait for both transcripts!)
  useEffect(() => {
    if (
      myRole === 'player1' &&
      timer3.isExpired &&
      roomData?.transcripts?.p1Debate !== undefined &&
      roomData?.transcripts?.p2Debate !== undefined &&
      status !== 'judging' && status !== 'result'
    ) {
      stopRound()
      update(ref(db, `rooms/${roomCode}`), {
        status: 'judging',
        currentRound: null
      })
    }
  }, [timer3.isExpired, myRole, roomCode, status, roomData?.transcripts?.p1Debate, roomData?.transcripts?.p2Debate])

  // Fallback for Judging step if someone disconnected
  useEffect(() => {
    if (timer3.isExpired && myRole === 'player1' && status !== 'judging' && status !== 'result') {
      const fallback = setTimeout(() => {
        stopRound()
        update(ref(db, `rooms/${roomCode}`), {
          status: 'judging',
          currentRound: null
        })
      }, 5000)
      return () => clearTimeout(fallback)
    }
  }, [timer3.isExpired, myRole, roomCode, status])

  // Start round logic when Firebase syncs currentRound
  useEffect(() => {
    if (!currentRound) return
    const activeTimer = currentRound === 1 ? timer1 : currentRound === 2 ? timer2 : currentRound === 3 ? timer3 : null
    
    // If we're waiting for the countdown, make sure we're stopped
    if (activeTimer && activeTimer.timeUntilStart > 0) {
      stopRound()
      return
    }

    // Only start if we're not already listening for the active player
    const isAlreadyListening = (currentRound === 1 && p1Speech.isListening) || 
                                (currentRound === 2 && p2Speech.isListening) ||
                                (currentRound === 3 && (p1Speech.isListening || p2Speech.isListening))

    if (!isAlreadyListening) {
      startRound(currentRound)
    }
  }, [currentRound, timer1.timeUntilStart > 0, timer2.timeUntilStart > 0, timer3.timeUntilStart > 0])

  // ── Gemini Judging Logic ───────────────────────────────────────────────

  // Cycle wording
  useEffect(() => {
    if (status === 'judging') {
      const timer = setInterval(() => {
        setJudgeMsgIdx(i => (i + 1) % judgingMessages.length)
      }, 2500)
      return () => clearInterval(timer)
    }
  }, [status])

  useEffect(() => {
    if (status === 'judging' && myRole === 'player1' && !roomData?.result && !isCallingGemini) {
      runJudge()
    }
  }, [status, myRole, roomData?.result])

  const runJudge = async () => {
    setIsCallingGemini(true)
    setGeminiError(null)

    try {
      // 1. Fetch full stats
      const [p1Stats, p2Stats] = await Promise.all([
        fetchPokemonStats(roomData.player1.pokemon.id),
        fetchPokemonStats(roomData.player2.pokemon.id)
      ])

      // 2. Build Prompt
      const prompt = buildJudgePrompt(p1Stats, p2Stats, roomData.transcripts)

      // 3. Call Gemini
      const rawResponse = await callGemini(prompt)

      // 4. Parse JSON
      let result
      try {
        const cleaned = rawResponse.replace(/```json/g, "").replace(/```/g, "").trim()
        result = JSON.parse(cleaned)
      } catch (parseError) {
        console.error("Parse failed:", parseError, rawResponse)
        result = {
          winner: "player1",
          winnerPokemon: roomData.player1.pokemon.name,
          verdict: "The AI Judge was overwhelmed by the intensity of this battle. Player 1 takes the victory!",
          player1Feedback: "Strong argument overall.",
          player2Feedback: "Well argued but not enough.",
          finishingMove: "Judge's Decisive Strike",
          marginOfVictory: "close",
          keyFactor: "Overall Performance"
        }
      }

      // 5. Write to Firebase
      await update(ref(db, `rooms/${roomCode}`), {
        result: result,
        status: "result"
      })

    } catch (err) {
      console.error("Judge failed:", err)
      const fallbackResult = {
        winner: "player1",
        winnerPokemon: roomData.player1.pokemon.name,
        verdict: "The AI Judge's connection was interrupted by an electrical storm (API Error/Rate Limit). Player 1 takes the default victory!",
        player1Feedback: "Your API requests are powerful.",
        player2Feedback: "Check your Gemini API quota.",
        finishingMove: "System Override",
        marginOfVictory: "close",
        keyFactor: "Network Stability"
      }
      await update(ref(db, `rooms/${roomCode}`), {
        result: fallbackResult,
        status: "result"
      })
    } finally {
      setIsCallingGemini(false)
    }
  }

  useEffect(() => {
    if (status === 'result' && roomData?.result) {
      console.log('VERDICT:', roomData.result)
    }
  }, [status, roomData?.result])

  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="relative w-full min-h-screen flex flex-col md:flex-row overflow-hidden z-10" style={{ padding: 0 }}>

      {/* ── Player 1 Side ─────────────────────────────────────────────── */}
      <div
        className={`relative flex-1 flex flex-col items-center px-4 md:basis-2/5 ${isRevealed ? 'justify-start pt-8' : 'justify-center py-12'} overflow-y-auto custom-scrollbar`}
        style={{ background: 'rgba(105,156,255,0.04)', transition: 'padding 0.5s ease' }}
      >
        <div style={{ color: 'var(--secondary)', border: '1px solid var(--secondary)', padding: '0.4rem 1.2rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '2rem', transition: 'all 0.5s ease', flexShrink: 0 }}>
          {p1Label}
        </div>

        <div className="shrink-0">
          <PokemonCard isRevealed={isRevealed} pokemon={player1Pokemon} playerColor="blue" />
        </div>

        <PokemonDetails pokemon={player1Pokemon} playerColor="blue" isRevealed={isRevealed} status={status} />

        {isRevealed && (
          <div className="w-full shrink-0">
            {status === 'reveal' && (
              <div className="flex flex-col items-center mt-6">
                <ReadyButton myRole={myRole} playerSide="player1" status={status} isReady={player1Ready} onReady={myRole === 'player1' ? handleReady : undefined} />
              </div>
            )}
            {(status === 'debate' || status === 'judging' || status === 'result') && (
              <VoicePanel
                myRole={myRole}
                playerSide="player1"
                isMyTurn={p1IsMyTurn && status === 'debate'}
                isMutualDebate={currentRound === 3 && status === 'debate'}
                transcript={p1DisplayTranscript}
                isListening={myRole === 'player1' && p1Speech.isListening}
                error={myRole === 'player1' ? p1Speech.error : null}
                roundNumber={currentRound || 3}
                status={status}
                isSaved={p1VoicePanelSaved}
              />
            )}
          </div>
        )}
      </div>

      {/* ── VS Center ─────────────────────────────────────────────────── */}
      <div className="relative flex flex-col items-center justify-center py-6 md:py-12 md:basis-1/5 shrink-0">
        <div className="hidden md:block w-px h-full" style={{ background: 'rgba(189,157,255,0.10)' }} />
        <div className="block md:hidden h-px w-full" style={{ background: 'rgba(189,157,255,0.10)' }} />

        <div className="flex flex-col items-center justify-center text-center gap-4">

          {/* DEBATE: BattleTimer overlay and timer */}
          {status === 'debate' && (
            <div className="flex flex-col items-center gap-3 w-full">
              <BattleTimer 
                currentRound={currentRound}
                timer1={timer1} 
                timer2={timer2} 
                timer3={timer3} 
              />
            </div>
          )}

          {/* REVEAL + both ready: "Battle starts in..." */}
          {status === 'reveal' && bothReady && (
            <div style={{ margin: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ fontFamily: 'var(--font-hed)', fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 800, color: 'var(--primary)', textShadow: '0 0 20px rgba(189,157,255,0.4)' }}>
                Battle starts in...
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div className="w-3 h-3 rounded-full" style={{ background: 'var(--primary)', animation: 'pulse-dot 1s infinite ease-in-out both', animationDelay: '-0.32s' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: 'var(--primary)', animation: 'pulse-dot 1s infinite ease-in-out both', animationDelay: '-0.16s' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: 'var(--primary)', animation: 'pulse-dot 1s infinite ease-in-out both' }} />
              </div>
            </div>
          )}

          {/* WAITING / READY / PRE-REVEAL: VS + generate button */}
          {(!isRevealed || (status === 'reveal' && !bothReady)) && (
            <>
              <div style={{ fontFamily: 'var(--font-hed)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, color: '#fff', textShadow: '0 0 30px rgba(189,157,255,0.8)', margin: '1.5rem 0', animation: 'breathe 3s ease-in-out infinite' }}>
                VS
              </div>

              {!isRevealed && (
                <div className="flex flex-col items-center gap-2 mt-2 px-4">
                  {myRole === 'player1' ? (
                    <>
                      <button className="btn-primary flex items-center gap-2" style={{ width: 'fit-content', padding: '0.8rem 1.5rem', fontSize: '0.85rem' }} onClick={handleGenerateBattle} disabled={isFetching}>
                        {isFetching ? 'Drawing Pokémon...' : '⚔️ Generate Battle'}
                      </button>
                      {fetchError && <p role="alert" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--error)', marginTop: '0.5rem', textAlign: 'center' }}>{fetchError}</p>}
                    </>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', letterSpacing: '0.05em', fontWeight: 500, textAlign: 'center' }}>
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

        <div className="hidden md:block w-px h-full" style={{ background: 'rgba(189,157,255,0.10)' }} />
        <div className="block md:hidden h-px w-full" style={{ background: 'rgba(189,157,255,0.10)' }} />
      </div>

      {/* ── Player 2 Side ─────────────────────────────────────────────── */}
      <div
        className={`relative flex-1 flex flex-col items-center px-4 md:basis-2/5 ${isRevealed ? 'justify-start pt-8' : 'justify-center py-12'} overflow-y-auto custom-scrollbar`}
        style={{ background: 'rgba(255,113,106,0.04)', transition: 'padding 0.5s ease' }}
      >
        <div style={{ color: 'var(--tertiary)', border: '1px solid var(--tertiary)', padding: '0.4rem 1.2rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '2rem', transition: 'all 0.5s ease', flexShrink: 0 }}>
          {p2Label}
        </div>

        <div className="shrink-0">
          <PokemonCard isRevealed={isRevealed} pokemon={player2Pokemon} playerColor="red" />
        </div>

        <PokemonDetails pokemon={player2Pokemon} playerColor="red" isRevealed={isRevealed} status={status} />

        {isRevealed && (
          <div className="w-full shrink-0">
            {status === 'reveal' && (
              <div className="flex flex-col items-center mt-6">
                <ReadyButton myRole={myRole} playerSide="player2" status={status} isReady={player2Ready} onReady={myRole === 'player2' ? handleReady : undefined} />
              </div>
            )}
            {(status === 'debate' || status === 'judging' || status === 'result') && (
              <VoicePanel
                myRole={myRole}
                playerSide="player2"
                isMyTurn={p2IsMyTurn && status === 'debate'}
                isMutualDebate={currentRound === 3 && status === 'debate'}
                transcript={p2DisplayTranscript}
                isListening={myRole === 'player2' && p2Speech.isListening}
                error={myRole === 'player2' ? p2Speech.error : null}
                roundNumber={currentRound || 3}
                status={status}
                isSaved={p2VoicePanelSaved}
              />
            )}
          </div>
        )}
      </div>

      {/* ── Room Code ─────────────────────────────────────────────────── */}
      <div style={{ position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface-variant)', letterSpacing: '0.08em', textTransform: 'uppercase', zIndex: 20 }}>
        Room: {roomCode}
      </div>

      {/* ── Judging Overlay ───────────────────────────────────────────── */}
      {status === 'judging' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(14,14,19,0.85)', backdropFilter: 'blur(4px)' }}>
          <style>{`
            @keyframes rock-gavel { 0%{transform:rotate(-15deg)} 50%{transform:rotate(15deg)} 100%{transform:rotate(-15deg)} }
            @keyframes fade-loop { 0%{opacity:0} 15%{opacity:1} 85%{opacity:1} 100%{opacity:0} }
          `}</style>
          <div style={{ fontSize: '4rem', animation: 'rock-gavel 3s ease-in-out infinite', marginBottom: '1.5rem' }}>⚖️</div>
          <div style={{ fontFamily: 'var(--font-hed)', fontSize: '1.6rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>The AI Judge is Deliberating</div>
          <div style={{ fontFamily: 'var(--font-hed)', fontSize: '1.1rem', color: 'var(--on-surface-variant)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2rem' }}>
            {player1Pokemon?.name.toUpperCase()} ⚔️ {player2Pokemon?.name.toUpperCase()}
          </div>

          <div style={{ height: '2rem', position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <div key={judgeMsgIdx} style={{ position: 'absolute', color: 'var(--on-surface)', fontSize: '1rem', animation: 'fade-loop 2.5s ease-in-out forwards' }}>
              {judgingMessages[judgeMsgIdx]}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', marginTop: '2rem' }}>
            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--primary)', animation: 'pulse-dot 1s infinite ease-in-out both', animationDelay: '-0.32s' }} />
            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--primary)', animation: 'pulse-dot 1s infinite ease-in-out both', animationDelay: '-0.16s' }} />
            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--primary)', animation: 'pulse-dot 1s infinite ease-in-out both' }} />
          </div>
        </div>
      )}

    </div>
  )
}

