import { NextRequest, NextResponse } from 'next/server'
import { generateMorningBriefFull } from '@/lib/briefings'
import { sendMessage, transportKeyboard } from '@/lib/telegram'
import { getUstawienie, setUstawienie } from '@/lib/sheets'

const COOLDOWN_MS = 4 * 60 * 60 * 1000
const KEY = 'brief_last_morning'

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env['CRON_SECRET']
  const isProd = process.env['NODE_ENV'] === 'production'
  if (!isProd) return true  // lokalnie — bez weryfikacji
  if (!secret) return false  // produkcja bez sekretu = blokada
  const auth = req.headers.get('authorization') ?? req.headers.get('x-cron-secret') ?? ''
  return auth === `Bearer ${secret}` || auth === secret
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = Date.now()
  const lastStr = await getUstawienie(KEY)
  const last = lastStr ? parseInt(lastStr, 10) : 0

  if (now - last < COOLDOWN_MS) {
    const minLeft = Math.ceil((COOLDOWN_MS - (now - last)) / 60000)
    return NextResponse.json({ skipped: true, reason: `Cooldown — następny brief za ${minLeft} min` })
  }

  try {
    const body = await req.json().catch(() => ({})) as {
      energiaCheckIn?: number
      useKolega?: boolean
    }

    // Cron bez energii: zapytaj o transport → po odpowiedzi user wpisze energię → brief
    if (body.energiaCheckIn === undefined) {
      await sendMessage('☀️ *Dzień dobry!*\n\nJak dziś dojedziesz do szkoły?', transportKeyboard)
      await setUstawienie(KEY, String(now), 'ostatni poranny brief')
      return NextResponse.json({ success: true, stage: 'transport_question' })
    }

    // Z energią (wywołane przez callback po wyborze transportu)
    const brief = await generateMorningBriefFull({
      energiaCheckIn: body.energiaCheckIn,
      useKolega: body.useKolega ?? false,
    })
    await sendMessage(brief)
    await setUstawienie(KEY, String(now), 'ostatni poranny brief')
    return NextResponse.json({ success: true, data: brief })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Błąd'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
