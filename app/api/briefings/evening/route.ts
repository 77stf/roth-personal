import { NextRequest, NextResponse } from 'next/server'
import { generateEveningBriefFull } from '@/lib/briefings'
import { sendMessage } from '@/lib/telegram'

const lastSent = new Map<string, number>()
const COOLDOWN_MS = 4 * 60 * 60 * 1000

export async function POST(req: NextRequest) {
  const key = 'evening'
  const now = Date.now()
  const last = lastSent.get(key) ?? 0

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

    if (body.sendTelegram) {
      await sendMessage(brief)
    }

    lastSent.set(key, now)
    return NextResponse.json({ success: true, data: brief })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Błąd'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
