// POST /api/system/setup — tworzy brakujące arkusze + inicjalizuje dane
// Jednorazowe wywołanie przy nowym deploymencie

import { NextRequest, NextResponse } from 'next/server'
import { ensureSheetExists, setUstawienie } from '@/lib/sheets'

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env['CRON_SECRET']
  const isProd = process.env['NODE_ENV'] === 'production'
  if (!isProd) return true
  if (!secret) return false
  const auth = req.headers.get('authorization') ?? ''
  return auth === `Bearer ${secret}` || auth === secret
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: Record<string, string> = {}

  try {
    await ensureSheetExists('STREAKI', ['nawyk', 'emoji', 'lastDate', 'count', 'best'])
    results['STREAKI'] = 'created or already exists'
  } catch (e) {
    results['STREAKI'] = `error: ${String(e)}`
  }

  return NextResponse.json({ success: true, results })
}
