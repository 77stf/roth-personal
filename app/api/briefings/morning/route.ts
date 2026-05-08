// ROTH Personal OS — Poranny Brief API
// POST /api/briefings/morning

import { NextRequest, NextResponse } from 'next/server'
import { generateMorningBriefFull } from '@/lib/briefings'
import { sendMessage } from '@/lib/telegram'
import { energyKeyboard, transportKeyboard } from '@/lib/telegram'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({})) as {
      sendTelegram?: boolean
      energiaCheckIn?: number
      useKolega?: boolean
    }

    // Najpierw wyślij pytanie o transport i energię jeśli przez Telegram
    if (body.sendTelegram) {
      await sendMessage(
        '☀️ *Dzień dobry!*\n\nJak dziś dojedziesz do szkoły?',
        transportKeyboard,
      )
      return NextResponse.json({ success: true, message: 'Wysłano pytanie transportowe' })
    }

    const brief = await generateMorningBriefFull({
      energiaCheckIn: body.energiaCheckIn ?? 3,
      useKolega: body.useKolega ?? false,
    })

    // Opcjonalnie wyślij na Telegram
    if (body.energiaCheckIn !== undefined) {
      await sendMessage(brief)
    }

    return NextResponse.json({ success: true, data: brief })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Błąd'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
