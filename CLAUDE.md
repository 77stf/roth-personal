# ROTH Personal OS

Personal operating system for Roth — AI-powered life management.

## Stack
- Next.js 14 (App Router)
- Vercel (deployment)
- Google Sheets (data storage)
- Google Calendar (read-only)
- Telegram Bot (notifications)
- Obsidian Local REST API (vault access, port 27124)

## Wiki Knowledge Base

Path: `C:\Users\crypt\ROTH Personal\roth-personal-obsidian-vault`

When you need context not already in this project:
1. Read `wiki/hot.md` first (recent context, ~500 words)
2. If not enough, read `wiki/index.md`
3. If you need domain specifics, read `wiki/<domain>/_index.md`
4. Only then read individual wiki pages

Do NOT read the wiki for general coding questions or things already in this project.

## Environment
- `.env.local` — all secrets (never commit)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` — OAuth
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` — notifications
- `OBSIDIAN_API_KEY`, `OBSIDIAN_PORT=27124` — vault access
