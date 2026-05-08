export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { getOsobyProfile } from '@/lib/sheets'
import Link from 'next/link'
import { ALERT_PARTNER_DNI } from '@/lib/constants'

async function LudzieContent() {
  const osoby = await getOsobyProfile()

  const today = new Date()
  const cutoff = new Date(today)
  cutoff.setDate(cutoff.getDate() - ALERT_PARTNER_DNI)
  const cutoffStr = cutoff.toISOString().split('T')[0]!

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Ludzie</div>
        <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>Ludzie</div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Dane z arkusza OSOBY_PROFILE + Obsidian /01_People/
        </div>
      </div>

      {osoby.length === 0 ? (
        <div className="card">
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Brak profili. Wypełnij arkusz OSOBY_PROFILE.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {osoby.map(osoba => {
            const brakKontaktu = osoba.ostatniKontakt && osoba.ostatniKontakt < cutoffStr
            const daysSince = osoba.ostatniKontakt
              ? Math.floor((today.getTime() - new Date(osoba.ostatniKontakt).getTime()) / (1000 * 60 * 60 * 24))
              : null

            return (
              <Link
                key={osoba.imie}
                href={`/dashboard/ludzie/${osoba.imie.toLowerCase().replace(/\s+/g, '-')}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="card" style={{
                  borderLeft: `3px solid ${brakKontaktu && osoba.otwarteSrawy.length > 0 ? 'var(--accent-red)' : 'var(--border)'}`,
                  cursor: 'pointer',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'var(--bg-elevated)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      flexShrink: 0,
                    }}>
                      👤
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 700 }}>{osoba.imie}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{osoba.rola}</div>
                        </div>
                        {brakKontaktu && osoba.otwarteSrawy.length > 0 && (
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: 'rgba(255,51,102,0.15)',
                            color: 'var(--accent-red)',
                            flexShrink: 0,
                            marginLeft: '8px',
                          }}>
                            {daysSince}d brak kontaktu
                          </span>
                        )}
                      </div>

                      {osoba.otwarteSrawy.length > 0 && (
                        <div style={{ marginTop: '8px' }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Otwarte sprawy:</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {osoba.otwarteSrawy.map((sprawa, i) => (
                              <span key={i} style={{
                                fontSize: '11px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: 'var(--bg-elevated)',
                                color: 'var(--text-secondary)',
                              }}>
                                {sprawa}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {daysSince !== null && (
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                          Ostatni kontakt: {daysSince === 0 ? 'dziś' : `${daysSince} dni temu`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function LudziePage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', color: 'var(--text-secondary)' }}>Ładowanie...</div>}>
      <LudzieContent />
    </Suspense>
  )
}
