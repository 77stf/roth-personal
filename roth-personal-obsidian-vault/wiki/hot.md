---
type: meta
title: "Hot Cache"
updated: 2026-05-10T00:00:00
---

# Recent Context

## Last Updated
2026-05-10. Sesja 7 — brief spam fix, brief redesign, GitHub Actions sleep brief, OFM system plan, UI/UX design spec.

## Key Recent Facts (sesja 6-7)

### System briefów — NAPRAWIONY
- Brief spam fix: deduplication w Google Sheets (USTAWIENIA), nie in-memory
- CRON_SECRET auth blokuje nieautoryzowane wywołania w produkcji
- Nowy format: deterministyczny (zero LLM), Telegram-native
- Kill switch: /pause_briefs / /resume_briefs
- Eat the Frog 🐸 w porannym (pierwszy [red] task)
- Streaki w wieczornym (sekcja STREAKI)
- Sleep brief: GitHub Actions 23:00 (Make.com free = max 2 scenariusze)
- Make.com: morning 07:00 + evening 20:00

### Nowe komendy Telegram (łącznie 17)
/brief /pause_briefs /resume_briefs /wsiadam /dotarlem /kolega_odwola /kartkowka /sprawdzian /koniec_silownia /opuscil_trening /choruje /tasks /streak /pomo /posprzatane /przedluzam /ofm

### OFM Biznes Update
- Agencja od chattingu: US/UK branch otwiera za 2-3 tygodnie, Polska działa świetnie
- Reddit admin: rób chatting sam → AI chatting system w planie
- Materiały od Hadiego: skrypty chattingowe do przetworzenia przez claude-video

### Projekty w kolejce
1. UI/UX Redesign (spec: 02_Projects/UI-UX-Redesign.md) — NASTĘPNA SESJA
2. Video Processing Pipeline (02_Projects/Video-Processing-Pipeline.md) — po UI
3. OFM Expert Multi-Agent (02_Projects/OFM-Expert-System.md) — po uzupełnieniu kanałów

## Zasada pracy z Claude Code
Claude **zawsze** rekomenduje agentów po każdej wiadomości. Obsidian = ultra-narzędzie — każda ważna info trafia tu.

## Active Threads
- Vercel deploy: middleware fix (PUBLIC_PATHS dla /api/system) — sprawdź dashboard Vercel czy build de79e9a OK
- STREAKI sheet: wywołaj POST /api/system/setup po deployu
- GitHub Actions: dodaj secret CRON_SECRET w repo settings
