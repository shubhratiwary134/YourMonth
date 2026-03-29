import { useState, useCallback, useEffect } from 'react'
import { ref, set, get, remove, onValue, update, onDisconnect } from 'firebase/database'
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
      const roomRef = ref(db, `rooms/${code}`)
      // Overwrite the entire room payload to clear any old data
      await set(roomRef, {
        status: 'waiting',
        player1: { joined: true },
        createdAt: Date.now()
      })
      
      // Clean up room if this client disconnects unnecessarily
      onDisconnect(roomRef).remove()

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
      const roomRef = ref(db, `rooms/${code}`)
      const snap = await get(roomRef)

      if (!snap.exists()) {
        return { success: false, error: 'Room not found. Check your code.' }
      }

      const status = snap.child('status').val()
      if (status !== 'waiting') {
        return { success: false, error: 'Room is full or already in progress.' }
      }

      await update(roomRef, {
        'player2/joined': true,
        status: 'ready'
      })
      
      onDisconnect(roomRef).remove()

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
      if (target) {
        const roomRef = ref(db, `rooms/${target}`)
        await remove(roomRef)
        onDisconnect(roomRef).cancel() // Cancel the disconnect handler if manually removed
      }
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
