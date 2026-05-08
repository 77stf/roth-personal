// ROTH Personal OS — System logowania błędów i zdarzeń
// Zapisuje do Sheets (LOG_SYSTEM) + opcjonalnie email przez Make.com

import { appendRow } from './sheets'

export type LogLevel = 'info' | 'warn' | 'error' | 'critical'

export interface LogEntry {
  timestamp: string
  level: LogLevel
  source: string
  message: string
  details?: string
  resolved?: boolean
}

const MAKE_WEBHOOK_URL = process.env['MAKE_ERROR_WEBHOOK_URL']

// ─── Główna funkcja logowania ─────────────────────────────────────────────
export async function log(
  level: LogLevel,
  source: string,
  message: string,
  details?: unknown,
): Promise<void> {
  const timestamp = new Date().toISOString()
  const detailsStr = details ? JSON.stringify(details).substring(0, 500) : ''

  // Console output
  const emoji = { info: 'ℹ️', warn: '⚠️', error: '❌', critical: '🚨' }[level]
  console[level === 'info' ? 'log' : level === 'warn' ? 'warn' : 'error'](
    `${emoji} [${source}] ${message}`,
    details ?? '',
  )

  // Zapisz do Sheets (non-blocking)
  try {
    await appendRow('SYSTEM_LOG' as never, [
      timestamp, level, source, message, detailsStr, 'N',
    ])
  } catch {
    // Nie crashuj jeśli log się nie zapisze
  }

  // Email alert dla critical + error przez Make.com
  if ((level === 'error' || level === 'critical') && MAKE_WEBHOOK_URL) {
    try {
      await fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, source, message, details: detailsStr, timestamp }),
      })
    } catch {
      // Webhook fail — log lokalnie, nie propaguj
    }
  }
}

// ─── Convenience wrappers ─────────────────────────────────────────────────
export const logger = {
  info:     (src: string, msg: string, d?: unknown) => log('info', src, msg, d),
  warn:     (src: string, msg: string, d?: unknown) => log('warn', src, msg, d),
  error:    (src: string, msg: string, d?: unknown) => log('error', src, msg, d),
  critical: (src: string, msg: string, d?: unknown) => log('critical', src, msg, d),
}

// ─── API Error wrapper ────────────────────────────────────────────────────
export function withLogging<T>(
  source: string,
  fn: () => Promise<T>,
): Promise<T> {
  return fn().catch(async err => {
    await log('error', source, err.message ?? 'Unknown error', {
      stack: err.stack?.substring(0, 300),
    })
    throw err
  })
}

// ─── Health check — sprawdza wszystkie subsystemy ────────────────────────
export async function runHealthCheck(): Promise<HealthReport> {
  const checks: HealthCheck[] = []
  const start = Date.now()

  // Google Sheets
  try {
    const { readSheet } = await import('./sheets')
    await readSheet('USTAWIENIA' as never, 'A1:A1')
    checks.push({ name: 'Google Sheets', status: 'ok', ms: Date.now() - start })
  } catch (e) {
    checks.push({ name: 'Google Sheets', status: 'error', error: String(e) })
  }

  // Claude API
  try {
    const anthropic = (await import('@anthropic-ai/sdk')).default
    const client = new anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] })
    await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'ping' }],
    })
    checks.push({ name: 'Claude API', status: 'ok', ms: Date.now() - start })
  } catch (e) {
    checks.push({ name: 'Claude API', status: 'error', error: String(e) })
  }

  // Obsidian REST API
  try {
    const port = process.env['OBSIDIAN_PORT'] ?? '27124'
    const key = process.env['OBSIDIAN_API_KEY'] ?? ''
    const res = await fetch(`http://localhost:${port}/`, {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(3000),
    })
    checks.push({
      name: 'Obsidian',
      status: res.ok ? 'ok' : 'warn',
      ms: Date.now() - start,
    })
  } catch {
    checks.push({ name: 'Obsidian', status: 'warn', error: 'Not running (OK if not local)' })
  }

  // Telegram
  const telegramOk = !!(process.env['TELEGRAM_BOT_TOKEN'] && process.env['TELEGRAM_CHAT_ID'])
  checks.push({ name: 'Telegram', status: telegramOk ? 'ok' : 'warn', error: telegramOk ? undefined : 'Missing env vars' })

  const errors = checks.filter(c => c.status === 'error').length
  const warnings = checks.filter(c => c.status === 'warn').length

  return {
    timestamp: new Date().toISOString(),
    overall: errors > 0 ? 'error' : warnings > 0 ? 'warn' : 'ok',
    checks,
    durationMs: Date.now() - start,
  }
}

export interface HealthCheck {
  name: string
  status: 'ok' | 'warn' | 'error'
  ms?: number
  error?: string
}

export interface HealthReport {
  timestamp: string
  overall: 'ok' | 'warn' | 'error'
  checks: HealthCheck[]
  durationMs: number
}
