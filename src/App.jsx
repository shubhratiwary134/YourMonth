import { useState, useCallback, useEffect } from 'react'
import { useRoom } from './hooks/useRoom'
import HomeScreen    from './components/HomeScreen'
import WaitingScreen from './components/WaitingScreen'
import JoinedScreen  from './components/JoinedScreen'
import ArenaScreen   from './components/ArenaScreen'
import ResultScreen  from './components/ResultScreen'
import { ref, update } from 'firebase/database'
import { db } from './hooks/useRoom'

// Valid screen values: 'home' | 'waiting' | 'joined' | 'arena'
export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home')
  const { myRole, roomCode, roomData, loading, createRoom, joinRoom, cancelRoom } = useRoom()

  /* ── Screen transitions ────────────────────────────────────────────── */
  const handleCreateRoom = useCallback(async () => {
    const result = await createRoom()
    if (result.success) setCurrentScreen('waiting')
  }, [createRoom])

  const handleJoinRoom = useCallback(async (code) => {
    const result = await joinRoom(code)
    if (result.success) setCurrentScreen('joined')
    return result  // pass back to HomeScreen for error display
  }, [joinRoom])

  const handleCancel = useCallback(async () => {
    await cancelRoom()
    setCurrentScreen('home')
  }, [cancelRoom])

  const handlePlayAgain = async () => {
    if (!roomCode) return
    await update(ref(db, `rooms/${roomCode}`), {
      status: "reveal",
      currentRound: null,
      result: null,
      transcripts: null,
      rounds: null,
      timer: null,
      "player1/pokemon": null,
      "player1/ready": null,
      "player2/pokemon": null,
      "player2/ready": null,
    })
  }

  // ── Auto-transition between Arena and Result ────────────────────────
  useEffect(() => {
    if (roomData?.status) {
      if (roomData.status === 'result') setCurrentScreen('result')
      else if (['ready', 'reveal', 'debate', 'judging'].includes(roomData.status)) setCurrentScreen('arena')
    }
  }, [roomData?.status])

  /* ── Screen renderer ───────────────────────────────────────────────── */
  const screens = {
    home:    <HomeScreen    onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} loading={loading} />,
    waiting: <WaitingScreen roomCode={roomCode} onCancel={handleCancel} />,
    joined:  <JoinedScreen  roomCode={roomCode} />,
    arena:   <ArenaScreen   roomCode={roomCode} myRole={myRole} roomData={roomData} />,
    result:  <ResultScreen  result={roomData?.result} player1Pokemon={roomData?.player1?.pokemon} player2Pokemon={roomData?.player2?.pokemon} myRole={myRole} onPlayAgain={handlePlayAgain} />,
  }

  return (
    <>
      {/* Loading overlay */}
      <div
        role="status"
        aria-label="Loading…"
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(14,14,19,0.75)',
          backdropFilter: 'blur(4px)',
          opacity: loading ? 1 : 0,
          pointerEvents: loading ? 'all' : 'none',
          transition: 'opacity 0.2s ease',
        }}
      >
        <div className="spinner" />
      </div>

      {/* Screens with fade transition */}
      {Object.entries(screens).map(([key, screen]) => (
        <div
          key={key}
          style={{
            position: 'fixed', inset: 0, zIndex: 1,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '2rem',
            opacity: currentScreen === key ? 1 : 0,
            pointerEvents: currentScreen === key ? 'all' : 'none',
            transition: 'opacity 0.35s ease',
          }}
        >
          {screen}
        </div>
      ))}
    </>
  )
}
