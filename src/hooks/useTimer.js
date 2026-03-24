import { useState, useEffect } from 'react'

const useTimer = (startedAt, duration = 90) => {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    if (!startedAt) {
      setTimeLeft(duration)
      setIsExpired(false)
      return
    }

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000
      const remaining = Math.max(0, duration - elapsed)
      
      setTimeLeft(Math.ceil(remaining))
      
      if (remaining <= 0) {
        setIsExpired(true)
        clearInterval(interval)
      } else {
        setIsExpired(false)
      }
    }, 500)

    // Run tick immediately once
    const elapsed = (Date.now() - startedAt) / 1000
    const remaining = Math.max(0, duration - elapsed)
    setTimeLeft(Math.ceil(remaining))
    if (remaining <= 0) setIsExpired(true)

    return () => clearInterval(interval)
  }, [startedAt, duration])

  return { timeLeft, isExpired }
}

export default useTimer
