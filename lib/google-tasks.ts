// ROTH Personal OS — Google Tasks API v1
// Sync zadań między Google Tasks (mobile) a ROTH system

import { google } from 'googleapis'

function getAuth() {
  const auth = new google.auth.OAuth2(
    process.env['GOOGLE_CLIENT_ID'],
    process.env['GOOGLE_CLIENT_SECRET'],
  )
  auth.setCredentials({ refresh_token: process.env['GOOGLE_REFRESH_TOKEN'] })
  return auth
}

function getTasksClient() {
  return google.tasks({ version: 'v1', auth: getAuth() })
}

// ─── Typy ────────────────────────────────────────────────────────────────

export interface GoogleTask {
  id: string
  title: string
  notes?: string
  due?: string        // ISO date string
  status: 'needsAction' | 'completed'
  completed?: string  // ISO date gdy ukończone
  listId: string
  listTitle: string
  eisenhower?: EisenhowerQuadrant
  category?: TaskCategory3x3
}

export type EisenhowerQuadrant = 'do_now' | 'schedule' | 'delegate' | 'eliminate'
export type TaskCategory3x3 = 'deep_work' | 'urgent' | 'maintenance'

// ─── Eisenhower auto-klasyfikacja ─────────────────────────────────────────

export function classifyEisenhower(title: string, due?: string): EisenhowerQuadrant {
  const lower = title.toLowerCase()
  const isDueSoon = due ? (new Date(due).getTime() - Date.now()) < 48 * 3600 * 1000 : false

  const isImportant = /ofm|azul|autorise|szkoła|sprawdzian|dr.hadi|sorin|hadi|biznes|trening|zdrowie/i.test(lower)
  const isUrgent = isDueSoon || /dziś|teraz|urgent|pilne|asap/i.test(lower)

  if (isImportant && isUrgent) return 'do_now'
  if (isImportant && !isUrgent) return 'schedule'
  if (!isImportant && isUrgent) return 'delegate'
  return 'eliminate'
}

export function classify3x3(title: string): TaskCategory3x3 {
  const lower = title.toLowerCase()
  if (/ofm|autorise|content|negocjacje|strategia|analiza|kod|build/i.test(lower)) return 'deep_work'
  if (/odpisz|wyślij|zapłać|kup|zadzwoń|sprawdź|potwierdź/i.test(lower)) return 'urgent'
  return 'maintenance'
}

// ─── Listy zadań ─────────────────────────────────────────────────────────

export async function getTaskLists(): Promise<{ id: string; title: string }[]> {
  const tasks = getTasksClient()
  const res = await tasks.tasklists.list({ maxResults: 20 })
  return (res.data.items ?? []).map(l => ({ id: l.id!, title: l.title! }))
}

// ─── Pobieranie zadań ────────────────────────────────────────────────────

export async function getTodayTasks(): Promise<GoogleTask[]> {
  const tasks = getTasksClient()
  const lists = await getTaskLists()
  const allTasks: GoogleTask[] = []

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 2)

  for (const list of lists) {
    const res = await tasks.tasks.list({
      tasklist: list.id,
      showCompleted: false,
      showHidden: false,
      maxResults: 50,
    })

    const items = res.data.items ?? []
    for (const item of items) {
      if (!item.title) continue
      const task: GoogleTask = {
        id: item.id!,
        title: item.title,
        notes: item.notes ?? undefined,
        due: item.due ?? undefined,
        status: item.status as 'needsAction' | 'completed',
        listId: list.id,
        listTitle: list.title,
        eisenhower: classifyEisenhower(item.title, item.due ?? undefined),
        category: classify3x3(item.title),
      }
      allTasks.push(task)
    }
  }

  return allTasks
}

// ─── Dodaj zadanie ───────────────────────────────────────────────────────

export async function addGoogleTask(params: {
  title: string
  notes?: string
  due?: string    // 'YYYY-MM-DD' lub 'jutro'
  listTitle?: string
}): Promise<GoogleTask> {
  const tasks = getTasksClient()
  const lists = await getTaskLists()

  // Znajdź listę (default: pierwsza)
  let targetList = lists[0]!
  if (params.listTitle) {
    const found = lists.find(l => l.title.toLowerCase().includes(params.listTitle!.toLowerCase()))
    if (found) targetList = found
  }

  // Przetworz datę
  let dueDate: string | undefined
  if (params.due) {
    if (params.due === 'jutro') {
      const tom = new Date(); tom.setDate(tom.getDate() + 1)
      dueDate = tom.toISOString().split('T')[0]! + 'T00:00:00.000Z'
    } else if (params.due === 'dzisiaj') {
      dueDate = new Date().toISOString().split('T')[0]! + 'T00:00:00.000Z'
    } else if (params.due.match(/\d{4}-\d{2}-\d{2}/)) {
      dueDate = params.due + 'T00:00:00.000Z'
    }
  }

  const res = await tasks.tasks.insert({
    tasklist: targetList.id,
    requestBody: {
      title: params.title,
      notes: params.notes,
      due: dueDate,
    },
  })

  return {
    id: res.data.id!,
    title: res.data.title!,
    notes: res.data.notes ?? undefined,
    due: res.data.due ?? undefined,
    status: 'needsAction',
    listId: targetList.id,
    listTitle: targetList.title,
    eisenhower: classifyEisenhower(params.title, dueDate),
    category: classify3x3(params.title),
  }
}

// ─── Ukończ zadanie ───────────────────────────────────────────────────────

export async function completeGoogleTask(taskId: string, listId: string): Promise<void> {
  const tasks = getTasksClient()
  await tasks.tasks.patch({
    tasklist: listId,
    task: taskId,
    requestBody: { status: 'completed' },
  })
}

// ─── Formatuj zadania dla Telegrama ──────────────────────────────────────

export function formatTasksForTelegram(taskList: GoogleTask[]): string {
  if (taskList.length === 0) return '✅ Brak zadań — dodaj pierwsze!'

  const deep = taskList.filter(t => t.category === 'deep_work')
  const urgent = taskList.filter(t => t.category === 'urgent')
  const maintenance = taskList.filter(t => t.category === 'maintenance')

  let msg = ''

  if (deep.length > 0) {
    msg += `🔴 *GŁĘBOKA PRACA (${deep.length})*\n`
    deep.slice(0, 3).forEach(t => { msg += `• ${t.title}\n` })
    msg += '\n'
  }
  if (urgent.length > 0) {
    msg += `🟡 *PILNE (${urgent.length})*\n`
    urgent.slice(0, 3).forEach(t => { msg += `• ${t.title}\n` })
    msg += '\n'
  }
  if (maintenance.length > 0) {
    msg += `🟢 *UTRZYMANIE (${maintenance.length})*\n`
    maintenance.slice(0, 3).forEach(t => { msg += `• ${t.title}\n` })
  }

  return msg.trim()
}
