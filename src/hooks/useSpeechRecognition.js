import { useState, useRef } from 'react'

const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)

  const startListening = () => {
    if (isListening || recognitionRef.current) return

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError("Your browser doesn't support voice recognition. Use Chrome or Edge.")
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    let finalTranscript = ''

    recognition.onresult = (event) => {
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' '
        } else {
          interimTranscript += result[0].transcript
        }
      }

      setTranscript(finalTranscript + interimTranscript)
    }

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') return
      
      // Don't restart on fatal errors
      if (['network', 'not-allowed', 'service-not-allowed'].includes(event.error)) {
        if (recognitionRef.current) {
          recognitionRef.current.shouldRestart = false
        }
      }

      setError(`Mic error: ${event.error}`)
      setIsListening(false)
    }

    recognition.onend = () => {
      if (recognitionRef.current?.shouldRestart) {
        try {
          recognition.start()
          setIsListening(true)
        } catch (e) {
          console.error("Failed to restart recognition:", e)
          setIsListening(false)
        }
      } else {
        setIsListening(false)
      }
    }

    recognition.shouldRestart = true
    try {
      recognition.start()
      setIsListening(true)
      setError(null)
    } catch (e) {
      console.error("Failed to start recognition:", e)
      setError(`Start failed: ${e.message}`)
      setIsListening(false)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.shouldRestart = false
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
  }

  const resetTranscript = () => {
    setTranscript('')
  }

  return { transcript, isListening, error, startListening, stopListening, resetTranscript }
}

export default useSpeechRecognition
