// ROTH Personal OS — Deployment Guide
// /dashboard/deploy — interaktywna checklista wdrożenia

'use client'

import { useState } from 'react'

interface Step {
  id: string
  title: string
  desc: string
  action: string
  code?: string
  link?: string
  done?: boolean
}

const STEPS: Step[] = [
  {
    id: 'vercel-env',
    title: '1. Dodaj env vars na Vercel',
    desc: 'Wejdź na vercel.com → Twój projekt → Settings → Environment Variables → dodaj każdą zmienną.',
    action: 'Otwórz Vercel',
    link: 'https://vercel.com/dashboard',
    code: `ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_CLIENT_ID=993772695583-...
GOOGLE_CLIENT_SECRET=...
GOOGLE_SHEETS_ID=1oFmJSiH5X7Hkow...
GOOGLE_REFRESH_TOKEN=1//...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
TELEGRAM_WEBHOOK_SECRET=roth-secret-2026
OPENWEATHER_API_KEY=...
OBSIDIAN_API_KEY=...
OBSIDIAN_PORT=27124
ROTH_PASSCODE=twoj-kod
ROTH_SESSION_SECRET=dluga-losowa-stringa
MAKE_ERROR_WEBHOOK_URL=(opcjonalnie)`
  },
  {
    id: 'telegram-webhook',
    title: '2. Ustaw webhook Telegrama',
    desc: 'Po wgraniu env vars i deploymencie — wklej URL w przeglądarkę (zastąp TOKEN i APP_URL).',
    action: 'Skopiuj URL',
    code: `https://api.telegram.org/bot{TWOJ_TOKEN}/setWebhook?url=https://{APP_URL}/api/telegram/webhook&secret_token=roth-secret-2026

# Sprawdzenie:
https://api.telegram.org/bot{TWOJ_TOKEN}/getWebhookInfo`
  },
  {
    id: 'test-briefing',
    title: '3. Przetestuj briefing poranny',
    desc: 'Po ustawieniu webhooków — przetestuj czy briefing działa. Wyślij do Telegrama /brief lub wejdź w URL:',
    action: 'Test briefing',
    code: `# W przeglądarce (zalogowany):
https://{APP_URL}/api/briefings/morning

# Lub w Telegram wyślij:
/brief`
  },
  {
    id: 'make-cron',
    title: '4. Skonfiguruj Make.com — cron jobs',
    desc: 'Stwórz 3 podstawowe scenariusze w Make.com (darmowy plan wystarczy):',
    action: 'Otwórz Make.com',
    link: 'https://make.com',
    code: `Scenariusz 1: Briefing poranny
  Trigger: Schedule → 06:45 każdy dzień
  Action: HTTP → POST https://{APP_URL}/api/briefings/morning

Scenariusz 2: Briefing wieczorny
  Trigger: Schedule → 21:30 każdy dzień
  Action: HTTP → POST https://{APP_URL}/api/briefings/evening

Scenariusz 3: Water reminder
  Trigger: Schedule → co 2h (9:00-21:00)
  Action: HTTP → POST https://{APP_URL}/api/water`
  },
  {
    id: 'make-wakeup',
    title: '5. Wake-up alarm w Make.com',
    desc: 'System alarmów przez Telegram — 2 wiadomości przed szkołą:',
    action: 'Konfiguruj',
    code: `Scenariusz: Wake-up Alarm
  Trigger: Schedule → 06:15 pon-pt
  Action: HTTP → POST https://api.telegram.org/bot{TOKEN}/sendMessage
  Body: {
    "chat_id": "{CHAT_ID}",
    "text": "⏰ Wstawaj! Bus za 39 min (07:09). Sprawdź /brief na dniu.",
    "parse_mode": "Markdown"
  }

Scenariusz: Final Alarm
  Trigger: Schedule → 06:25 pon-pt
  Action: To samo + "OSTATNIE WEZWANIE 🚨"`
  },
  {
    id: 'plan-lekcji',
    title: '✅ Plan lekcji — GOTOWE',
    desc: '33 lekcje wgrane do Google Sheets (PLAN_LEKCJI). Smart parser działa — wyślij /kartkowka fizyka jutro.',
    action: 'Już zrobione',
    done: true,
  },
  {
    id: 'obsidian-plugin',
    title: '6. Zainstaluj Obsidian Local REST API',
    desc: 'Plugin pozwala agentom czytać i pisać do Twojego vaultu (tylko lokalnie):',
    action: 'Pobierz plugin',
    link: 'obsidian://show-plugin?id=local-rest-api',
    code: `1. Obsidian → Settings → Community Plugins → Browse
2. Wyszukaj "Local REST API"
3. Install → Enable
4. Settings → Local REST API:
   - Port: 27124
   - API Key: skopiuj i wpisz jako OBSIDIAN_API_KEY w .env.local i Vercel`
  },
]

export default function DeployPage() {
  const [done, setDone] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState<string | null>(null)

  function toggle(id: string) {
    setDone(prev => {
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

  const completedCount = done.size + STEPS.filter(s => s.done).length
  const totalCount = STEPS.length
  const percent = Math.round((completedCount / totalCount) * 100)

  return (
    <div style={{ padding: '24px 20px', maxWidth: '760px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
          System · Wdrożenie
        </div>
        <div style={{ fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
          Deployment Checklist
        </div>

        {/* Progress bar */}
        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '8px', height: '6px', marginBottom: '8px' }}>
          <div style={{
            width: `${percent}%`, height: '100%', borderRadius: '8px',
            background: percent === 100
              ? 'linear-gradient(90deg, #22c55e, #4ade80)'
              : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
            transition: 'width 0.4s ease',
          }} />
        </div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
          {completedCount} / {totalCount} kroków · {percent}%
          {percent === 100 && ' 🎉 System gotowy!'}
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {STEPS.map(step => {
          const isDone = step.done || done.has(step.id)
          return (
            <div key={step.id} style={{
              borderRadius: '14px',
              background: isDone ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.04)',
              border: isDone ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(255,255,255,0.08)',
              overflow: 'hidden',
            }}>
              {/* Step header */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px',
                padding: '16px 20px',
              }}>
                {/* Checkbox */}
                <button
                  onClick={() => !step.done && toggle(step.id)}
                  style={{
                    width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
                    background: isDone ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)',
                    border: isDone ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.15)',
                    cursor: step.done ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px',
                    color: '#22c55e',
                  }}
                >
                  {isDone ? '✓' : ''}
                </button>

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '14px', fontWeight: 700,
                    color: isDone ? 'rgba(255,255,255,0.6)' : '#fff',
                    textDecoration: isDone ? 'line-through' : 'none',
                    marginBottom: '4px',
                  }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                    {step.desc}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  {step.link && (
                    <a
                      href={step.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 600,
                        background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                        color: '#818cf8', textDecoration: 'none',
                      }}
                    >
                      {step.action} ↗
                    </a>
                  )}
                </div>
              </div>

              {/* Code block */}
              {step.code && (
                <div style={{ padding: '0 20px 16px' }}>
                  <div style={{ position: 'relative' }}>
                    <pre style={{
                      margin: 0, padding: '14px 16px', borderRadius: '10px',
                      background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)',
                      fontSize: '11px', color: 'rgba(255,255,255,0.7)',
                      fontFamily: 'ui-monospace, monospace', lineHeight: 1.6,
                      overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                    }}>
                      {step.code}
                    </pre>
                    <button
                      onClick={() => copy(step.code!, step.id)}
                      style={{
                        position: 'absolute', top: '8px', right: '8px',
                        padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 600,
                        background: copied === step.id ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: copied === step.id ? '#22c55e' : 'rgba(255,255,255,0.5)',
                        cursor: 'pointer',
                      }}
                    >
                      {copied === step.id ? 'Skopiowano!' : 'Kopiuj'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bottom hint */}
      <div style={{
        marginTop: '24px', padding: '16px', borderRadius: '12px',
        background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
        fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6,
      }}>
        <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Pytania?</strong> Napisz w Telegram /brief po konfiguracji — system odpowie pierwszym briefingiem.
        Lub sprawdź <a href="/dashboard/system" style={{ color: '#818cf8' }}>System Dashboard</a> dla statusu health checks.
      </div>
    </div>
  )
}
