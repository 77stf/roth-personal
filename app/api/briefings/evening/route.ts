// ROTH Personal OS — Wieczorny Brief API
// POST /api/briefings/evening

import { NextRequest, NextResponse } from 'next/server'
import { generateEveningBriefFull } from '@/lib/briefings'
import { sendMessage } from '@/lib/telegram'

export async function POST(req: NextRequest) {
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

    return NextResponse.json({ success: true, data: brief })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Błąd'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
