// ROTH Personal OS — Pre-Sleep Protocol API
// POST /api/briefings/sleep

import { NextRequest, NextResponse } from 'next/server'
import { generatePreSleepFull } from '@/lib/briefings'
import { sendMessage } from '@/lib/telegram'
import { InlineKeyboard } from 'grammy'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({})) as { sendTelegram?: boolean }

    const protocol = await generatePreSleepFull()

    if (body.sendTelegram) {
      const keyboard = new InlineKeyboard()
        .text('Kończę zadanie', 'sleep:task')
        .text('Idę spać', 'sleep:now')
        .text('Jeszcze 1h', 'sleep:hour')
      await sendMessage(protocol, keyboard)
    }

    return NextResponse.json({ success: true, data: protocol })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Błąd'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
