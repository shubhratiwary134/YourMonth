import { useState, useRef } from 'react'

const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)

  const startListening = () => {
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
      setError(`Mic error: ${event.error}`)
      setIsListening(false)
    }

    recognition.onend = () => {
      if (recognitionRef.current?.shouldRestart) {
        recognition.start()
      } else {
        setIsListening(false)
      }
    }

    recognition.shouldRestart = true
    recognition.start()
    setIsListening(true)
    setError(null)
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
