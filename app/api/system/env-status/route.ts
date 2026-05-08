// ROTH Personal OS — Sprawdzenie statusu zmiennych środowiskowych
// GET /api/system/env-status

import { NextResponse } from 'next/server'

const REQUIRED_VARS = [
  'ANTHROPIC_API_KEY',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_SHEETS_ID',
  'GOOGLE_REFRESH_TOKEN',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_CHAT_ID',
  'OPENWEATHER_API_KEY',
  'OBSIDIAN_API_KEY',
  'ROTH_PASSCODE',
  'ROTH_SESSION_SECRET',
]

export async function GET() {
  const vars: Record<string, boolean> = {}
  for (const key of REQUIRED_VARS) {
    vars[key] = !!process.env[key]
  }
  return NextResponse.json({ vars })
}
