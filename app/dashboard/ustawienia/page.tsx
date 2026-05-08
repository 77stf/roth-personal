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

export default function UstawieniaPage() {
  const [envStatus, setEnvStatus] = useState<EnvStatus[]>(ENV_VARS)
  const [obsidianConnected, setObsidianConnected] = useState<boolean | null>(null)
  const [telegramWebhookUrl, setTelegramWebhookUrl] = useState('')

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
        setEnvStatus(prev => prev.map(v => ({ ...v, set: data.vars[v.key] ?? false })))
      }
    } catch {
      // silently fail
    }
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

  const criticalMissing = envStatus.filter(v => v.critical && !v.set)
  const allCriticalSet = criticalMissing.length === 0

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>System</div>
        <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>Ustawienia</div>
      </div>

      {/* Status systemu */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Status zmiennych środowiskowych
        </div>

        {!allCriticalSet && (
          <div style={{
            padding: '10px 12px',
            background: 'rgba(255,51,102,0.1)',
            border: '1px solid rgba(255,51,102,0.3)',
            borderRadius: '8px',
            fontSize: '12px',
            color: 'var(--accent-red)',
            marginBottom: '12px',
          }}>
            ⚠️ {criticalMissing.length} krytycznych zmiennych brakuje — system nie działa w pełni
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
                color: v.set ? 'var(--accent-green)' : 'var(--accent-red)',
              }}>
                {v.set ? '✅ OK' : '❌ BRAK'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Obsidian */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>Obsidian Local REST API</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Port: {process.env['OBSIDIAN_PORT'] ?? '27123'} • Wymaga zainstalowanej wtyczki
            </div>
          </div>
          <span style={{
            fontSize: '12px',
            fontWeight: 700,
            color: obsidianConnected === null ? 'var(--text-secondary)' : obsidianConnected ? 'var(--accent-green)' : 'var(--accent-red)',
          }}>
            {obsidianConnected === null ? 'Sprawdzam...' : obsidianConnected ? '✅ Połączony' : '❌ Brak połączenia'}
          </span>
        </div>
      </div>

      {/* Telegram Webhook */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Telegram Webhook</div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          Ustaw webhook przez Telegram API:
        </div>
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

      {/* Google Sheets */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Google Sheets — 22 arkusze</div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
          Wymagana struktura arkuszy w GOOGLE_SHEETS_ID:
        </div>
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

      {/* Make.com Dokumentacja */}
      <div className="card">
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Make.com — 17 scenariuszy</div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
          URL webhooków dla automatyzacji (skonfiguruj ręcznie w make.com):
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            { name: 'Poranny Brief', endpoint: '/api/briefings/morning', trigger: 'Cron 6:45' },
            { name: 'Wieczorny Brief', endpoint: '/api/briefings/evening', trigger: 'Cron 21:30' },
            { name: 'Pre-Sleep', endpoint: '/api/briefings/sleep', trigger: 'Cron 23:00' },
            { name: 'Water Tracker', endpoint: '/api/water', trigger: 'Cron co 2h (9-21)' },
            { name: 'Telegram Webhook', endpoint: '/api/telegram/webhook', trigger: 'Telegram Bot API' },
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
                Trigger: {item.trigger}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
