// ROTH Personal OS — Obsidian proxy API
// GET /api/obsidian?path=01_People/Robert.md
// POST /api/obsidian — zapisz notatkę

import { NextRequest, NextResponse } from 'next/server'
import { readNote, writeNote, checkConnection } from '@/lib/obsidian'

export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get('path')

  if (!path) {
    const connected = await checkConnection()
    return NextResponse.json({ connected })
  }

  try {
    const content = await readNote(path)
    if (content === null) {
      return NextResponse.json({ error: 'Notatka nie istnieje' }, { status: 404 })
    }
    return NextResponse.json({ success: true, content })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Błąd'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { path: string; content: string }
    if (!body.path || !body.content) {
      return NextResponse.json({ error: 'Brak path lub content' }, { status: 400 })
    }

    const ok = await writeNote(body.path, body.content)
    return NextResponse.json({ success: ok })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Błąd'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

// PATCH — dołącz do istniejącej notatki (nie nadpisuje)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json() as { path: string; content: string }
    if (!body.path || !body.content) {
      return NextResponse.json({ error: 'Brak path lub content' }, { status: 400 })
    }

    const { appendToNote } = await import('@/lib/obsidian')
    const ok = await appendToNote(body.path, body.content)
    return NextResponse.json({ success: ok })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Błąd'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
