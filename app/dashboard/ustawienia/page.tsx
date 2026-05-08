'use client'

import { useState, useEffect } from 'react'

interface EnvStatus {
  key: string
  label: string
  set: boolean
  critical: boolean
}

const ENV_VARS: EnvStatus[] = [
  { key: 'ANTHROPIC_API_KEY', label: 'Claude AI (Anthropic)', set: false, critical: true },
  { key: 'GOOGLE_CLIENT_ID', label: 'Google OAuth', set: false, critical: true },
  { key: 'GOOGLE_SHEETS_ID', label: 'Google Sheets ID', set: false, critical: true },
  { key: 'GOOGLE_REFRESH_TOKEN', label: 'Google Refresh Token', set: false, critical: true },
  { key: 'TELEGRAM_BOT_TOKEN', label: 'Telegram Bot Token', set: false, critical: true },
  { key: 'TELEGRAM_CHAT_ID', label: 'Telegram Chat ID', set: false, critical: true },
  { key: 'OPENWEATHER_API_KEY', label: 'OpenWeather API', set: false, critical: false },
  { key: 'OBSIDIAN_API_KEY', label: 'Obsidian Local REST API', set: false, critical: false },
  { key: 'ROTH_PASSCODE', label: 'Passcode logowania', set: false, critical: true },
]

interface Integration {
  id: string
  icon: string
  name: string
  tagline: string
  color: string
  statusKey?: string
  what: string
  capabilities: string[]
  cheatsheet: { label: string; value: string }[]
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'claude',
    icon: '🤖',
    name: 'Claude AI',
    tagline: 'Briefings · Idea Lab · AI',
    color: '#cc785c',
    statusKey: 'ANTHROPIC_API_KEY',
    what: 'Anthropic Claude generuje poranne/wieczorne/pre-sleep briefingi, odpowiada na pytania w Idea Lab i przetwarza kontekst z całego systemu.',
    capabilities: [
      'Poranny briefing o 6:45 — plan dnia, pogoda, zadania',
      'Wieczorny briefing o 21:30 — podsumowanie, jutro',
      'Pre-sleep o 23:00 — refleksja + sen',
      'Idea Lab — brainstorming i analiza pomysłów',
      'Kontekst z Google Sheets + Calendar',
    ],
    cheatsheet: [
      { label: 'Model', value: 'claude-sonnet-4-6' },
      { label: 'Morning', value: 'POST /api/briefings/morning' },
      { label: 'Evening', value: 'POST /api/briefings/evening' },
      { label: 'Sleep', value: 'POST /api/briefings/sleep' },
      { label: 'Idea Lab', value: 'POST /api/idea-lab' },
    ],
  },
  {
    id: 'sheets',
    icon: '📊',
    name: 'Google Sheets',
    tagline: 'Baza danych · 22 arkusze',
    color: '#0f9d58',
    statusKey: 'GOOGLE_REFRESH_TOKEN',
    what: 'Google Sheets to główna baza danych systemu. 22 arkusze przechowują wszystko — od planu lekcji po finanse i projekty OFM.',
    capabilities: [
      'Plan lekcji i zastępstwa',
      'Tracker finansów (przychody, wydatki, budżet, cele)',
      'Projekty OFM i AI Consulting',
      'Logi treningów, prania, sprzątania',
      'Water tracker, screen time, cytaty',
    ],
    cheatsheet: [
      { label: 'Read sheet', value: 'GET /api/sheets/[SHEET_NAME]' },
      { label: 'Write row', value: 'POST /api/sheets/[SHEET_NAME]' },
      { label: 'Arkusze', value: '22 arkusze (PLAN_LEKCJI, FINANSE_*, PROJEKTY_*, ...)' },
      { label: 'Auth', value: 'OAuth2 refresh token' },
    ],
  },
  {
    id: 'calendar',
    icon: '📅',
    name: 'Google Calendar',
    tagline: 'Kalendarz · Read-only',
    color: '#4285f4',
    statusKey: 'GOOGLE_REFRESH_TOKEN',
    what: 'Google Calendar (read-only) dostarcza wydarzenia na dziś i jutro do briefingów. Claude wie co masz zaplanowane.',
    capabilities: [
      'Pobieranie wydarzeń na dziś i jutro',
      'Zasilanie kontekstu briefingów',
      'Wykrywanie konfliktów w planie',
    ],
    cheatsheet: [
      { label: 'Scope', value: 'calendar.readonly' },
      { label: 'Used in', value: 'lib/calendar.ts' },
      { label: 'Auth', value: 'OAuth2 (shared z Sheets)' },
    ],
  },
  {
    id: 'telegram',
    icon: '✈️',
    name: 'Telegram Bot',
    tagline: 'Powiadomienia · Komendy',
    color: '#229ed9',
    statusKey: 'TELEGRAM_BOT_TOKEN',
    what: 'Telegram Bot wysyła briefingi, przypomnienia i alerty. Możesz też wysyłać komendy z telefonu żeby wyzwolić akcje w systemie.',
    capabilities: [
      'Otrzymywanie briefingów rannych i wieczornych',
      'Water tracker — przypomnienia co 2h',
      'Webhook do obsługi komend',
      'Alerty systemowe (błędy, statusy)',
    ],
    cheatsheet: [
      { label: 'Webhook', value: 'POST /api/telegram/webhook' },
      { label: 'Send msg', value: 'lib/telegram.ts → sendMessage()' },
      { label: 'Set webhook', value: 'api.telegram.org/bot{TOKEN}/setWebhook' },
      { label: 'Secret', value: 'TELEGRAM_WEBHOOK_SECRET w nagłówku' },
    ],
  },
  {
    id: 'obsidian',
    icon: '🔮',
    name: 'Obsidian',
    tagline: 'Vault · Wiki · Notatki',
    color: '#7b2d8b',
    statusKey: 'OBSIDIAN_API_KEY',
    what: 'Obsidian przez Local REST API pozwala Claude czytać i pisać do Twojego vaultu. Wiedza z notatek zasila kontekst AI.',
    capabilities: [
      'Odczyt notatek z vaultu do kontekstu Claude',
      'Zapis nowych notatek (wiki, briefing notes)',
      'wiki/hot.md — kontekst z ostatniej sesji',
      'claude-obsidian: /wiki, /wiki-ingest, /wiki-query',
    ],
    cheatsheet: [
      { label: 'API', value: 'GET/POST /api/obsidian' },
      { label: 'Port', value: '27124 (Local REST API plugin)' },
      { label: 'Vault', value: 'roth-personal-obsidian-vault/' },
      { label: 'Skills', value: '/wiki /wiki-ingest /wiki-query /wiki-lint' },
    ],
  },
  {
    id: 'weather',
    icon: '🌤️',
    name: 'OpenWeather',
    tagline: 'Pogoda · Śrem',
    color: '#f59e0b',
    statusKey: 'OPENWEATHER_API_KEY',
    what: 'OpenWeather API dostarcza aktualną pogodę i prognozę dla Śremu do briefingów Claude.',
    capabilities: [
      'Temperatura, odczuwalna, zachmurzenie',
      'Prognoza na dziś',
      'Dane do briefingów (odzież, aktywność)',
    ],
    cheatsheet: [
      { label: 'API', value: 'GET /api/weather (lib/weather.ts)' },
      { label: 'Lokalizacja', value: 'Śrem (51.9333, 17.0167)' },
      { label: 'Plan', value: 'Free tier (60 req/min)' },
    ],
  },
  {
    id: 'make',
    icon: '⚙️',
    name: 'Make.com',
    tagline: 'Automatyzacje · 17 scenariuszy',
    color: '#6c47ff',
    what: 'Make.com wyzwala endpointy systemu według harmonogramu — briefingi, water tracker, logi, automatyzacje OFM.',
    capabilities: [
      'Cron 6:45 → briefing poranny',
      'Cron 21:30 → briefing wieczorny',
      'Cron 23:00 → pre-sleep',
      'Co 2h (9-21) → water tracker',
      '17 scenariuszy automatyzacji',
    ],
    cheatsheet: [
      { label: 'Morning', value: 'POST {APP_URL}/api/briefings/morning' },
      { label: 'Evening', value: 'POST {APP_URL}/api/briefings/evening' },
      { label: 'Sleep', value: 'POST {APP_URL}/api/briefings/sleep' },
      { label: 'Water', value: 'POST {APP_URL}/api/water' },
    ],
  },
  {
    id: 'vercel',
    icon: '▲',
    name: 'Vercel',
    tagline: 'Deployment · Edge · CDN',
    color: '#ffffff',
    what: 'Vercel hostuje ROTH Personal OS. Każdy push na master = automatyczny deployment. Edge runtime dla middleware.',
    capabilities: [
      'Auto-deploy z git push',
      'Edge middleware (auth)',
      'Env vars management',
      'Preview deployments',
    ],
    cheatsheet: [
      { label: 'URL', value: 'roth-personal.vercel.app' },
      { label: 'Framework', value: 'Next.js 15 (App Router)' },
      { label: 'Region', value: 'fra1 (Frankfurt)' },
      { label: 'Env vars', value: 'Settings → Environment Variables' },
    ],
  },
]

export default function UstawieniaPage() {
  const [envStatus, setEnvStatus] = useState<EnvStatus[]>(ENV_VARS)
  const [envMap, setEnvMap] = useState<Record<string, boolean>>({})
  const [obsidianConnected, setObsidianConnected] = useState<boolean | null>(null)
  const [telegramWebhookUrl, setTelegramWebhookUrl] = useState('')
  const [selected, setSelected] = useState<Integration | null>(null)

  useEffect(() => {
    checkEnvStatus()
    checkObsidian()
    const appUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? window.location.origin
    setTelegramWebhookUrl(`${appUrl}/api/telegram/webhook`)
  }, [])

  async function checkEnvStatus() {
    try {
      const res = await fetch('/api/system/env-status')
      if (res.ok) {
        const data = await res.json() as { vars: Record<string, boolean> }
        setEnvMap(data.vars)
        setEnvStatus(prev => prev.map(v => ({ ...v, set: data.vars[v.key] ?? false })))
      }
    } catch { /* silently fail */ }
  }

  async function checkObsidian() {
    try {
      const res = await fetch('/api/obsidian')
      const data = await res.json() as { connected: boolean }
      setObsidianConnected(data.connected)
    } catch {
      setObsidianConnected(false)
    }
  }

  function getIntegrationStatus(integration: Integration): 'ok' | 'warn' | 'error' | 'unknown' {
    if (integration.id === 'obsidian') {
      if (obsidianConnected === null) return 'unknown'
      // Obsidian nie działa na Vercel — to normalny stan (warn, nie error)
      return obsidianConnected ? 'ok' : 'warn'
    }
    if (integration.id === 'make' || integration.id === 'vercel') return 'ok'
    if (!integration.statusKey) return 'ok'
    if (Object.keys(envMap).length === 0) return 'unknown'
    return envMap[integration.statusKey] ? 'ok' : 'error'
  }

  const criticalMissing = envStatus.filter(v => v.critical && !v.set)
  const allCriticalSet = criticalMissing.length === 0

  return (
    <div style={{ padding: '20px', maxWidth: '860px' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>System</div>
        <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>Ustawienia</div>
      </div>

      {/* ─── INTEGRACJE ─── */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          fontSize: '12px',
          color: 'var(--text-secondary)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '14px',
        }}>
          Integracje systemu
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '10px',
        }}>
          {INTEGRATIONS.map(integration => {
            const status = getIntegrationStatus(integration)
            return (
              <button
                key={integration.id}
                onClick={() => setSelected(integration)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 0.15s, transform 0.1s',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = integration.color
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'
                }}
              >
                {/* Status dot */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: status === 'ok' ? 'var(--accent-green)' : status === 'warn' ? 'var(--accent-yellow)' : status === 'error' ? 'var(--accent-red)' : 'var(--text-muted)',
                  boxShadow: status === 'ok' ? '0 0 6px var(--accent-green)' : status === 'warn' ? '0 0 4px var(--accent-yellow)' : status === 'error' ? '0 0 6px var(--accent-red)' : 'none',
                }} />

                {/* Icon */}
                <div style={{
                  fontSize: '28px',
                  marginBottom: '10px',
                  filter: integration.id === 'vercel' ? 'invert(1)' : 'none',
                }}>
                  {integration.icon}
                </div>

                {/* Name */}
                <div style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '4px',
                }}>
                  {integration.name}
                </div>

                {/* Tagline */}
                <div style={{
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.4,
                }}>
                  {integration.tagline}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── ENV STATUS ─── */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Status zmiennych środowiskowych
        </div>

        {!allCriticalSet && Object.keys(envMap).length > 0 && (
          <div style={{
            padding: '10px 12px',
            background: 'rgba(255,51,102,0.1)',
            border: '1px solid rgba(255,51,102,0.3)',
            borderRadius: '8px',
            fontSize: '12px',
            color: 'var(--accent-red)',
            marginBottom: '12px',
          }}>
            ⚠️ {criticalMissing.length} krytycznych zmiennych brakuje
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {envStatus.map(v => (
            <div key={v.key} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 8px',
              background: 'var(--bg-elevated)',
              borderRadius: '6px',
            }}>
              <div>
                <span style={{ fontSize: '13px' }}>{v.label}</span>
                {v.critical && (
                  <span style={{ fontSize: '10px', color: 'var(--accent-red)', marginLeft: '6px' }}>KRYTYCZNE</span>
                )}
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: v.set ? 'var(--accent-green)' : Object.keys(envMap).length === 0 ? 'var(--text-secondary)' : 'var(--accent-red)',
              }}>
                {Object.keys(envMap).length === 0 ? '...' : v.set ? '✅ OK' : '❌ BRAK'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── OBSIDIAN ─── */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>Obsidian Local REST API</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Port: 27124 · Wymaga zainstalowanej wtyczki
            </div>
          </div>
          <span style={{
            fontSize: '12px',
            fontWeight: 700,
            color: obsidianConnected === null ? 'var(--text-secondary)' : obsidianConnected ? 'var(--accent-green)' : 'var(--accent-red)',
          }}>
            {obsidianConnected === null ? '...' : obsidianConnected ? '✅ Połączony' : '❌ Brak'}
          </span>
        </div>
      </div>

      {/* ─── TELEGRAM ─── */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Telegram Webhook URL</div>
        <div style={{
          padding: '8px 10px',
          background: 'var(--bg-elevated)',
          borderRadius: '6px',
          fontSize: '11px',
          fontFamily: 'monospace',
          color: 'var(--accent-blue)',
          wordBreak: 'break-all',
        }}>
          https://api.telegram.org/bot&#123;TOKEN&#125;/setWebhook?url={telegramWebhookUrl}&secret_token=&#123;TELEGRAM_WEBHOOK_SECRET&#125;
        </div>
      </div>

      {/* ─── SHEETS ─── */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Google Sheets — 22 arkusze</div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '4px',
        }}>
          {[
            'PLAN_LEKCJI', 'ROZKLAD_BUSOW', 'ZASTEPSTWA_LINKI', 'SPRAWDZIANY',
            'LEKI_AKTYWNE', 'LEKI_HISTORIA', 'RZECZY_CODZIENNE',
            'FINANSE_PRZYCHODY', 'FINANSE_WYDATKI', 'FINANSE_BUDZET', 'FINANSE_CELE',
            'PROJEKTY_OFM', 'PROJEKTY_AI', 'OSOBY_PROFILE',
            'PRANIE_LOG', 'SPRZATANIE_LOG', 'TRENINGI_LOG', 'WYJAZDY_PAKOWANIE',
            'WATER_TRACKER', 'SCREEN_TIME_LOG', 'CYTATY', 'USTAWIENIA',
          ].map(sheet => (
            <div key={sheet} style={{
              fontSize: '10px',
              fontFamily: 'monospace',
              padding: '3px 6px',
              background: 'var(--bg-elevated)',
              borderRadius: '4px',
              color: 'var(--text-secondary)',
            }}>
              {sheet}
            </div>
          ))}
        </div>
      </div>

      {/* ─── MAKE ─── */}
      <div className="card">
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Make.com — triggery</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            { name: 'Poranny Brief', endpoint: '/api/briefings/morning', trigger: 'Cron 6:45' },
            { name: 'Wieczorny Brief', endpoint: '/api/briefings/evening', trigger: 'Cron 21:30' },
            { name: 'Pre-Sleep', endpoint: '/api/briefings/sleep', trigger: 'Cron 23:00' },
            { name: 'Water Tracker', endpoint: '/api/water', trigger: 'Cron co 2h (9-21)' },
          ].map(item => (
            <div key={item.name} style={{
              padding: '6px 10px',
              background: 'var(--bg-elevated)',
              borderRadius: '6px',
              fontSize: '12px',
            }}>
              <div style={{ fontWeight: 600, marginBottom: '2px' }}>{item.name}</div>
              <div style={{ fontFamily: 'monospace', color: 'var(--accent-blue)', fontSize: '11px' }}>
                POST {telegramWebhookUrl.replace('/api/telegram/webhook', item.endpoint)}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '2px' }}>
                {item.trigger}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── MODAL ─── */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: '0',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-surface)',
              borderRadius: '20px 20px 0 0',
              padding: '24px 20px 40px',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '85vh',
              overflowY: 'auto',
              borderTop: `3px solid ${selected.color}`,
            }}
          >
            {/* Handle */}
            <div style={{
              width: '36px',
              height: '4px',
              background: 'var(--border)',
              borderRadius: '2px',
              margin: '0 auto 20px',
            }} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div style={{ fontSize: '40px' }}>{selected.icon}</div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 700 }}>{selected.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {selected.tagline}
                </div>
              </div>
            </div>

            {/* What it does */}
            <div style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '20px',
              padding: '12px',
              background: 'var(--bg-elevated)',
              borderRadius: '10px',
            }}>
              {selected.what}
            </div>

            {/* Capabilities */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-secondary)',
                marginBottom: '8px',
              }}>
                Co robi
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selected.capabilities.map((cap, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    fontSize: '13px',
                  }}>
                    <span style={{ color: selected.color, marginTop: '1px', flexShrink: 0 }}>▸</span>
                    <span>{cap}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cheatsheet */}
            <div>
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-secondary)',
                marginBottom: '8px',
              }}>
                Ściąga
              </div>
              <div style={{
                background: 'var(--bg-elevated)',
                borderRadius: '10px',
                overflow: 'hidden',
              }}>
                {selected.cheatsheet.map((item, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '9px 12px',
                    borderBottom: i < selected.cheatsheet.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    alignItems: 'flex-start',
                  }}>
                    <div style={{
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      minWidth: '80px',
                      flexShrink: 0,
                      marginTop: '1px',
                    }}>
                      {item.label}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      color: selected.color,
                      wordBreak: 'break-all',
                    }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Close */}
            <button
              onClick={() => setSelected(null)}
              style={{
                marginTop: '20px',
                width: '100%',
                padding: '12px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                color: 'var(--text-secondary)',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Zamknij
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
