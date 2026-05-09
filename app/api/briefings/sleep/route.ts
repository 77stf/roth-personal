// ROTH Personal OS — Pre-Sleep Protocol API
// POST /api/briefings/sleep

import { NextRequest, NextResponse } from 'next/server'
import { generatePreSleepFull } from '@/lib/briefings'
import { sendMessage } from '@/lib/telegram'
import { getUstawienie, setUstawienie } from '@/lib/sheets'
import { InlineKeyboard } from 'grammy'

const COOLDOWN_MS = 4 * 60 * 60 * 1000
const KEY = 'brief_last_sleep'

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env['CRON_SECRET']
  const isProd = process.env['NODE_ENV'] === 'production'
  if (!isProd) return true
  if (!secret) return false
  const auth = req.headers.get('authorization') ?? req.headers.get('x-cron-secret') ?? ''
  return auth === `Bearer ${secret}` || auth === secret
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const paused = await getUstawienie('briefs_paused')
  if (paused === '1') {
    return NextResponse.json({ skipped: true, reason: 'Briefy wstrzymane — /resume_briefs aby wznowić' })
  }

  const now = Date.now()
  const lastStr = await getUstawienie(KEY)
  const last = lastStr ? parseInt(lastStr, 10) : 0

  if (now - last < COOLDOWN_MS) {
    const minLeft = Math.ceil((COOLDOWN_MS - (now - last)) / 60000)
    return NextResponse.json({ skipped: true, reason: `Cooldown — następny brief za ${minLeft} min` })
  }

  try {
    const protocol = await generatePreSleepFull()

    const keyboard = new InlineKeyboard()
      .text('Kończę zadanie', 'sleep:task')
      .text('Idę spać', 'sleep:now')
      .text('Jeszcze 1h', 'sleep:hour')

    await sendMessage(protocol, keyboard)
    await setUstawienie(KEY, String(now), 'ostatni sleep brief')
    return NextResponse.json({ success: true, data: protocol })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Błąd'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
