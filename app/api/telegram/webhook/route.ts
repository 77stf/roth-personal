// ROTH Personal OS — Telegram Bot Webhook
// POST /api/telegram/webhook

import { NextRequest, NextResponse } from 'next/server'
import { Bot, webhookCallback } from 'grammy'
import {
  verifyChatId, handleStart, handleBrief, handleChoruje,
  handleWsiadam, handleDotarlem, handleKolegaOdwola,
  handleKoniecSilownia, handlePrzedluzam, handlePosprzatane,
  handleCallbackQuery, handleWeeklyReviewAnswer,
  handleKartkowka, handleOpuscilTrening,
} from '@/lib/telegram'
import { runMasterAgent } from '@/lib/master-agent'
import { getUstawienie, setUstawienie } from '@/lib/sheets'

// Inicjalizuj bot raz
const bot = new Bot(process.env['TELEGRAM_BOT_TOKEN']!)

const BRIEF_COOLDOWN_MS = 30 * 60 * 1000
const BRIEF_MANUAL_KEY = 'brief_last_manual'

// ─── Middleware: weryfikacja chat_id (ZASADA KRYTYCZNA) ────────────────────
bot.use(async (ctx, next) => {
  const chatId = ctx.chat?.id
  if (!chatId || !verifyChatId(chatId)) return
  await next()
})

// ─── Komendy ─────────────────────────────────────────────────────────────
bot.command('start', async ctx => {
  await ctx.reply(await handleStart(), { parse_mode: 'Markdown' })
})

bot.command('brief', async ctx => {
  const now = Date.now()
  const lastStr = await getUstawienie(BRIEF_MANUAL_KEY)
  const last = lastStr ? parseInt(lastStr, 10) : 0
  if (now - last < BRIEF_COOLDOWN_MS) {
    const minLeft = Math.ceil((BRIEF_COOLDOWN_MS - (now - last)) / 60000)
    await ctx.reply(`⏳ Brief wysłany ${Math.floor((now - last) / 60000)} min temu. Następny za ${minLeft} min.`)
    return
  }
  await setUstawienie(BRIEF_MANUAL_KEY, String(now), 'ostatni /brief')
  await ctx.reply('⏳ Generuję brief...')
  const brief = await handleBrief()
  await ctx.reply(brief, { parse_mode: 'Markdown' })
})

bot.command('choruje', async ctx => {
  const { chorujeKeyboard } = await import('@/lib/telegram')
  await ctx.reply('Co Ci dolega?', { reply_markup: chorujeKeyboard })
})

bot.command('wsiadam', async ctx => {
  const reply = await handleWsiadam()
  await ctx.reply(reply, { parse_mode: 'Markdown' })
})

bot.command('dotarlem', async ctx => {
  const reply = await handleDotarlem()
  await ctx.reply(reply, { parse_mode: 'Markdown' })
})

bot.command('kolega_odwola', async ctx => {
  const reply = await handleKolegaOdwola()
  await ctx.reply(reply, { parse_mode: 'Markdown' })
})

bot.command('koniec_silownia', async ctx => {
  // Opcjonalny argument: liczba minut
  const args = ctx.message?.text?.split(' ')
  const minutes = args?.[1] ? parseInt(args[1]) : undefined
  const reply = await handleKoniecSilownia(minutes)
  await ctx.reply(reply, { parse_mode: 'Markdown' })
})

bot.command('przedluzam', async ctx => {
  const args = ctx.message?.text?.split(' ')
  const minutes = args?.[1] ? parseInt(args[1]) : 30
  const reply = await handlePrzedluzam(minutes)
  await ctx.reply(reply, { parse_mode: 'Markdown' })
})

bot.command('posprzatane', async ctx => {
  const reply = await handlePosprzatane()
  await ctx.reply(reply, { parse_mode: 'Markdown' })
})

// ─── Smart sprawdziany parser ──────────────────────────────────────────────
// Użycie: /kartkowka fizyka kolo jutro "układ sił"
// Lub:    /kartkowka lekcja 5 (auto-wykryje przedmiot z PLAN_LEKCJI)
bot.command(['kartkowka', 'sprawdzian', 'kolo', 'praca'], async ctx => {
  const args = ctx.message?.text ?? ''
  const type = ctx.message?.text?.split(' ')[0]?.replace('/', '') ?? 'kartkowka'
  const reply = await handleKartkowka(args, type)
  await ctx.reply(reply, { parse_mode: 'Markdown' })
})

// ─── OFM Quick Brief ─────────────────────────────────────────────────────
// /ofm — uruchamia agenty i wysyła TOP PRIORYTET + 1 content idea
bot.command('ofm', async ctx => {
  await ctx.reply('🤖 Analizuję Azul... (~30s)', { parse_mode: 'Markdown' })
  try {
    const res = await fetch(`${process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'}/api/agents/ofm`, {
      method: 'POST',
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const report = await res.json()
    const { dailyPlan } = report

    const topPriority = dailyPlan.topPriority || '—'
    const idea = dailyPlan.contentIdeas?.[0]
    const reddit = dailyPlan.redditPosts?.[0]
    const rev = dailyPlan.revenueProjection

    let msg = `🔥 *OFM Daily Brief — Azul*\n\n`
    msg += `⚡ *TOP PRIORYTET:* ${topPriority}\n\n`

    if (idea) {
      msg += `📸 *Content:* ${idea.concept}\n`
      if (idea.bestTime) msg += `🕐 Najlepsza pora: ${idea.bestTime}\n`
      msg += '\n'
    }

    if (reddit) {
      msg += `🔴 *Reddit:* r/${reddit.subreddit}\n_${reddit.title}_\n\n`
    }

    if (rev) {
      const pln = (rev.currentMRR * 4.05).toFixed(0)
      msg += `💰 MRR: $${rev.currentMRR} (${pln} PLN) | Break-even: ${rev.breakEvenMonths}m\n`
      msg += `🌴 Do Tajlandii: ${rev.monthsToThailand} miesięcy\n`
    }

    await ctx.reply(msg, { parse_mode: 'Markdown' })
  } catch (e) {
    await ctx.reply(`❌ Błąd agentów OFM: ${String(e)}`)
  }
})

// ─── Anti-fragile training ────────────────────────────────────────────────
bot.command('opuscil_trening', async ctx => {
  const args = ctx.message?.text?.split(' ') ?? []
  const typ = args[1] ?? 'ogolne'
  const reply = await handleOpuscilTrening(typ)
  await ctx.reply(reply, { parse_mode: 'Markdown' })
})

// ─── Pomodoro Timer ────────────────────────────────────────────────────────
// Użycie: /pomo [nazwa zadania]
bot.command('pomo', async ctx => {
  const task = ctx.message?.text?.replace(/^\/pomo\s*/, '').trim() || 'zadanie'
  const chatId = ctx.chat?.id
  if (!chatId) return

  await ctx.reply(
    `🍅 *POMODORO START*\n\n*${task}*\n\nMasz *25 minut* skupienia.\nWróć tutaj o ${getPomoEndTime()}.`,
    { parse_mode: 'Markdown' }
  )

  // Wyślij przypomnienie przez Telegram po 25 minutach (przez Make.com lub bezpośrednio)
  // Na razie: informuj usera żeby ustawił timer ręcznie
  await ctx.reply(
    `⏱ Ustaw timer na 25 min.\nPo przerwie wpisz /pomo żeby zacząć kolejną rundę.`,
    { parse_mode: 'Markdown' }
  )
})

// ─── Streak logger ────────────────────────────────────────────────────────
// Użycie: /streak silownia | /streak woda | /streak ofm_content
bot.command('streak', async ctx => {
  const nawyk = ctx.message?.text?.replace(/^\/streak\s*/, '').trim().toLowerCase()
  if (!nawyk) {
    await ctx.reply('Użycie: `/streak silownia` | `/streak woda` | `/streak ofm_content` | `/streak badminton` | `/streak nauka`', { parse_mode: 'Markdown' })
    return
  }
  const { logStreak } = await import('@/lib/streaks')
  const streak = await logStreak(nawyk)
  const fire = streak.count >= 7 ? '🔥🔥' : streak.count >= 3 ? '🔥' : '✅'
  await ctx.reply(
    `${fire} *${nawyk}* — streak: *${streak.count} dni z rzędu*\nRekord: ${streak.best} dni`,
    { parse_mode: 'Markdown' }
  )
})

// ─── Google Tasks ──────────────────────────────────────────────────────────
// Użycie: /tasks
// ─── Brief kill switch ─────────────────────────────────────────────────────
bot.command('pause_briefs', async ctx => {
  await setUstawienie('briefs_paused', '1', 'briefy wstrzymane przez usera')
  await ctx.reply('⏸ *Briefy wstrzymane.* Wpisz /resume\\_briefs aby wznowić.', { parse_mode: 'Markdown' })
})

bot.command('resume_briefs', async ctx => {
  await setUstawienie('briefs_paused', '0', 'briefy wznowione przez usera')
  await ctx.reply('▶️ *Briefy wznowione.* Morning 07:00, Evening 20:00, Sleep 23:00.', { parse_mode: 'Markdown' })
})

bot.command('tasks', async ctx => {
  await ctx.reply('⏳ Pobieram zadania...')
  const { getTodayTasks, formatTasksForTelegram } = await import('@/lib/google-tasks')
  const tasks = await getTodayTasks().catch(() => [])
  const msg = formatTasksForTelegram(tasks)
  await ctx.reply(msg.length > 0 ? `📋 *TWOJE ZADANIA*\n\n${msg}` : '✅ Brak zadań — dodaj pierwsze!', { parse_mode: 'Markdown' })
})

// ─── Callback queries (inline buttons) ────────────────────────────────────
bot.on('callback_query:data', async ctx => {
  const data = ctx.callbackQuery.data
  const chatId = String(ctx.chat?.id ?? '')
  let response: string | null = null

  // Weekly Review w trakcie?
  const { weeklyReviewStates } = await getWeeklyState(chatId)
  if (weeklyReviewStates) {
    response = await handleWeeklyReviewAnswer(chatId, data)
  } else {
    response = await handleCallbackQuery(data)
  }

  if (response) {
    await ctx.answerCallbackQuery()
    await ctx.reply(response, { parse_mode: 'Markdown' })
  } else {
    await ctx.answerCallbackQuery({ text: 'OK' })
  }
})

// ─── Wiadomości tekstowe → Master Agent ──────────────────────────────────
bot.on('message:text', async ctx => {
  const text = ctx.message.text
  const chatId = String(ctx.chat.id)

  // Pomiń komendy (obsłużone wyżej)
  if (text.startsWith('/')) return

  // Weekly Review w trakcie?
  const { weeklyReviewActive } = await getWeeklyState(chatId)
  if (weeklyReviewActive) {
    const response = await handleWeeklyReviewAnswer(chatId, text)
    await ctx.reply(response, { parse_mode: 'Markdown' })
    return
  }

  // Szybki wydatek (wzorzec: "45 zl jedzenie")
  if (/^\d+\s*(zl|zł|pln)/i.test(text.trim())) {
    const { handleTextMessage } = await import('@/lib/telegram')
    const response = await handleTextMessage(text)
    if (response) { await ctx.reply(response, { parse_mode: 'Markdown' }); return }
  }

  // Master Agent — obsługuje wszystko pozostałe
  const response = await runMasterAgent(text)
  await ctx.reply(response, { parse_mode: 'Markdown' })
})

// Helper: sprawdź czy Weekly Review aktywny
async function getWeeklyState(chatId: string) {
  // Importuj stan z telegram.ts
  try {
    const mod = await import('@/lib/telegram')
    // @ts-expect-error — internal state
    const states = mod.weeklyReviewStates as Map<string, unknown>
    return { weeklyReviewActive: states.has(chatId), weeklyReviewStates: states.has(chatId) ? states.get(chatId) : null }
  } catch {
    return { weeklyReviewActive: false, weeklyReviewStates: null }
  }
}

// ─── Helper: czas końca Pomodoro ─────────────────────────────────────────
function getPomoEndTime(): string {
  const end = new Date(Date.now() + 25 * 60 * 1000)
  return `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`
}

// ─── Webhook handler ──────────────────────────────────────────────────────
const handleUpdate = webhookCallback(bot, 'std/http')

export async function POST(req: NextRequest) {
  // Weryfikacja sekretu webhooka
  const secret = req.headers.get('x-telegram-bot-api-secret-token')
  if (process.env['TELEGRAM_WEBHOOK_SECRET'] && secret !== process.env['TELEGRAM_WEBHOOK_SECRET']) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    return await handleUpdate(req)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Błąd'
    console.error('[Telegram Webhook]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
