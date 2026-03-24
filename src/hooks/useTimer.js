import { useState, useEffect } from 'react'

const useTimer = (startedAt, duration = 45) => {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isExpired, setIsExpired] = useState(false)
  const [timeUntilStart, setTimeUntilStart] = useState(0)

  useEffect(() => {
    if (!startedAt) {
      setTimeLeft(duration)
      setIsExpired(false)
      setTimeUntilStart(0)
      return
    }

    const tick = () => {
      const now = Date.now()
      if (now < startedAt) {
        setTimeUntilStart(Math.ceil((startedAt - now) / 1000))
        setTimeLeft(duration)
        setIsExpired(false)
      } else {
        setTimeUntilStart(0)
        const elapsed = (now - startedAt) / 1000
        const remaining = Math.max(0, duration - elapsed)
        setTimeLeft(Math.ceil(remaining))
        
        if (remaining <= 0) {
          setIsExpired(true)
        } else {
          setIsExpired(false)
        }
      }
    }

    tick()
    // Tick quickly to ensure smooth transition countdowns
    const interval = setInterval(tick, 200)
    return () => clearInterval(interval)
  }, [startedAt, duration])

  // Stop interval if expired, but we can just relying on the effect
  // actually let's structure it so we clear if expired to save cycles
  useEffect(() => {
    if (isExpired) {
      // do nothing, interval from above effect will just hit state update limits
    }
  }, [isExpired])

  return { timeLeft, isExpired, timeUntilStart }
}

export default useTimer
