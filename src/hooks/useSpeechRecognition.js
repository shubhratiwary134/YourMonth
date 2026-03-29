import { useState, useRef, useCallback } from 'react'

const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState(null)
  
  const recognitionRef = useRef(null)
  const shouldRestartRef = useRef(false)
  const prevTranscriptRef = useRef('') 
  const currentFinalRef = useRef('')   

  const startListening = useCallback(() => {
    if (recognitionRef.current) return

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError("Your browser doesn't support voice recognition. Use Chrome or Edge.")
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    shouldRestartRef.current = true
    currentFinalRef.current = ''

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      let finalStr = ''
      let interimStr = ''

      // Always iterate exactly over the current results chunk available
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalStr += result[0].transcript + ' '
        } else {
          interimStr += result[0].transcript
        }
      }

      currentFinalRef.current = finalStr
      setTranscript(prevTranscriptRef.current + finalStr + interimStr)
    }

    recognition.onerror = (event) => {
      // Ignore transient or benign errors so they silently retry
      if (['no-speech', 'aborted', 'network'].includes(event.error)) return
      
      // Don't restart on fatal errors
      if (['not-allowed', 'service-not-allowed', 'audio-capture'].includes(event.error)) {
        shouldRestartRef.current = false
      }

      setError(`Mic error: ${event.error}`)
    }

    recognition.onend = () => {
      // Commit this session's final text before destroying the instance
      prevTranscriptRef.current += currentFinalRef.current
      currentFinalRef.current = ''
      
      recognitionRef.current = null
      setIsListening(false)

      // Restart seamlessly if intended
      if (shouldRestartRef.current) {
        startListening()
      }
    }

    try {
      recognition.start()
      setIsListening(true)
      setError(null)
    } catch (e) {
      console.error("Failed to start recognition:", e)
      shouldRestartRef.current = false
      recognitionRef.current = null
      setError(`Start failed: ${e.message}`)
      setIsListening(false)
    }
  }, [])

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }, [])

  const resetTranscript = useCallback(() => {
    prevTranscriptRef.current = ''
    currentFinalRef.current = ''
    setTranscript('')
  }, [])

  return { transcript, isListening, error, startListening, stopListening, resetTranscript }
}

export default useSpeechRecognition
