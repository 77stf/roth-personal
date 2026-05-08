import { NextRequest, NextResponse } from 'next/server'
import { readSheet, appendRow, updateRow } from '@/lib/sheets'
import { SHEETS } from '@/lib/constants'
import { z } from 'zod'

const TaskSchema = z.object({
  nazwa: z.string().min(1),
  kolor: z.enum(['czerwone', 'zolte', 'zielone']).default('zielone'),
  kategoria: z.string().optional(),
  godzina: z.string().optional(),
})

const UpdateSchema = z.object({
  row: z.number().int().min(2),
  ukonczone: z.boolean(),
})

// GET /api/tasks — pobierz zadania na dziś
export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]!
    const rows = await readSheet(SHEETS.ZADANIA_DNIA)

    const tasks = rows
      .slice(1) // pomiń nagłówek
      .map((row, i) => ({
        row: i + 2,
        id: `row-${i + 2}`,
        data: row[0] ?? '',
        nazwa: row[1] ?? '',
        kolor: (row[2] ?? 'zielone') as 'czerwone' | 'zolte' | 'zielone',
        kategoria: row[3] ?? '',
        godzina: row[4] ?? '',
        ukonczone: row[5]?.toLowerCase() === 'tak',
      }))
      .filter(t => t.data === today)

    return NextResponse.json({ tasks, count: tasks.length })
  } catch (err) {
    console.error('[tasks GET]', err)
    return NextResponse.json({ error: 'Błąd pobierania zadań' }, { status: 500 })
  }
}

// POST /api/tasks — dodaj nowe zadanie na dziś
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as unknown
    const parsed = TaskSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Nieprawidłowe dane', details: parsed.error.issues }, { status: 400 })
    }

    const today = new Date().toISOString().split('T')[0]!
    const { nazwa, kolor, kategoria, godzina } = parsed.data

    await appendRow(SHEETS.ZADANIA_DNIA, [today, nazwa, kolor, kategoria ?? '', godzina ?? '', 'nie'])

    return NextResponse.json({ ok: true, message: 'Zadanie dodane' }, { status: 201 })
  } catch (err) {
    console.error('[tasks POST]', err)
    return NextResponse.json({ error: 'Błąd dodawania zadania' }, { status: 500 })
  }
}

// PATCH /api/tasks — oznacz zadanie jako ukończone
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json() as unknown
    const parsed = UpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Nieprawidłowe dane', details: parsed.error.issues }, { status: 400 })
    }

    const { row, ukonczone } = parsed.data
    // Aktualizuj cały wiersz — updateRow pobiera wartości od kolumny A
    // Najpierw odczytaj istniejące dane wiersza
    const rows = await readSheet(SHEETS.ZADANIA_DNIA)
    const existingRow = rows[row - 1] ?? []
    const updated = [...existingRow]
    updated[5] = ukonczone ? 'tak' : 'nie'

    await updateRow(SHEETS.ZADANIA_DNIA, row - 1, updated)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[tasks PATCH]', err)
    return NextResponse.json({ error: 'Błąd aktualizacji zadania' }, { status: 500 })
  }
}
