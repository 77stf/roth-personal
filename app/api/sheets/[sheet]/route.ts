// ROTH Personal OS — Universal Google Sheets CRUD API
// GET /api/sheets/[sheet] — czytaj arkusz
// POST /api/sheets/[sheet] — dodaj wiersz

import { NextRequest, NextResponse } from 'next/server'
import { readSheet, appendRow } from '@/lib/sheets'
import { SHEETS, type SheetName } from '@/lib/constants'

type RouteParams = { params: Promise<{ sheet: string }> }

const VALID_SHEETS = new Set(Object.values(SHEETS))

function isValidSheet(name: string): name is SheetName {
  return VALID_SHEETS.has(name as SheetName)
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { sheet } = await params
  const sheetUpper = sheet.toUpperCase() as SheetName

  if (!isValidSheet(sheetUpper)) {
    return NextResponse.json({ error: 'Nieznany arkusz' }, { status: 400 })
  }

  try {
    const rows = await readSheet(sheetUpper)
    return NextResponse.json({ success: true, data: rows })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Błąd'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { sheet } = await params
  const sheetUpper = sheet.toUpperCase() as SheetName

  if (!isValidSheet(sheetUpper)) {
    return NextResponse.json({ error: 'Nieznany arkusz' }, { status: 400 })
  }

  try {
    const body = await req.json() as { values: (string | number | boolean)[] }
    if (!body.values || !Array.isArray(body.values)) {
      return NextResponse.json({ error: 'Brak pola values' }, { status: 400 })
    }

    await appendRow(sheetUpper, body.values)
    return NextResponse.json({ success: true })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Błąd'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
