export default function BattleTimer({ timeLeft, isExpired, totalTime = 90 }) {
  if (isExpired) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'scale-up 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}>
        <div style={{
          fontFamily: 'var(--font-hed)',
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 800,
          color: 'var(--tertiary)',
          textShadow: '0 0 30px rgba(255,113,106,0.6)',
          textAlign: 'center',
          lineHeight: 1.1
        }}>
          Time's Up! ⚔️
        </div>
      </div>
    )
  }

  const radius = 60
  const strokeWidth = 5
  const normalizedRadius = radius - strokeWidth * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (timeLeft / totalTime) * circumference

  let timeColor = 'var(--success)'
  if (timeLeft <= 30 && timeLeft > 10) timeColor = '#ffd700'
  else if (timeLeft <= 10) timeColor = 'var(--error)'

  const isUrgent = timeLeft <= 10

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      <div style={{
        position: 'relative',
        width: radius * 2,
        height: radius * 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Urgent Glow */}
        {isUrgent && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            height: '80%',
            borderRadius: '50%',
            boxShadow: '0 0 30px rgba(255,110,132,0.4)',
            animation: 'pulse 0.5s ease infinite',
            zIndex: 0
          }} />
        )}

        {/* SVG Progress Ring */}
        <svg
          height={radius * 2}
          width={radius * 2}
          style={{ transform: 'rotate(-90deg)', position: 'absolute', zIndex: 1 }}
        >
          <circle
            stroke="rgba(255,255,255,0.08)"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={timeColor}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s linear, stroke 0.3s ease' }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>

        {/* Time Value */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          fontFamily: 'var(--font-hed)',
          fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
          fontWeight: 800,
          color: timeColor,
          lineHeight: 1,
          animation: isUrgent ? 'shake 0.2s ease-in-out infinite' : 'none',
          transition: 'color 0.3s ease'
        }}>
          {timeLeft}
        </div>
      </div>

      <div style={{
        marginTop: '1rem',
        fontSize: '0.7rem',
        fontWeight: 600,
        color: 'var(--on-surface-variant)',
        letterSpacing: '0.12em',
        textTransform: 'uppercase'
      }}>
        seconds left
      </div>
    </div>
  )
}
