---
title: "Smart Planner — Architektura"
type: meta
created: 2026-05-09
updated: 2026-05-09
tags: ["planner", "architektura", "google-tasks"]
---

# Smart Planner — Architektura systemu

Inteligentny osobisty planista który ZNA wszystko i PLANUJE perfekcyjnie.

## Źródła danych (wszystkie połączone)

```
Google Calendar  ──┐
Google Tasks     ──┤
ZADANIA_DNIA     ──┼──→ Smart Planner Agent ──→ Telegram
PLAN_LEKCJI      ──┤
ROZKLAD_BUSOW    ──┤
STREAKI          ──┘
```

## Co umie Smart Planner

### Planowanie
- Zna godziny lekcji, przerwy, zastępstwa
- Liczy czas transportu (z buforem na spóźnienie)
- Blokuje czas na treningi i stałe zajęcia
- Generuje Time Blocks na każdy dzień

### Zadania
- Tworzy zadania w Google Tasks (sync z mobilem)
- Klasyfikuje przez Eisenhower Matrix automatycznie
- Przesuwa zadania gdy plan się zmienia
- Przypomina o zadaniach z deadlineami

### Odporność na warunki
- Zastępstwo w szkole → automatycznie przesuwa blok pracy
- Spóźnienie autobusu → informuje przez Telegram
- Energia 1-2/5 → usuwa czerwone zadania z planu
- Choroba → tryb minimalny (tylko krytyczne)

### Rozmowa przez Telegram
```
User: "co mam dziś zrobić?"
→ Planista generuje Time-Blocked schedule na dziś

User: "przesuń siłownię na jutro"
→ Aktualizuje Google Tasks + Calendar

User: "zapisz że spotkałem się z Dr. Hadi"
→ Zapisuje do Obsidian + aktualizuje ostatni kontakt
```

## Architektura techniczna

```
lib/google-tasks.ts     ← Google Tasks API wrapper
lib/planner-agent.ts    ← Smart Planner (rozszerza Master Agent)
lib/streaks.ts          ← Seinfeld streak tracker
app/api/planner/        ← endpoints
app/api/pomo/           ← Pomodoro timer (Telegram)
```

## Google Tasks vs ZADANIA_DNIA

| | Google Tasks | ZADANIA_DNIA (Sheets) |
|---|---|---|
| Dostęp | Mobilna app Google | Dashboard ROTH |
| Sync | Real-time | Na żądanie |
| Historia | 30 dni | Bezterminowo |
| Eisenhower | Tagi | Kolumny |
| **Przepływ** | User dodaje w apce → sync do Sheets | Dashboard → opcjonalnie sync do GT |

## Build order

1. `lib/google-tasks.ts` — podstawowe CRUD
2. `lib/streaks.ts` — tracker nawyków
3. Rozszerzenie Master Agent o nowe narzędzia
4. `/pomo` Telegram command
5. Morning brief upgrade (żaba + time blocks)
6. Evening brief upgrade (streaki)
