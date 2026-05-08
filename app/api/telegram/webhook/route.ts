// ROTH Personal OS — Telegram Bot Webhook
// POST /api/telegram/webhook

import { NextRequest, NextResponse } from 'next/server'
import { Bot, webhookCallback } from 'grammy'
import {
  verifyChatId, handleStart, handleBrief, handleChoruje,
  handleWsiadam, handleDotarlem, handleKolegaOdwola,
  handleKoniecSilownia, handlePrzedluzam, handlePosprzatane,
  handleTextMessage, handleCallbackQuery, handleWeeklyReviewAnswer,
  startWeeklyReview, sendMessage,
  handleKartkowka, handleOpuscilTrening,
} from '@/lib/telegram'

// Inicjalizuj bot raz
const bot = new Bot(process.env['TELEGRAM_BOT_TOKEN']!)

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

// ─── Anti-fragile training ────────────────────────────────────────────────
// Użycie: /opuscil_trening silownia (powód opcjonalny)
bot.command('opuscil_trening', async ctx => {
  const args = ctx.message?.text?.split(' ') ?? []
  const typ = args[1] ?? 'ogolne'
  const reply = await handleOpuscilTrening(typ)
  await ctx.reply(reply, { parse_mode: 'Markdown' })
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

// ─── Wiadomości tekstowe ──────────────────────────────────────────────────
bot.on('message:text', async ctx => {
  const text = ctx.message.text
  const chatId = String(ctx.chat.id)

  // Weekly Review w trakcie?
  const { weeklyReviewActive } = await getWeeklyState(chatId)
  if (weeklyReviewActive) {
    const response = await handleWeeklyReviewAnswer(chatId, text)
    await ctx.reply(response, { parse_mode: 'Markdown' })
    return
  }

  const response = await handleTextMessage(text)
  if (response) {
    await ctx.reply(response, { parse_mode: 'Markdown' })
  }
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
