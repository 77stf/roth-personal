'use client'

// ZASADA KRYTYCZNA: Realny i Fake NIGDY w jednym widoku — zawsze osobne ekrany
// Ten komponent renderuje ALBO realny ALBO fake — nigdy oba naraz

import { useState, useEffect } from 'react'

type TypUdzialow = 'OFM' | 'AI'
type WidokUdzialow = 'realny' | 'fake'

export default function UdzialyPage() {
  const [typ, setTyp] = useState<TypUdzialow>('OFM')
  const [widok, setWidok] = useState<WidokUdzialow>('realny')
  const [data, setData] = useState<{ nazwa: string; udzial: number }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [typ, widok])

  async function loadData() {
    setLoading(true)
    try {
      const sheet = typ === 'OFM' ? 'PROJEKTY_OFM' : 'PROJEKTY_AI'
      const res = await fetch(`/api/sheets/${sheet}`)
      const json = await res.json() as { success: boolean; data: string[][] }

      if (!json.success || !json.data) return

      const rows = json.data.slice(1)  // skip header
      const udzialCol = widok === 'realny' ? 3 : 4  // col D=realny, E=fake

      const parsed = rows.map(row => ({
        nazwa: String(row[0] ?? ''),
        udzial: Number(row[udzialCol] ?? 0),
      })).filter(r => r.nazwa)

      setData(parsed)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Finanse</div>
        <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>Udziały</div>
      </div>

      {/* Ostrzeżenie o prywatności */}
      <div style={{
        padding: '10px 14px',
        background: 'rgba(255,51,102,0.08)',
        border: '1px solid rgba(255,51,102,0.2)',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '12px',
        color: 'var(--accent-red)',
      }}>
        🔒 Realny i Fake dostępne tylko osobno — nigdy jednocześnie na tym samym ekranie.
      </div>

      {/* Wybór typu */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {(['OFM', 'AI'] as TypUdzialow[]).map(t => (
          <button
            key={t}
            onClick={() => setTyp(t)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: `1px solid ${typ === t ? 'var(--accent-red)' : 'var(--border)'}`,
              background: typ === t ? 'rgba(255,51,102,0.1)' : 'var(--bg-elevated)',
              color: typ === t ? 'var(--accent-red)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: typ === t ? 700 : 400,
            }}
          >
            {t === 'AI' ? 'AI Consulting' : 'OFM'}
          </button>
        ))}
      </div>

      {/* Wybór widoku — TYLKO JEDEN naraz */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        padding: '4px',
        background: 'var(--bg-elevated)',
        borderRadius: '10px',
      }}>
        {(['realny', 'fake'] as WidokUdzialow[]).map(w => (
          <button
            key={w}
            onClick={() => setWidok(w)}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: widok === w ? 'var(--bg-card)' : 'transparent',
              color: widok === w ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: widok === w ? 700 : 400,
              textTransform: 'capitalize',
            }}
          >
            {w === 'realny' ? '📊 Realny' : '📋 Prezentowany'}
          </button>
        ))}
      </div>

      {/* Widok udziałów */}
      <div className="card">
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {typ} — Udziały {widok === 'realny' ? 'Realne' : 'Prezentowane'}
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Ładowanie...</div>
        ) : data.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Brak danych. Wypełnij arkusz {typ === 'OFM' ? 'PROJEKTY_OFM' : 'PROJEKTY_AI'}.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.map(item => (
              <div key={item.nazwa}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>{item.nazwa}</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-green)' }}>
                    {item.udzial}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.min(100, item.udzial)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
