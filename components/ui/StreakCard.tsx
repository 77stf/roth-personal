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
  const days: boolean[] = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]!

    if (!lastDate) {
      days.push(false)
      continue
    }
    const last = new Date(lastDate)
    const diff = Math.floor((d.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
    // Simple heuristic: mark as done if within streak range
    days.push(diff <= 0 && diff > -count)
  }

  return (
    <div style={{ display: 'flex', gap: '3px' }}>
      {days.map((done, i) => (
        <div key={i} style={{
          width: 14, height: 14, borderRadius: 3,
          background: done ? 'var(--accent-green)' : 'var(--bg-elevated)',
          border: `1px solid ${done ? 'rgba(52,199,89,0.3)' : 'var(--border)'}`,
        }} />
      ))}
    </div>
  )
}

export function StreakCard({ streak }: StreakCardProps) {
  const fireEmoji = streak.count >= 7 ? '🔥🔥' : streak.count >= 3 ? '🔥' : '✓'
  const pct = Math.min(100, Math.round((streak.count / 30) * 100))

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
