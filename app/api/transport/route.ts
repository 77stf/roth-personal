// ROTH Personal OS — Transport API
// POST /api/transport — oblicz opcje dojazdu

import { NextRequest, NextResponse } from 'next/server'
import { obliczTransport } from '@/lib/transport'
import { z } from 'zod'

const RequestSchema = z.object({
  firstLessonAt: z.string().regex(/^\d{2}:\d{2}$/),
  useKolega: z.boolean().optional().default(false),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firstLessonAt, useKolega } = RequestSchema.parse(body)

    const result = await obliczTransport(firstLessonAt, useKolega)

    if (!result) {
      return NextResponse.json({
        success: false,
        error: 'Brak opcji transportu na tę godzinę',
      }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    const msg = error instanceof Error ? error.message : 'Błąd'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
