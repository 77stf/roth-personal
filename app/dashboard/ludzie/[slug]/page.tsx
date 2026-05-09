export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { getOsobyProfile } from '@/lib/sheets'
import { readNote } from '@/lib/obsidian'
import { OBSIDIAN_FOLDERS } from '@/lib/constants'
import { notFound } from 'next/navigation'
import { AddNoteForm } from './AddNoteForm'

type PageProps = { params: Promise<{ slug: string }> }

async function OsobaContent({ slug }: { slug: string }) {
  const osoby = await getOsobyProfile()
  const osoba = osoby.find(o =>
    o.imie.toLowerCase().replace(/\s+/g, '-') === slug
  )

  if (!osoba) notFound()

  // Spróbuj pobrać notatkę z Obsidian
  const obsidianNote = await readNote(`${OBSIDIAN_FOLDERS.people}/${osoba.imie}.md`).catch(() => null)

  const today = new Date()
  const daysSince = osoba.ostatniKontakt
    ? Math.floor((today.getTime() - new Date(osoba.ostatniKontakt).getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>← Ludzie</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--bg-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
          }}>
            👤
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>{osoba.imie}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>{osoba.rola}</div>
          </div>
        </div>
      </div>

      {/* Kontakt info */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>Ostatni kontakt</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {daysSince === null ? 'Brak danych' : daysSince === 0 ? 'Dziś' : `${daysSince} dni temu — ${new Date(osoba.ostatniKontakt).toLocaleDateString('pl-PL')}`}
            </div>
          </div>
          {daysSince !== null && daysSince > 3 && (
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(255,51,102,0.15)',
              color: 'var(--accent-red)',
              border: '1px solid rgba(255,51,102,0.3)',
            }}>
              Odzew!
            </span>
          )}
        </div>
      </div>

      {/* Otwarte sprawy */}
      {osoba.otwarteSrawy.length > 0 && (
        <div className="card" style={{ marginBottom: '16px', borderLeft: '3px solid var(--accent-yellow)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Otwarte sprawy ({osoba.otwarteSrawy.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {osoba.otwarteSrawy.map((sprawa, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 8px',
                background: 'var(--bg-elevated)',
                borderRadius: '6px',
              }}>
                <span style={{ color: 'var(--accent-yellow)', fontSize: '12px' }}>•</span>
                <span style={{ fontSize: '13px' }}>{sprawa}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notatki z arkusza */}
      {osoba.notatki && (
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Notatki (Sheets)
          </div>
          <div style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
            {osoba.notatki}
          </div>
        </div>
      )}

      {/* Obsidian note */}
      {obsidianNote && (
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Plik Obsidian
          </div>
          <div style={{
            fontSize: '12px',
            lineHeight: 1.7,
            color: 'var(--text-secondary)',
            fontFamily: 'monospace',
            background: 'var(--bg-elevated)',
            padding: '10px',
            borderRadius: '8px',
            whiteSpace: 'pre-wrap',
            maxHeight: '400px',
            overflowY: 'auto',
          }}>
            {obsidianNote.substring(0, 2000)}{obsidianNote.length > 2000 ? '\n... (skrócono)' : ''}
          </div>
        </div>
      )}

      {/* Add note to Obsidian */}
      <AddNoteForm
        personName={osoba.imie}
        notePath={`${OBSIDIAN_FOLDERS.people}/${osoba.imie}.md`}
      />
    </div>
  )
}

export default async function OsobaPage({ params }: PageProps) {
  const { slug } = await params
  return (
    <Suspense fallback={<div style={{ padding: '40px', color: 'var(--text-secondary)' }}>Ładowanie...</div>}>
      <OsobaContent slug={slug} />
    </Suspense>
  )
}
