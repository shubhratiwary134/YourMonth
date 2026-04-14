import { useState, useRef, useCallback } from 'react'

const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState(null)
  
  const recognitionRef = useRef(null)
  const shouldRestartRef = useRef(false)
  
  // Track historical finalized text when the native results array gets purged
  const historyRef = useRef('')       
  // Track the most recent final string built from the current results array
  const currentFinalRef = useRef('')  
  // Track the highest index we saw so we know if the browser clears the results array
  const highestLengthRef = useRef(0)

  const startListening = useCallback(() => {
    // If instance exists, just try to start it quietly (prevents Android perm blocks)
    if (recognitionRef.current) {
      shouldRestartRef.current = true
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (e) {
        if (e.name === 'InvalidStateError') setIsListening(true) // Already active
      }
      return
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError("Your browser doesn't support voice recognition.")
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    shouldRestartRef.current = true

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      // If the browser cleared the results array (e.g. upon restart), 
      // commit our last known final text into history.
      if (event.results.length < highestLengthRef.current) {
        historyRef.current += currentFinalRef.current
        currentFinalRef.current = ''
      }
      highestLengthRef.current = event.results.length

      let finalStr = ''
      let interimStr = ''

      // Always rebuild the complete string from the provided array to defeat resultIndex bugs
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalStr += event.results[i][0].transcript + ' '
        } else {
          interimStr += event.results[i][0].transcript
        }
      }

      currentFinalRef.current = finalStr
      setTranscript(historyRef.current + finalStr + interimStr)
    }

    recognition.onerror = (event) => {
      if (['no-speech', 'aborted', 'network'].includes(event.error)) return
      if (['not-allowed', 'service-not-allowed', 'audio-capture'].includes(event.error)) {
        shouldRestartRef.current = false
      }
      setError(`Mic error: ${event.error}`)
    }

    recognition.onend = () => {
      setIsListening(false)
      // If we're supposed to stay alive, restart the existing instance
      if (shouldRestartRef.current && recognitionRef.current) {
        // Small timeout helps prevent Android from suppressing aggressive auto-restarts
        setTimeout(() => {
          if (shouldRestartRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start()
              setIsListening(true)
            } catch (e) {}
          }
        }, 200)
      }
    }

    try {
      recognition.start()
      setIsListening(true)
      setError(null)
    } catch (e) {
      if (e.name === 'InvalidStateError') {
        setIsListening(true)
      } else {
        shouldRestartRef.current = false
        setError(`Start failed: ${e.message}`)
        setIsListening(false)
      }
    }
  }, [])

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch (e) {}
    }
    setIsListening(false)
  }, [])

  const resetTranscript = useCallback(() => {
    historyRef.current = ''
    currentFinalRef.current = ''
    highestLengthRef.current = 0
    setTranscript('')
  }, [])

  return { transcript, isListening, error, startListening, stopListening, resetTranscript }
}

export default useSpeechRecognition
