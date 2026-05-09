'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, Copy, Check, ExternalLink, AlertCircle, Terminal } from 'lucide-react'

interface Step {
  id: string
  category: string
  title: string
  desc: string
  code?: string
  link?: string
  done?: boolean
}

const STEPS: Step[] = [
  {
    id: 'vercel-env',
    category: 'Vercel',
    title: 'Zmienne środowiskowe — Vercel',
    desc: 'Wejdź: vercel.com → projekt → Settings → Environment Variables → dodaj wszystkie poniższe. Dotyczy zarówno Production jak i Preview.',
    link: 'https://vercel.com/dashboard',
    code: `ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_CLIENT_ID=993772695583-...
GOOGLE_CLIENT_SECRET=...
GOOGLE_SHEETS_ID=1oFmJSiH5X7Hkow...
GOOGLE_REFRESH_TOKEN=1//...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
TELEGRAM_WEBHOOK_SECRET=roth-secret-2026
CRON_SECRET=roth-cron-2026-secure
OPENWEATHER_API_KEY=...
OBSIDIAN_API_KEY=...
OBSIDIAN_PORT=27124
ROTH_PASSCODE=twoj-kod
ROTH_SESSION_SECRET=dluga-losowa-stringa-min-32-znaki
MAKE_ERROR_WEBHOOK_URL=(opcjonalnie — alerty błędów)`,
  },
  {
    id: 'telegram-webhook',
    category: 'Telegram',
    title: 'Ustaw webhook Telegram',
    desc: 'Po wgraniu env i deploymencie — wklej poniższy URL w przeglądarkę (zastąp TOKEN i APP_URL). Secret token musi być identyczny jak TELEGRAM_WEBHOOK_SECRET.',
    code: `# Ustaw webhook (wklej w przeglądarkę):
https://api.telegram.org/bot{TOKEN}/setWebhook?url=https://{APP}.vercel.app/api/telegram/webhook&secret_token=roth-secret-2026

# Sprawdź status:
https://api.telegram.org/bot{TOKEN}/getWebhookInfo

# Oczekiwany wynik: "url": "https://...", "pending_update_count": 0`,
  },
  {
    id: 'sheets-setup',
    category: 'Google Sheets',
    title: 'Utwórz arkusze — POST /api/system/setup',
    desc: 'Endpoint setup automatycznie tworzy brakujące arkusze i wpisuje nagłówki. Wymaga CRON_SECRET. Wywołaj po pierwszym deploymencie.',
    code: `# W terminalu lub Postman:
curl -X POST https://{APP}.vercel.app/api/system/setup \\
  -H "x-cron-secret: roth-cron-2026-secure"

# Lub przez przeglądarkę (zalogowany):
# GET /dashboard/system → zielone health checks = OK

# Arkusze tworzone automatycznie:
# STREAKI (nawyk, count, best, lastDate)
# SYSTEM_LOG (timestamp, level, source, message)
# + weryfikacja 26 istniejących arkuszy`,
  },
  {
    id: 'make-cron',
    category: 'Make.com',
    title: 'Scenariusze CRON — briefy',
    desc: 'Stwórz 3 scenariusze HTTP w Make.com. Każdy wysyła POST z nagłówkiem x-cron-secret.',
    link: 'https://make.com',
    code: `Scenariusz 1: Morning Brief
  Trigger: Schedule → 07:00 każdy dzień (pon-pt)
  Action: HTTP → POST https://{APP}/api/briefings/morning
  Headers: x-cron-secret: roth-cron-2026-secure

Scenariusz 2: Evening Brief
  Trigger: Schedule → 20:00 każdy dzień
  Action: HTTP → POST https://{APP}/api/briefings/evening
  Headers: x-cron-secret: roth-cron-2026-secure

Scenariusz 3: Water Reminder (opcjonalne)
  Trigger: Schedule → co 2h (9:00-21:00)
  Action: Telegram sendMessage do {CHAT_ID}`,
  },
  {
    id: 'github-actions',
    category: 'GitHub',
    title: 'GitHub Actions — sleep brief 23:00',
    desc: 'W repo → Settings → Secrets → Actions → dodaj CRON_SECRET. Workflow (.github/workflows/sleep-brief.yml) wysyła brief przed snem każdej nocy.',
    link: 'https://github.com',
    code: `# Secret name: CRON_SECRET
# Secret value: roth-cron-2026-secure

# Workflow wysyła:
POST /api/briefings/sleep
Header: x-cron-secret: {secret}
Schedule: "0 21 * * *" (23:00 CET = 21:00 UTC)

# Sprawdź w: repo → Actions → sleep-brief`,
  },
  {
    id: 'obsidian-plugin',
    category: 'Obsidian',
    title: 'Obsidian Local REST API plugin',
    desc: 'Plugin umożliwia agentom czytanie i pisanie notatek (lokalnie). Potrzebne do profili ludzi, wiki OFM, decyzji. Działa tylko gdy Obsidian jest otwarty na komputerze.',
    link: 'obsidian://show-plugin?id=local-rest-api',
    code: `1. Obsidian → Settings → Community Plugins → Browse
2. Wyszukaj "Local REST API" → Install → Enable
3. Settings → Local REST API:
   Port: 27124
   API Key: [skopiuj]

4. Dodaj do .env.local:
   OBSIDIAN_API_KEY=[skopiowany klucz]
   OBSIDIAN_PORT=27124

5. Upewnij się że struktura folderów istnieje:
   00_INBOX / 01_People / 02_Projects
   03_Knowledge / 05_Ideas / 06_Decisions / 07_Daily_Notes`,
  },
  {
    id: 'test-system',
    category: 'Test',
    title: 'Weryfikacja — health check + /brief',
    desc: 'Po wykonaniu powyższych kroków sprawdź czy system działa. Wszystkie 4 health checki powinny być zielone.',
    code: `# 1. Sprawdź health:
GET https://{APP}/api/system/health
Oczekiwany: { "status": "ok" }

# 2. Wyślij /brief w Telegram
# Oczekiwany: kompletny brief dnia

# 3. Dashboard → /dashboard/system
# Oczekiwany: 4 zielone status doty

# 4. Wypełnij dane startowe w Sheets:
# OSOBY_PROFILE — dodaj pierwszą osobę
# OFM_PROJECTS — dodaj Azul dane
# FINANSE_PRZYCHODY — wpisz pierwsze przychody
# Używaj /streak silownia /streak woda codziennie`,
  },
  {
    id: 'done-plansection',
    category: 'Gotowe',
    title: '✅ Zbudowane w sesjach 1-9',
    desc: '11 stron dashboard (light mode), 15+ API routes, 20 komend Telegram, Google Sheets 26 arkuszy, System Map, Obsidian interaktywny, Water quick actions, OFM Azul agents, Streaki, Scoring dnia, Transport Konarskie→Śrem.',
    done: true,
  },
]

export default function DeployPage() {
  const [doneSet, setDoneSet] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['vercel-env']))

  function toggle(id: string) {
    setDoneSet(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function copy(text: string, id: string) {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const completed = doneSet.size + STEPS.filter(s => s.done).length
  const total = STEPS.length
  const pct = Math.round((completed / total) * 100)

  const CATEGORY_COLORS: Record<string, string> = {
    Vercel: '#1D1D1F',
    Telegram: '#007AFF',
    'Google Sheets': '#34C759',
    'Make.com': '#FF6B35',
    GitHub: '#6E6E73',
    Obsidian: '#8B5CF6',
    Test: '#FF9500',
    Gotowe: '#34C759',
  }

  return (
    <div style={{ padding: '24px 20px', maxWidth: '780px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
          System · Wdrożenie
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', lineHeight: 1.2 }}>
          Deployment Checklist
        </h1>

        {/* Progress */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ height: '6px', background: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                width: `${pct}%`, height: '100%', borderRadius: '3px',
                background: pct === 100 ? 'var(--accent-green)' : 'linear-gradient(90deg, var(--accent-blue), var(--accent-purple))',
                transition: 'width 0.4s ease',
              }} />
            </div>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
            {completed}/{total}
            {pct === 100 && <span style={{ color: 'var(--accent-green)', marginLeft: '6px' }}>Gotowe!</span>}
          </div>
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {STEPS.map(step => {
          const isDone = step.done || doneSet.has(step.id)
          const isExpanded = expanded.has(step.id)
          const catColor = CATEGORY_COLORS[step.category] ?? '#6E6E73'

          return (
            <div key={step.id} style={{
              background: isDone ? 'rgba(52,199,89,0.04)' : '#FFFFFF',
              border: `1px solid ${isDone ? 'rgba(52,199,89,0.2)' : 'var(--border)'}`,
              borderRadius: '12px',
              overflow: 'hidden',
            }}>
              {/* Header row */}
              <div
                style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', cursor: 'pointer' }}
                onClick={() => !step.done && toggleExpand(step.id)}
              >
                {/* Checkbox */}
                <button
                  onClick={e => { e.stopPropagation(); !step.done && toggle(step.id) }}
                  style={{
                    width: '20px', height: '20px', borderRadius: '5px', flexShrink: 0,
                    background: isDone ? 'rgba(52,199,89,0.15)' : 'var(--bg-elevated)',
                    border: `1.5px solid ${isDone ? 'rgba(52,199,89,0.4)' : 'var(--border)'}`,
                    cursor: step.done ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginTop: '1px',
                  }}
                >
                  {isDone && <CheckCircle2 size={13} color="#34C759" />}
                </button>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                    <span style={{
                      fontSize: '9px', fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.07em', padding: '2px 6px', borderRadius: '4px',
                      background: `${catColor}12`, color: catColor, flexShrink: 0,
                    }}>
                      {step.category}
                    </span>
                    <span style={{
                      fontSize: '13px', fontWeight: 700,
                      color: isDone ? 'var(--text-secondary)' : 'var(--text-primary)',
                      textDecoration: isDone ? 'line-through' : 'none',
                    }}>
                      {step.title}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {step.desc}
                  </div>
                </div>

                {step.link && (
                  <a
                    href={step.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '5px 10px', borderRadius: '7px', fontSize: '11px', fontWeight: 600,
                      background: `${catColor}10`, border: `1px solid ${catColor}25`,
                      color: catColor, textDecoration: 'none', flexShrink: 0,
                    }}
                  >
                    Otwórz <ExternalLink size={10} />
                  </a>
                )}
              </div>

              {/* Code block */}
              {step.code && (isExpanded || step.done) && (
                <div style={{ padding: '0 16px 14px' }}>
                  <div style={{ position: 'relative' }}>
                    <pre style={{
                      margin: 0, padding: '12px 14px', borderRadius: '8px',
                      background: '#1D1D1F', border: '1px solid rgba(255,255,255,0.08)',
                      fontSize: '11px', color: '#E8E8ED',
                      fontFamily: 'ui-monospace, "JetBrains Mono", monospace', lineHeight: 1.65,
                      overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                    }}>
                      {step.code}
                    </pre>
                    <button
                      onClick={() => copy(step.code!, step.id)}
                      style={{
                        position: 'absolute', top: '8px', right: '8px',
                        padding: '4px 10px', borderRadius: '5px', fontSize: '10px', fontWeight: 700,
                        background: copied === step.id ? 'rgba(52,199,89,0.2)' : 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: copied === step.id ? '#34C759' : 'rgba(255,255,255,0.6)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                      }}
                    >
                      {copied === step.id ? <><Check size={10} /> Skopiowano</> : <><Copy size={10} /> Kopiuj</>}
                    </button>
                  </div>
                </div>
              )}

              {/* Expand hint */}
              {step.code && !isExpanded && !step.done && (
                <div
                  style={{ padding: '0 16px 12px', cursor: 'pointer' }}
                  onClick={() => toggleExpand(step.id)}
                >
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    fontSize: '11px', color: 'var(--text-secondary)',
                    padding: '4px 8px', background: 'var(--bg-elevated)', borderRadius: '6px',
                  }}>
                    <Terminal size={11} />
                    Pokaż komendy
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bottom note */}
      <div style={{
        marginTop: '20px', padding: '14px 16px', borderRadius: '10px',
        background: 'rgba(0,122,255,0.06)', border: '1px solid rgba(0,122,255,0.15)',
        fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6,
      }}>
        <span style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>System Map</span>
        {' '}→ <a href="/dashboard/system" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>/dashboard/system</a>
        {' '}pokazuje real-time status wszystkich połączeń.
        {' '}Pytania w Telegram: wyślij dowolny tekst → Master Agent odpowie.
      </div>
    </div>
  )
}
