// ROTH Personal OS — Obsidian Local REST API proxy
// Wymaga: wtyczka "Obsidian Local REST API" (port 27123)

import { OBSIDIAN_FOLDERS } from './constants'

const OBSIDIAN_BASE = `http://localhost:${process.env['OBSIDIAN_PORT'] ?? '27123'}`
const OBSIDIAN_KEY = process.env['OBSIDIAN_API_KEY']

function getHeaders(): HeadersInit {
  return {
    'Authorization': `Bearer ${OBSIDIAN_KEY}`,
    'Content-Type': 'application/json',
  }
}

// ─── Sprawdź połączenie ────────────────────────────────────────────────────
export async function checkConnection(): Promise<boolean> {
  try {
    const res = await fetch(`${OBSIDIAN_BASE}/`, {
      headers: getHeaders(),
      signal: AbortSignal.timeout(2000),
    })
    return res.ok
  } catch {
    return false
  }
}

// ─── Czytaj notatkę ──────────────────────────────────────────────────────
export async function readNote(path: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${OBSIDIAN_BASE}/vault/${encodeURIComponent(path)}`,
      { headers: getHeaders() }
    )
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

// ─── Zapisz notatkę ──────────────────────────────────────────────────────
export async function writeNote(path: string, content: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${OBSIDIAN_BASE}/vault/${encodeURIComponent(path)}`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: content,
      }
    )
    return res.ok
  } catch {
    return false
  }
}

// ─── Dołącz do notatki ───────────────────────────────────────────────────
export async function appendToNote(path: string, content: string): Promise<boolean> {
  const existing = await readNote(path)
  const newContent = existing
    ? `${existing}\n\n${content}`
    : content
  return writeNote(path, newContent)
}

// ─── Profil osoby ────────────────────────────────────────────────────────
export async function getPersonProfile(imie: string): Promise<string | null> {
  const path = `${OBSIDIAN_FOLDERS.people}/${imie}.md`
  return readNote(path)
}

export async function updatePersonInteraction(
  imie: string,
  notatkaInterakcji: string,
): Promise<boolean> {
  const path = `${OBSIDIAN_FOLDERS.people}/${imie}.md`
  const date = new Date().toISOString().split('T')[0]!
  const entry = `\n## Interakcja ${date}\n${notatkaInterakcji}`
  return appendToNote(path, entry)
}

// ─── Weekly Review ────────────────────────────────────────────────────────
export async function saveWeeklyReview(week: string, content: string): Promise<boolean> {
  const path = `${OBSIDIAN_FOLDERS.weeklyReviews}/${week}.md`
  return writeNote(path, content)
}

// ─── Idea Lab ────────────────────────────────────────────────────────────
export async function saveIdeaLabResult(
  pomysl: string,
  content: string,
): Promise<boolean> {
  const date = new Date().toISOString().split('T')[0]!
  const slug = pomysl.substring(0, 30).replace(/\s+/g, '-').toLowerCase()
  const path = `${OBSIDIAN_FOLDERS.ideas}/${date}-${slug}.md`
  return writeNote(path, content)
}

// ─── OFM — status metody ─────────────────────────────────────────────────
export async function checkOFMMethodStatus(metodaNazwa: string): Promise<{
  status: 'ZATWIERDZONA' | 'NIEZWERYFIKOWANA' | 'ODRZUCONA' | 'NIEZNANA'
  powod?: string
  weryfikator?: string
} | null> {
  // Szukaj w folderach Zatwierdzone, Do_Weryfikacji, Archiwum
  const folders = ['Zatwierdzone', 'Do_Weryfikacji', 'Archiwum']
  const categories = ['Metody', 'Reddit', 'Onboarding_Modelki', 'Chatting', 'Pricing_PPV']

  for (const cat of categories) {
    for (const folder of folders) {
      const path = `${OBSIDIAN_FOLDERS.knowledge}/${cat}/${folder}/${metodaNazwa}.md`
      const content = await readNote(path)

      if (content) {
        if (folder === 'Zatwierdzone') return { status: 'ZATWIERDZONA' }
        if (folder === 'Do_Weryfikacji') return { status: 'NIEZWERYFIKOWANA' }
        if (folder === 'Archiwum') {
          const powodMatch = content.match(/powod_odrzucenia:\s*(.+)/i)
          const ktoMatch = content.match(/odrzucil:\s*(.+)/i)
          return {
            status: 'ODRZUCONA',
            powod: powodMatch?.[1]?.trim(),
            weryfikator: ktoMatch?.[1]?.trim(),
          }
        }
      }
    }
  }

  return { status: 'NIEZNANA' }
}

// ─── Zapisz ważną decyzję ─────────────────────────────────────────────────
export async function saveDecision(title: string, content: string): Promise<boolean> {
  const date = new Date().toISOString().split('T')[0]!
  const slug = title.substring(0, 40).replace(/\s+/g, '-').toLowerCase()
  const path = `${OBSIDIAN_FOLDERS.decisions}/${date}-${slug}.md`
  return writeNote(path, `# ${title}\n\n**Data:** ${date}\n\n${content}`)
}
