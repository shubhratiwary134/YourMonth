import React from 'react'

export default function BattleTimer({ currentRound, timer1, timer2, timer3 }) {
  if (!currentRound) return null

  // Check transitions (overlay waits for next round's delay countdown to hit 0)
  const isR1Gap = currentRound === 2 && timer2.timeUntilStart > 0
  const isR2Gap = currentRound === 3 && timer3.timeUntilStart > 0

  if (isR1Gap) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(14,14,19,0.95)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: 'scale-up 0.5s ease' }}>
        <div style={{ fontFamily: 'var(--font-hed)', fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 800, color: 'var(--primary)' }}>⚔️ Player 2's Turn!</div>
        <div style={{ fontSize: '1.2rem', color: 'var(--on-surface-variant)', marginTop: '1rem' }}>Player 2 — make your case</div>
        <div style={{ fontSize: '6rem', color: 'var(--tertiary)', fontWeight: 800, marginTop: '2rem' }}>{timer2.timeUntilStart}</div>
      </div>
    )
  }

  if (isR2Gap) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(14,14,19,0.95)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: 'scale-up 0.5s ease' }}>
        <div style={{ fontFamily: 'var(--font-hed)', fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 800, color: 'var(--primary)' }}>🔥 Open Debate!</div>
        <div style={{ fontSize: '1.2rem', color: 'var(--on-surface-variant)', marginTop: '1rem' }}>Both players — argue simultaneously</div>
        <div style={{ fontSize: '6rem', color: 'var(--tertiary)', fontWeight: 800, marginTop: '2rem' }}>{timer3.timeUntilStart}</div>
      </div>
    )
  }

  const activeTimer = currentRound === 1 ? timer1 : currentRound === 2 ? timer2 : currentRound === 3 ? timer3 : null
  
  if (!activeTimer || activeTimer.timeUntilStart > 0) return null

  const { timeLeft, isExpired } = activeTimer
  const totalTime = 45

  if (isExpired && currentRound === 3) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(14,14,19,0.95)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: 'scale-up 0.5s ease' }}>
        <div style={{ fontFamily: 'var(--font-hed)', fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 800, color: 'var(--primary)' }}>⚖️ Time's Up!</div>
        <div style={{ fontSize: '1.2rem', color: 'var(--on-surface-variant)', marginTop: '1rem' }}>Sending to AI Judge...</div>
      </div>
    )
  }

  if (isExpired) return null

  const radius = 60
  const strokeWidth = 5
  const normalizedRadius = radius - strokeWidth * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (timeLeft / totalTime) * circumference

  let timeColor = 'var(--success)'
  if (timeLeft <= 30 && timeLeft > 10) timeColor = '#ffd700'
  else if (timeLeft <= 10) timeColor = 'var(--error)'

  const isUrgent = timeLeft <= 10

  const speakers = {
    1: '🎙️ Player 1 Speaking',
    2: '🎙️ Player 2 Speaking',
    3: '🎙️ Both Speaking'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div style={{ position: 'relative', width: radius * 2, height: radius * 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isUrgent && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', height: '80%', borderRadius: '50%', boxShadow: '0 0 30px rgba(255,110,132,0.4)', animation: 'pulse 0.5s ease infinite', zIndex: 0 }} />
        )}
        <svg height={radius * 2} width={radius * 2} style={{ transform: 'rotate(-90deg)', position: 'absolute', zIndex: 1 }}>
          <circle stroke="rgba(255,255,255,0.08)" fill="transparent" strokeWidth={strokeWidth} r={normalizedRadius} cx={radius} cy={radius} />
          <circle stroke={timeColor} fill="transparent" strokeWidth={strokeWidth} strokeDasharray={circumference + ' ' + circumference} style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s linear, stroke 0.3s ease' }} strokeLinecap="round" r={normalizedRadius} cx={radius} cy={radius} />
        </svg>
        <div style={{ position: 'relative', zIndex: 2, fontFamily: 'var(--font-hed)', fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', fontWeight: 800, color: timeColor, lineHeight: 1, animation: isUrgent ? 'shake 0.2s ease-in-out infinite' : 'none', transition: 'color 0.3s ease' }}>
          {timeLeft}
        </div>
      </div>
      <div style={{ marginTop: '1rem', fontSize: '0.78rem', fontWeight: 600, color: 'var(--on-surface-variant)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        {speakers[currentRound]}
      </div>
    </div>
  )
}
