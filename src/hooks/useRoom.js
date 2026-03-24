import { useState, useCallback, useEffect } from 'react'
import { ref, set, get, remove, onValue, update } from 'firebase/database'
import { db } from '../firebase'

const WORDS = ['FIRE', 'BOLT', 'NOVA', 'IRON', 'STORM', 'BLAZE', 'FROST', 'VOID', 'APEX', 'FLUX']

function generateCode() {
  return WORDS[Math.floor(Math.random() * WORDS.length)]
}

export function useRoom() {
  const [myRole,   setMyRole]   = useState(null)   // 'player1' | 'player2'
  const [roomCode, setRoomCode] = useState(null)
  const [roomData, setRoomData] = useState(null)
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(false)

  // ── Real-time Sync ───────────────────────────────────────────────────
  useEffect(() => {
    if (!roomCode) {
      setRoomData(null)
      return
    }
    const roomRef = ref(db, `rooms/${roomCode}`)
    const unsub = onValue(roomRef, (snapshot) => {
      setRoomData(snapshot.val())
    })
    return () => unsub()
  }, [roomCode])

  // ── Create Room ──────────────────────────────────────────────────────
  const createRoom = useCallback(async () => {
    const code = generateCode()
    setLoading(true)
    setError(null)
    try {
      await Promise.all([
        set(ref(db, `rooms/${code}/status`),         'waiting'),
        set(ref(db, `rooms/${code}/player1/joined`), true),
        set(ref(db, `rooms/${code}/createdAt`),      Date.now()),
      ])
      setMyRole('player1')
      setRoomCode(code)
      return { success: true, code }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Join Room ────────────────────────────────────────────────────────
  const joinRoom = useCallback(async (rawCode) => {
    const code = rawCode.trim().toUpperCase()

    if (!code) {
      return { success: false, error: 'Please enter a room code.' }
    }

    setLoading(true)
    setError(null)
    try {
      const snap = await get(ref(db, `rooms/${code}`))

      if (!snap.exists()) {
        return { success: false, error: 'Room not found. Check your code.' }
      }

      const status = snap.child('status').val()
      if (status !== 'waiting') {
        return { success: false, error: 'Room is full or already in progress.' }
      }

      await Promise.all([
        set(ref(db, `rooms/${code}/player2/joined`), true),
        set(ref(db, `rooms/${code}/status`),         'ready'),
      ])

      setMyRole('player2')
      setRoomCode(code)
      return { success: true, code }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Cancel Room ──────────────────────────────────────────────────────
  const cancelRoom = useCallback(async (code) => {
    const target = code || roomCode
    setLoading(true)
    try {
      if (target) await remove(ref(db, `rooms/${target}`))
    } catch (err) {
      console.error('Cancel failed:', err)
    } finally {
      setMyRole(null)
      setRoomCode(null)
      setError(null)
      setLoading(false)
    }
  }, [roomCode])

  return { myRole, roomCode, roomData, error, loading, createRoom, joinRoom, cancelRoom }
}

export { db }
