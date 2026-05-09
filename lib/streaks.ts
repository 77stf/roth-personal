// ROTH Personal OS — Seinfeld Strategy streak tracker

import { readSheet, appendRow, updateRow } from './sheets'
import { SHEETS } from './constants'

export interface Streak {
  nawyk: string       // 'silownia' | 'badminton' | 'woda' | 'ofm_content' | 'nauka'
  emoji: string
  lastDate: string    // 'YYYY-MM-DD'
  count: number       // dni z rzędu
  best: number        // rekord
}

// ─── Pobierz streaki ──────────────────────────────────────────────────────
export async function getStreaks(): Promise<Streak[]> {
  const rows = await readSheet(SHEETS.STREAKI).catch(() => [] as string[][])
  if ((rows as string[][]).length <= 1) return getDefaultStreaks()

  return (rows as string[][]).slice(1).map(row => ({
    nawyk: String(row[0] ?? ''),
    emoji: String(row[1] ?? '🔥'),
    lastDate: String(row[2] ?? '2000-01-01'),
    count: Number(row[3] ?? 0),
    best: Number(row[4] ?? 0),
  }))
}

function getDefaultStreaks(): Streak[] {
  return [
    { nawyk: 'silownia', emoji: '💪', lastDate: '2000-01-01', count: 0, best: 0 },
    { nawyk: 'badminton', emoji: '🏸', lastDate: '2000-01-01', count: 0, best: 0 },
    { nawyk: 'woda', emoji: '💧', lastDate: '2000-01-01', count: 0, best: 0 },
    { nawyk: 'ofm_content', emoji: '📸', lastDate: '2000-01-01', count: 0, best: 0 },
    { nawyk: 'nauka', emoji: '📖', lastDate: '2000-01-01', count: 0, best: 0 },
  ]
}

// ─── Zaloguj wykonanie nawyku ─────────────────────────────────────────────
export async function logStreak(nawyk: string): Promise<Streak> {
  const rows = await readSheet(SHEETS.STREAKI).catch(() => [] as string[][])
  const today = new Date().toISOString().split('T')[0]!
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]!

  const rowIndex = (rows as string[][]).findIndex((r, i) => i > 0 && String(r[0]) === nawyk)

  if (rowIndex === -1) {
    // Nowy streak
    const defaults = getDefaultStreaks()
    const def = defaults.find(d => d.nawyk === nawyk) ?? { nawyk, emoji: '🔥', lastDate: today, count: 0, best: 0 }
    const newStreak: Streak = { ...def, lastDate: today, count: 1, best: 1 }
    await appendRow(SHEETS.STREAKI, [newStreak.nawyk, newStreak.emoji, today, 1, 1])
    return newStreak
  }

  const row = (rows as string[][])[rowIndex]!
  const lastDate = String(row[2] ?? '2000-01-01')
  const currentCount = Number(row[3] ?? 0)
  const best = Number(row[4] ?? 0)

  if (lastDate === today) {
    // Już zalogowane dziś
    return { nawyk, emoji: String(row[1] ?? '🔥'), lastDate, count: currentCount, best }
  }

  const newCount = lastDate === yesterday ? currentCount + 1 : 1
  const newBest = Math.max(newCount, best)

  await updateRow(SHEETS.STREAKI, rowIndex, [nawyk, String(row[1] ?? '🔥'), today, newCount, newBest])

  return { nawyk, emoji: String(row[1] ?? '🔥'), lastDate: today, count: newCount, best: newBest }
}

// ─── Formatuj streaki dla Telegrama ──────────────────────────────────────
export function formatStreaksForBrief(streaks: Streak[]): string {
  const today = new Date().toISOString().split('T')[0]!
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]!

  const active = streaks.filter(s => s.lastDate === today || s.lastDate === yesterday)
  if (active.length === 0) return ''

  return active.map(s => {
    const fire = s.count >= 7 ? '🔥🔥' : s.count >= 3 ? '🔥' : ''
    return `${s.emoji} ${s.nawyk}: *${s.count}d* ${fire}`
  }).join(' · ')
}
