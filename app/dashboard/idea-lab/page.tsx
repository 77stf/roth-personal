'use client'

import { useState } from 'react'
import type { OcenaIdeaLab, PersonaIdeaLab, WerdyktIdeaLab } from '@/lib/types'
import { IDEA_LAB_PERSONY } from '@/lib/constants'

const PERSONA_ICONS: Record<string, string> = {
  Inwestor: '💰',
  Operator_OFM: '⚙️',
  Mentor: '👨‍🏫',
  Adwokat_Diabla: '😈',
  Strateg_AI: '🤖',
}

const WERDYKT_COLORS: Record<WerdyktIdeaLab, { bg: string; text: string; border: string }> = {
  REALIZUJ: { bg: 'rgba(6,214,160,0.15)', text: '#06d6a0', border: 'rgba(6,214,160,0.3)' },
  POCZEKAJ: { bg: 'rgba(255,209,102,0.15)', text: '#ffd166', border: 'rgba(255,209,102,0.3)' },
  ODRZUC: { bg: 'rgba(255,51,102,0.15)', text: '#ff3366', border: 'rgba(255,51,102,0.3)' },
}

export default function IdeaLabPage() {
  const [pomysl, setPomysl] = useState('')
  const [kontekst, setKontekst] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<OcenaIdeaLab | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!pomysl.trim() || loading) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/idea-lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pomysl, kontekst }),
      })
      const json = await res.json() as { success: boolean; data?: OcenaIdeaLab; error?: string }

      if (!json.success || !json.data) {
        setError(json.error ?? 'Błąd oceny')
        return
      }
      setResult(json.data)
    } catch {
      setError('Błąd połączenia')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Multi-Persona AI</div>
        <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>Idea Lab</div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Ocena pomysłów z perspektywy 5 ekspertów jednocześnie
        </div>
      </div>

      {/* Formularz */}
      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Pomysł *
            </label>
            <textarea
              value={pomysl}
              onChange={e => setPomysl(e.target.value)}
              placeholder="Opisz pomysł — im więcej szczegółów, tym lepsza ocena..."
              style={{
                width: '100%',
                minHeight: '100px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '10px 12px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
              maxLength={2000}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Kontekst (opcjonalnie)
            </label>
            <textarea
              value={kontekst}
              onChange={e => setKontekst(e.target.value)}
              placeholder="Dodatkowy kontekst: budżet, czas, zasoby, cel..."
              style={{
                width: '100%',
                minHeight: '60px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '10px 12px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
              maxLength={1000}
            />
          </div>
        </div>

        {/* Persony */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {IDEA_LAB_PERSONY.map(p => (
            <div key={p} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '999px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
            }}>
              <span>{PERSONA_ICONS[p]}</span>
              <span>{p.replace(/_/g, ' ')}</span>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={!pomysl.trim() || loading}
          className="btn-primary"
          style={{
            width: '100%',
            opacity: !pomysl.trim() || loading ? 0.5 : 1,
            cursor: !pomysl.trim() || loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Oceniam przez 5 ekspertów...' : '💡 Oceń pomysł'}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div style={{
          padding: '12px 14px',
          background: 'rgba(255,51,102,0.1)',
          border: '1px solid rgba(255,51,102,0.3)',
          borderRadius: '8px',
          marginTop: '16px',
          fontSize: '13px',
          color: 'var(--accent-red)',
        }}>
          {error}
        </div>
      )}

      {/* Wyniki */}
      {result && (
        <div style={{ marginTop: '24px' }}>
          {/* Werdykt */}
          <div style={{
            padding: '16px 20px',
            background: WERDYKT_COLORS[result.werdykt].bg,
            border: `2px solid ${WERDYKT_COLORS[result.werdykt].border}`,
            borderRadius: '12px',
            marginBottom: '16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '28px', fontWeight: 900, color: WERDYKT_COLORS[result.werdykt].text }}>
              {result.werdykt}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>
              {result.uzasadnienie}
            </div>
          </div>

          {/* Persony */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            {result.persony.map(p => (
              <div key={p.persona} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '20px' }}>{PERSONA_ICONS[p.persona]}</span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700 }}>{p.persona.replace(/_/g, ' ')}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{p.ocena}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {p.plusy.length > 0 && (
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 600, marginBottom: '4px' }}>PLUSY</div>
                      {p.plusy.map((x, i) => (
                        <div key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '2px' }}>+ {x}</div>
                      ))}
                    </div>
                  )}
                  {p.minusy.length > 0 && (
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--accent-red)', fontWeight: 600, marginBottom: '4px' }}>MINUSY</div>
                      {p.minusy.map((x, i) => (
                        <div key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '2px' }}>- {x}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{
                  marginTop: '8px',
                  padding: '6px 10px',
                  background: 'var(--bg-elevated)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                }}>
                  → {p.rekomendacja}
                </div>
              </div>
            ))}
          </div>

          {/* Następne kroki */}
          {result.nastepneKroki.length > 0 && (
            <div className="card">
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Następne kroki
              </div>
              {result.nastepneKroki.map((krok, i) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: '10px',
                  padding: '6px 0',
                  borderBottom: i < result.nastepneKroki.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                }}>
                  <span style={{ color: 'var(--accent-blue)', fontWeight: 700, fontSize: '13px' }}>{i + 1}.</span>
                  <span style={{ fontSize: '13px' }}>{krok}</span>
                </div>
              ))}
            </div>
          )}

          {result.zapisanoDoObsidian && (
            <div style={{ fontSize: '11px', color: 'var(--accent-green)', marginTop: '8px', textAlign: 'center' }}>
              ✅ Zapisano do Obsidian /05_Ideas/
            </div>
          )}
        </div>
      )}
    </div>
  )
}
