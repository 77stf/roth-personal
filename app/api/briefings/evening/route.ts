import { NextRequest, NextResponse } from 'next/server'
import { generateEveningBriefFull } from '@/lib/briefings'
import { sendMessage } from '@/lib/telegram'
import { getUstawienie, setUstawienie } from '@/lib/sheets'

const COOLDOWN_MS = 4 * 60 * 60 * 1000
const KEY = 'brief_last_evening'

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
    const body = await req.json().catch(() => ({})) as {
      sendTelegram?: boolean
      frictionLog?: string
      doneTasksText?: string
      notDoneTasksText?: string
    }

    const brief = await generateEveningBriefFull({
      frictionLog: body.frictionLog,
      doneTasksText: body.doneTasksText,
      notDoneTasksText: body.notDoneTasksText,
    })

    if (body.sendTelegram !== false) {
      await sendMessage(brief)
    }

    await setUstawienie(KEY, String(now), 'ostatni wieczorny brief')
    return NextResponse.json({ success: true, data: brief })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Błąd'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
