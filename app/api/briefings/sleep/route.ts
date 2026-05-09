// ROTH Personal OS — Pre-Sleep Protocol API
// POST /api/briefings/sleep

import { NextRequest, NextResponse } from 'next/server'
import { generatePreSleepFull } from '@/lib/briefings'
import { sendMessage } from '@/lib/telegram'
import { getUstawienie, setUstawienie } from '@/lib/sheets'
import { InlineKeyboard } from 'grammy'

const COOLDOWN_MS = 4 * 60 * 60 * 1000
const KEY = 'brief_last_sleep'

export async function POST(req: NextRequest) {
  const now = Date.now()
  const lastStr = await getUstawienie(KEY)
  const last = lastStr ? parseInt(lastStr, 10) : 0

  if (now - last < COOLDOWN_MS) {
    const minLeft = Math.ceil((COOLDOWN_MS - (now - last)) / 60000)
    return NextResponse.json({ skipped: true, reason: `Cooldown — następny brief za ${minLeft} min` })
  }

  try {
    const body = await req.json().catch(() => ({})) as { sendTelegram?: boolean }

    const protocol = await generatePreSleepFull()

    if (body.sendTelegram) {
      const keyboard = new InlineKeyboard()
        .text('Kończę zadanie', 'sleep:task')
        .text('Idę spać', 'sleep:now')
        .text('Jeszcze 1h', 'sleep:hour')
      await sendMessage(protocol, keyboard)
      await setUstawienie(KEY, String(now), 'ostatni sleep brief')
    }

    return NextResponse.json({ success: true, data: protocol })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Błąd'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
