// ROTH Personal OS — Water Tracker API
// POST /api/water — dodaj wodę
// GET /api/water — stan dziś

import { NextRequest, NextResponse } from 'next/server'
import { addWater, getWaterToday } from '@/lib/sheets'
import { generateWaterQuestion } from '@/lib/briefings'
import { z } from 'zod'

export async function GET() {
  try {
    const water = await getWaterToday()
    return NextResponse.json({ success: true, data: water })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Błąd'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { ml: number }
    const ml = z.number().min(0).max(2000).parse(body.ml)

    const updated = await addWater(ml)
    const message = generateWaterQuestion(updated.wypito)

    return NextResponse.json({ success: true, data: updated, message })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Błąd'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
