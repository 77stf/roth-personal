import { NextRequest, NextResponse } from 'next/server'
import { generateMorningBriefFull } from '@/lib/briefings'
import { sendMessage, energyKeyboard, transportKeyboard } from '@/lib/telegram'
import { getUstawienie, setUstawienie } from '@/lib/sheets'

const COOLDOWN_MS = 4 * 60 * 60 * 1000  // 4 godziny
const KEY = 'brief_last_morning'

export async function POST(req: NextRequest) {
  const now = Date.now()
  const lastStr = await getUstawienie(KEY)
  const last = lastStr ? parseInt(lastStr, 10) : 0

  if (now - last < COOLDOWN_MS) {
    const minLeft = Math.ceil((COOLDOWN_MS - (now - last)) / 60000)
    return NextResponse.json({ skipped: true, reason: `Cooldown — następny brief za ${minLeft} min` })
  }

  try {
    const body = await req.json().catch(() => ({})) as {
      sendTelegram?: boolean
      energiaCheckIn?: number
      useKolega?: boolean
    }

    if (body.sendTelegram) {
      await sendMessage('☀️ *Dzień dobry!*\n\nJak dziś dojedziesz do szkoły?', transportKeyboard)
      await setUstawienie(KEY, String(now), 'ostatni poranny brief')
      return NextResponse.json({ success: true })
    }

    const brief = await generateMorningBriefFull({
      energiaCheckIn: body.energiaCheckIn ?? 3,
      useKolega: body.useKolega ?? false,
    })

    if (body.energiaCheckIn !== undefined) {
      await sendMessage(brief)
    }

    await setUstawienie(KEY, String(now), 'ostatni poranny brief')
    return NextResponse.json({ success: true, data: brief })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Błąd'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
