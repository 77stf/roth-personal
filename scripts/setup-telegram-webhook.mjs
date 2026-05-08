/**
 * Rejestruje Telegram webhook z secret_token
 * node scripts/setup-telegram-webhook.mjs
 */
import { readFileSync } from 'fs'

const envFile = readFileSync('.env.local', 'utf-8')
const env = {}
for (const line of envFile.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const [key, ...rest] = trimmed.split('=')
  env[key.trim()] = rest.join('=').trim()
}

const TOKEN = env.TELEGRAM_BOT_TOKEN
const SECRET = env.TELEGRAM_WEBHOOK_SECRET
const APP_URL = env.NEXT_PUBLIC_APP_URL ?? 'https://roth-personal.vercel.app'
const WEBHOOK_URL = `${APP_URL}/api/telegram/webhook`

console.log('\n🤖 Telegram Webhook Setup\n')
console.log(`App URL: ${APP_URL}`)
console.log(`Webhook: ${WEBHOOK_URL}`)
console.log(`Secret:  ${SECRET}\n`)

// 1. Usuń stary webhook
const delRes = await fetch(`https://api.telegram.org/bot${TOKEN}/deleteWebhook`)
const delData = await delRes.json()
console.log('Delete old webhook:', delData.ok ? '✅' : '❌', delData.description ?? '')

// 2. Ustaw nowy z secret_token
const setRes = await fetch(
  `https://api.telegram.org/bot${TOKEN}/setWebhook?url=${encodeURIComponent(WEBHOOK_URL)}&secret_token=${SECRET}&allowed_updates=["message","callback_query"]`
)
const setData = await setRes.json()
console.log('Set new webhook:', setData.ok ? '✅' : '❌', setData.description ?? '')

// 3. Weryfikacja
const infoRes = await fetch(`https://api.telegram.org/bot${TOKEN}/getWebhookInfo`)
const info = await infoRes.json()
console.log('\nWebhook info:')
console.log('  URL:', info.result?.url)
console.log('  Pending:', info.result?.pending_update_count)
console.log('  Last error:', info.result?.last_error_message ?? 'brak')
console.log('\n✅ Gotowe! Wyślij /start w Telegram.\n')
