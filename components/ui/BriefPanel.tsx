interface BriefPanelProps {
  title: string
  date: string
  frog?: string | null
  sections: Array<{ heading: string; lines: string[] }>
  emptyMessage?: string
}

export function BriefPanel({ title, date, frog, sections, emptyMessage }: BriefPanelProps) {
  return (
    <div className="terminal-panel fade-in">
      <div className="terminal-header">
        {title} &middot; {date}
      </div>

      {frog && (
        <div className="frog-box">
          <div style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#FF6B6B', marginBottom: '4px' }}>
            Eat the Frog
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFD1CF' }}>
            {frog}
          </div>
        </div>
      )}

      {sections.length === 0 && emptyMessage ? (
        <div style={{ color: '#6E6E73', fontSize: '13px' }}>{emptyMessage}</div>
      ) : (
        sections.map((section, i) => (
          <div key={i} style={{ marginBottom: i < sections.length - 1 ? '14px' : 0 }}>
            <div style={{
              fontSize: '10px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#6E6E73',
              marginBottom: '6px',
              paddingBottom: '4px',
              borderBottom: '1px solid #2C2C2E',
            }}>
              {section.heading}
            </div>
            {section.lines.map((line, j) => (
              <div key={j} style={{ color: '#E8E8ED', lineHeight: 1.7 }}>
                {line}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  )
}
