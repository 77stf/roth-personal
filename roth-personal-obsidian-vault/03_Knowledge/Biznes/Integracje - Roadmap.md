---
type: knowledge
title: "Integracje — Roadmap"
created: 2026-05-08
updated: 2026-05-08
status: active
tags: [integracje, system, roadmap]
---

# Integracje — Co Warto Dodać do ROTH OS

## TIER 1 — Wysokie ROI, Łatwe do wdrożenia

### Google Tasks → Smart Parser ✅ (zbudowane)
- User pisze: `/kartkowka fizyka jutro "układ sił"`
- System auto-wykrywa przedmiot z PLAN_LEKCJI jeśli podasz "lekcja N"
- Zapisuje do Sheets (SPRAWDZIANY) z typem, datą, tematem
- Telegram commands: `/kartkowka`, `/sprawdzian`, `/kolo`, `/praca`

### Revolut Webhooks — Auto-tracking wydatków
- Każda transakcja → webhook → FINANSE_WYDATKI w Sheets
- Zero ręcznego wpisywania wydatków
- Potrzebne: Revolut API (dostępne dla Junior accounts?)
- Alternatywa: zdjęcie paragonu → Claude Vision → Sheets

### Strava Integration — Sport tracking
- Po treningu siłowni: auto-log do TRENINGI_LOG
- Synchronizacja kroków, aktywności
- API darmowe dla basic
- Make.com scenario: Strava → Sheets

### Spotify — Focus Music per Energy Zone
- ROZRUCH (07-11): lo-fi / ambient
- SZCZYT (14-19): energetyczna, bez słów
- ZWALNIANIE (23-01): spokojna
- Trigger: Telegram `/muzyka` → Spotify playlist

## TIER 2 — Wysoki impact, wymaga więcej pracy

### PKP/MZK Real-time
- Sprawdzanie real-time czy autobus jedzie punktualnie
- API: PKP Intercity, lokalne MZK (jeśli dostępne)
- Fallback: komunikacja przez Telegram gdy bus spóźniony > 10 min
- Problem: lokalne busy (PKS Konarskie) rzadko mają API

### Google Calendar → Morning Brief Sync
- Spotkania z kalendarza → morning brief
- Alert "spotkanie za 30 min" przez Telegram
- Już częściowo zbudowane (calendar.ts)

### Obsidian Local REST API — Pełna integracja
- Port 27124 (zainstaluj plugin)
- Agent może pisać i czytać notatki
- `/save`: szybkie zapisanie myśli do INBOX
- Graphify: knowledge graph z całego vault

### Make.com — 17 scenariuszy
Priorytetowe scenariusze:
1. Rewolut → Sheets (wydatki)
2. Strava → Sheets (treningi)
3. Google Calendar → Telegram (alerty spotkań)
4. Cron: morning brief (07:00 każdy dzień)
5. Cron: evening brief (21:00)
6. Cron: water reminder (co 2h)
7. Cron: sprawdzenie prania (codziennie 18:00)

## TIER 3 — Future / Skomplikowane

### Voice Notes → Obsidian
- Nagranie głosowe → Whisper transcription → INBOX
- iOS Shortcut lub Telegram voice → Make.com → Sheets/Obsidian

### AI Meeting Notes
- Nagranie spotkania → transcript → podsumowanie → Obsidian
- Tools: Fireflies.ai, Otter.ai (darmowe plany)

### Financial Forecasting
- Claude analizuje FINANSE_PRZYCHODY + FINANSE_WYDATKI
- Prognoza: "Do Tajlandii masz jeszcze X miesięcy przy obecnym tempie"
- Cron: co miesiąc, auto-update FINANSE_CELE (kolumna: prognoza)

### Anki Integration — Nauka
- Kartkowka/sprawdzian dodany → auto-tworzy Anki deck
- Export do Anki przez AnkiConnect (lokalnie)

## WAKEUP SYSTEM — Problem: trudne wstawanie

Rozwiązanie wielopoziomowe przez Telegram:
1. **Alarm 1** (06:15): "Wstawaj — szkoła za X min, autobus za Y min"
2. **Alarm 2** (06:25): "OSTATNIE WEZWANIE — wyjście za 5 min"
3. **Alarm 3** (06:30): "Spóźnisz się. /kolega_odwola jeśli jedziesz inaczej"

Implementacja: Make.com cron job → Telegram API

## ANTI-FRAGILE TRAINING ✅ (zbudowane)

Gdy trening odpada:
- `/opuscil_trening silownia` → system sugeruje zastępstwo
- Każde zastępstwo logowane w TRENINGI_LOG (status: opuszczony)
- Tygodniowy streak w morning brief

## TRANSPORT — Smart System ✅ (zbudowane)

Stan na dziś:
- Primary: samochód z kolegą (domyślne)
- Backup: autobus (ROZKLAD_BUSOW w Sheets)
- `/kolega_odwola` → system przelicza busy automatycznie
- Przesiadka Konarskie→Bnin→Śrem lub Konarskie→Śrem bezpośrednio
- Walk to stop: 10 min; Bus delay buffer: 5 min (realnie 3-5 min)
- Zmiana rozkładu: edytuj tylko ROZKLAD_BUSOW w Sheets (zero kodu)

## Linki
- [[03_Knowledge/AI/_INDEX]]
- [[02_Projects/AI_Consulting/_INDEX]]
