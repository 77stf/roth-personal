interface StreakData {
  nawyk: string
  count: number
  best: number
  lastDate?: string
}

interface StreakCardProps {
  streak: StreakData
}

function WeekDots({ lastDate, count }: { lastDate?: string; count: number }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const lastMs = lastDate ? new Date(lastDate).getTime() : NaN
  const lastValid = !isNaN(lastMs)

  return (
    <div style={{ display: 'flex', gap: '3px' }}>
      {Array.from({ length: 7 }, (_, i) => {
        // i=0 is 6 days ago, i=6 is today
        const dayOffset = i - 6
        const dayMs = today.getTime() + dayOffset * 86400000

        let done = false
        if (lastValid && count > 0) {
          // days from this dot to lastDate (positive = dot is before lastDate)
          const daysFromDot = Math.round((lastMs - dayMs) / 86400000)
          // dot is "done" if it falls within the streak window ending at lastDate
          done = daysFromDot >= 0 && daysFromDot < count
        }

        return (
          <div key={i} style={{
            width: 14, height: 14, borderRadius: 3,
            background: done ? 'var(--accent-green)' : 'var(--bg-elevated)',
            border: `1px solid ${done ? 'rgba(52,199,89,0.3)' : 'var(--border)'}`,
          }} />
        )
      })}
    </div>
  )
}

export function StreakCard({ streak }: StreakCardProps) {
  const fireEmoji = streak.count >= 7 ? '🔥🔥' : streak.count >= 3 ? '🔥' : '✓'
  const scale = Math.max(streak.best, 30)
  const pct = Math.min(100, Math.round((streak.count / scale) * 100))

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
          {streak.nawyk}
        </span>
        <span style={{ fontSize: '13px' }}>{fireEmoji}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ flex: 1, height: 5, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            width: `${pct}%`,
            height: '100%',
            borderRadius: 3,
            background: streak.count >= 7
              ? 'var(--accent-green)'
              : streak.count >= 3
                ? 'var(--accent-orange)'
                : 'var(--accent-blue)',
            transition: 'width 0.5s ease',
          }} />
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
          {streak.count}d / rek: {streak.best}d
        </span>
      </div>

      <WeekDots lastDate={streak.lastDate} count={streak.count} />
    </div>
  )
}
