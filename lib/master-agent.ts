// ROTH Personal OS — Master Agent
// Jeden agent konwersacyjny który ogarnia WSZYSTKO przez Telegram
// Używa Claude tool_use: czyta/pisze Sheets, kolejkuje Obsidian, planuje dzień

import Anthropic from '@anthropic-ai/sdk'
import type { MessageParam, Tool, ToolResultBlockParam } from '@anthropic-ai/sdk/resources/messages'
import { readSheet, appendRow, getLessonPlan, getWaterToday } from './sheets'
import { SHEETS } from './constants'
import { buildRothContext } from './roth-context'

const anthropic = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] })

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────
const MASTER_SYSTEM = `Jesteś ROTH — osobistym asystentem AI dla Roth (17 lat, Polska).

TOŻSAMOŚĆ ROTHA:
- Szkoła: ZSE Śrem, klasa 3PB (informatyk)
- Biznesy: 77STF (OFM management — modelka Azul, $860 inwestycja) + Autorise (AI Consulting dla firm)
- Cel życiowy: Tajlandia 2027 + kilka modelek OFM
- Sport: Siłownia (pon/śr/pt) + Badminton (wt/pt 19:30)
- Dieta: cel 63→75kg, mięsożerca, bez nabiału
- Transport: samochód z kolegą (primary) lub autobus z Konarskiego
- Mentorzy OFM: Dr. Hadi, Mikołaj (Reddit admin), Sorin (Reddit admin)
- Rodzina nie wspiera — buduje sam
- Nocna sowa — trudne wstawanie

STYL ODPOWIEDZI (KRYTYCZNE):
- Maksymalnie 5-6 linii na Telegram
- Bez wstępów i grzeczności — prosto do rzeczy
- Używaj narzędzi zanim odpiszesz — sprawdź co jest zaplanowane
- Gdy user mówi że nie może czegoś zrobić → natychmiast zaproponuj KONKRETNE alternatywy
- Gdy ważna info → zapisz do Obsidian (użyj write_obsidian)
- Daj JEDEN konkretny next step na końcu
- Odpowiadaj po polsku (chyba że user pisze po angielsku)

NARZĘDZIA — kiedy używać:
- get_context: ZAWSZE przy pytaniach o plan dnia / co robić / co masz dziś
- add_task: gdy user mówi że coś musi zrobić
- write_obsidian: gdy ważna decyzja, sytuacja OFM/biznesowa, lub user prosi o zapamiętanie
- get_schedule: gdy pytanie o lekcje / jutro / kiedy wstawać
- log_event: gdy user informuje o zdarzeniu (trening, wydatek, choroba)
- reschedule: gdy user mówi że nie może czegoś zrobić dziś`

// ─── NARZĘDZIA ────────────────────────────────────────────────────────────
const TOOLS: Tool[] = [
  {
    name: 'get_context',
    description: 'Pobierz aktualny kontekst ROTH: zadania dnia, plan lekcji, status OFM, energię, wodę. Wywołaj ZAWSZE gdy pytanie dotyczy planu dnia.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'add_task',
    description: 'Dodaj zadanie do listy na dziś lub podany dzień.',
    input_schema: {
      type: 'object' as const,
      properties: {
        task: { type: 'string', description: 'Treść zadania' },
        priority: { type: 'string', enum: ['red', 'yellow', 'green'], description: 'Priorytet: red=musi być, yellow=powinno, green=opcja' },
        category: { type: 'string', description: 'Kategoria: OFM/AI/Szkola/Sport/Dom/Finanse' },
        when: { type: 'string', description: 'Kiedy: dzisiaj (default), jutro, lub data YYYY-MM-DD' },
      },
      required: ['task', 'priority'],
    },
  },
  {
    name: 'write_obsidian',
    description: 'Zapisz notatkę do Obsidian vault. Używaj do ważnych decyzji, sytuacji OFM, info o ludziach, pomysłów.',
    input_schema: {
      type: 'object' as const,
      properties: {
        title: { type: 'string', description: 'Tytuł notatki' },
        content: { type: 'string', description: 'Treść notatki w Markdown' },
        folder: { type: 'string', description: 'Folder: 00_INBOX (default) | 02_Projects/OFM | 02_Projects/AI_Consulting | 01_People | 05_Ideas | 06_Decisions | 07_Daily_Notes' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Tagi np. ["OFM", "Azul", "decyzja"]' },
      },
      required: ['title', 'content'],
    },
  },
  {
    name: 'get_schedule',
    description: 'Pobierz plan lekcji na dany dzień + o której wstawać.',
    input_schema: {
      type: 'object' as const,
      properties: {
        day: { type: 'string', description: 'Dzień: dzisiaj | jutro | Poniedzialek | Wtorek | Sroda | Czwartek | Piatek' },
      },
      required: ['day'],
    },
  },
  {
    name: 'reschedule',
    description: 'Gdy user nie może czegoś zrobić — zaloguj i zaproponuj kiedy to przenieść.',
    input_schema: {
      type: 'object' as const,
      properties: {
        item: { type: 'string', description: 'Co jest przenoszone' },
        reason: { type: 'string', description: 'Powód' },
        suggest_when: { type: 'string', description: 'Kiedy zamiast tego: jutro/pojutrze/weekend' },
      },
      required: ['item', 'reason'],
    },
  },
  {
    name: 'log_event',
    description: 'Zaloguj zdarzenie: wydatek, trening, sytuację zdrowotną, kontakt z osobą.',
    input_schema: {
      type: 'object' as const,
      properties: {
        type: { type: 'string', enum: ['wydatek', 'trening', 'zdrowie', 'kontakt', 'ofm', 'inne'] },
        description: { type: 'string', description: 'Opis zdarzenia' },
        value: { type: 'string', description: 'Wartość (np. kwota, minuty treningu)' },
      },
      required: ['type', 'description'],
    },
  },
]

// ─── WYKONANIE NARZĘDZI ───────────────────────────────────────────────────
async function executeTool(name: string, input: Record<string, unknown>): Promise<string> {
  try {
    switch (name) {
      case 'get_context': {
        const ctx = await buildRothContext()
        const water = await getWaterToday().catch(() => null)
        return [
          `DATA: ${ctx.dataToday} (${ctx.dayOfWeek})`,
          `ENERGIA: ${ctx.energiaZona} | Scoring: ${ctx.scoring}`,
          `ZADANIA: ${ctx.openTasks}`,
          `KALENDARZ: ${ctx.calendarToday || 'Brak wydarzeń'}`,
          `OFM: ${ctx.ofmStatus}`,
          `AI: ${ctx.aiStatus}`,
          `WODA: ${water?.wypito ?? 0}ml / 2000ml`,
          ctx.openPeopleIssues !== 'Brak otwartych spraw' ? `LUDZIE: ${ctx.openPeopleIssues}` : '',
        ].filter(Boolean).join('\n')
      }

      case 'add_task': {
        const { task, priority, category = 'Inne', when = 'dzisiaj' } = input as {
          task: string; priority: string; category?: string; when?: string
        }
        const today = new Date()
        let dateStr = today.toISOString().split('T')[0]!
        if (when === 'jutro') {
          const tom = new Date(today); tom.setDate(today.getDate() + 1)
          dateStr = tom.toISOString().split('T')[0]!
        } else if (when !== 'dzisiaj' && when.match(/\d{4}-\d{2}-\d{2}/)) {
          dateStr = when
        }
        await appendRow(SHEETS.ZADANIA_DNIA, [dateStr, task, priority, category, '', 'nie'])
        return `Dodano: [${priority}] ${task} na ${dateStr}`
      }

      case 'write_obsidian': {
        const { title, content, folder = '00_INBOX', tags = [] } = input as {
          title: string; content: string; folder?: string; tags?: string[]
        }
        const now = new Date().toISOString()
        const tagStr = (tags as string[]).map((t: string) => `"${t}"`).join(', ')
        const fullContent = `---\ntitle: "${title}"\ncreated: ${now}\ntags: [${tagStr}]\nfolder: ${folder}\n---\n\n${content}`

        // Próbuj Obsidian REST API (lokalnie)
        try {
          const obsidianKey = process.env['OBSIDIAN_API_KEY']
          const obsidianPort = process.env['OBSIDIAN_PORT'] ?? '27124'
          if (obsidianKey) {
            const fileName = `${title.replace(/[^a-zA-Z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s-]/g, '').trim()}.md`
            const res = await fetch(`https://localhost:${obsidianPort}/vault/${folder}/${fileName}`, {
              method: 'PUT',
              headers: { 'Authorization': `Bearer ${obsidianKey}`, 'Content-Type': 'text/markdown' },
              body: fullContent,
            })
            if (res.ok) return `Obsidian: zapisano "${title}" w ${folder}/`
          }
        } catch { /* Obsidian niedostępny — zapisz do kolejki */ }

        // Fallback: kolejka w Sheets (synced lokalnie)
        await appendRow(SHEETS.SYSTEM_LOG as Parameters<typeof appendRow>[0], [
          new Date().toISOString(), 'OBSIDIAN_QUEUE', title, folder, fullContent.substring(0, 500),
        ])
        return `Obsidian queue: "${title}" → ${folder}/ (zostanie zsynchronizowane gdy Obsidian uruchomiony)`
      }

      case 'get_schedule': {
        const { day } = input as { day: string }
        const now = new Date()
        let targetDay = day.toLowerCase()

        if (targetDay === 'jutro') {
          const tom = new Date(now); tom.setDate(now.getDate() + 1)
          const days = ['Niedziela', 'Poniedzialek', 'Wtorek', 'Sroda', 'Czwartek', 'Piatek', 'Sobota']
          targetDay = days[tom.getDay()]?.toLowerCase() ?? 'poniedzialek'
        } else if (targetDay === 'dzisiaj') {
          const days = ['Niedziela', 'Poniedzialek', 'Wtorek', 'Sroda', 'Czwartek', 'Piatek', 'Sobota']
          targetDay = days[now.getDay()]?.toLowerCase() ?? 'poniedzialek'
        }

        const dayCapitalized = targetDay.charAt(0).toUpperCase() + targetDay.slice(1)
        const plan = await getLessonPlan(dayCapitalized)

        if (plan.length === 0) return `Brak lekcji w ${dayCapitalized} — wolny dzień!`

        const firstLesson = plan[0]
        const lastLesson = plan[plan.length - 1]

        // Oblicz kiedy wstawać
        const { LESSON_TIMES } = await import('./constants')
        const firstTime = firstLesson ? LESSON_TIMES[firstLesson.nrLekcji] : null
        let wakeUpTime = '06:30'
        if (firstTime) {
          const [h, m] = firstTime.od.split(':').map(Number) as [number, number]
          const wakeMinutes = h * 60 + m - 40 // 40 min przed lekcją (10min dojście + 30min dojazd)
          wakeUpTime = `${String(Math.floor(wakeMinutes / 60)).padStart(2, '0')}:${String(wakeMinutes % 60).padStart(2, '0')}`
        }

        const subjects = plan.map(l => `${l.nrLekcji}. ${l.przedmiot}`).join(', ')
        return [
          `PLAN ${dayCapitalized.toUpperCase()}:`,
          `Wstawanie: ${wakeUpTime} (1. lekcja: ${firstTime?.od ?? '?'})`,
          `Lekcje: ${subjects}`,
          `Koniec: lekcja ${lastLesson?.nrLekcji ?? '?'} (${LESSON_TIMES[lastLesson?.nrLekcji ?? 1]?.do ?? '?'})`,
        ].join('\n')
      }

      case 'reschedule': {
        const { item, reason, suggest_when = 'jutro' } = input as {
          item: string; reason: string; suggest_when?: string
        }
        await appendRow(SHEETS.SYSTEM_LOG as Parameters<typeof appendRow>[0], [
          new Date().toISOString(), 'RESCHEDULE', item, reason, suggest_when,
        ])
        return `Zalogowano: "${item}" przeniesione → ${suggest_when} (powód: ${reason})`
      }

      case 'log_event': {
        const { type, description, value = '' } = input as {
          type: string; description: string; value?: string
        }
        const today = new Date().toISOString().split('T')[0]!
        await appendRow(SHEETS.SYSTEM_LOG as Parameters<typeof appendRow>[0], [
          new Date().toISOString(), `EVENT_${type.toUpperCase()}`, description, value, today,
        ])
        return `Zalogowano [${type}]: ${description}`
      }

      default:
        return `Nieznane narzędzie: ${name}`
    }
  } catch (e) {
    return `Błąd narzędzia ${name}: ${String(e)}`
  }
}

// ─── GŁÓWNA FUNKCJA ───────────────────────────────────────────────────────
export async function runMasterAgent(userMessage: string): Promise<string> {
  const messages: MessageParam[] = [
    { role: 'user', content: userMessage },
  ]

  let response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: MASTER_SYSTEM,
    tools: TOOLS,
    messages,
  })

  // Pętla tool_use — max 4 rundy
  let rounds = 0
  while (response.stop_reason === 'tool_use' && rounds < 4) {
    rounds++
    const toolUseBlocks = response.content.filter(b => b.type === 'tool_use')
    const toolResults: ToolResultBlockParam[] = []

    for (const block of toolUseBlocks) {
      if (block.type !== 'tool_use') continue
      const result = await executeTool(block.name, block.input as Record<string, unknown>)
      toolResults.push({
        type: 'tool_result',
        tool_use_id: block.id,
        content: result,
      })
    }

    messages.push({ role: 'assistant', content: response.content })
    messages.push({ role: 'user', content: toolResults })

    response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: MASTER_SYSTEM,
      tools: TOOLS,
      messages,
    })
  }

  const textBlock = response.content.find(b => b.type === 'text')
  return textBlock?.type === 'text' ? textBlock.text : 'Błąd — brak odpowiedzi'
}
