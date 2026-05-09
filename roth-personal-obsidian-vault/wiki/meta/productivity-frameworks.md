---
title: "Productivity Frameworks — ROTH System"
type: meta
created: 2026-05-09
updated: 2026-05-09
tags: ["produktywność", "system", "planowanie"]
---

# Productivity Frameworks → ROTH System

Frameworks wbudowane w system. Nie opcje — domyślne zachowanie.

## 3/3/3 Method — główna struktura dnia

Każdy dzień = 3 kategorie zadań:

| Kategoria | Czas | Przykłady |
|-----------|------|---------|
| 🔴 **GŁĘBOKA PRACA** (3h) | Blok ciągły, priorytet 1 | Content Azul, negocjacje, nauka |
| 🟡 **PILNE KRÓTKIE** (3 zadania) | Do 30min każde | Odpisanie Dr. Hadi, przelew, forma |
| 🟢 **UTRZYMANIE** (3 zadania) | Dom, ciało, rutyna | Woda, leki, sprzątanie |

**W systemie:** `add_task` przyjmuje `category: 3h_deep | urgent | maintenance`

---

## Eat the Frog — pierwsze zadanie dnia

> Najtrudniejsza rzecz → zrób PIERWSZA.

**W systemie:** Pierwsze `🔴` zadanie = Żaba dnia. Pojawia się w porannym briefie jako `🐸 ŻABA`.

---

## Eisenhower Matrix — klasyfikacja zadań

```
           PILNE          NIE PILNE
WAŻNE  │ 🔴 ZrÓB TERAZ │ 🟡 Zaplanuj  │
       │───────────────────────────────│
NIE    │ 🟢 Deleguj    │ ❌ Usuń       │
WAŻNE  │               │               │
```

**W systemie:** Telegram Master Agent klasyfikuje każde nowe zadanie przez te 2 wymiary.

---

## Seinfeld Strategy — streaki nawyków

Nawyki z codziennym trackowaniem:

| Nawyk | Cel | Streak key |
|-------|-----|------------|
| 💪 Siłownia | Mon/Śr/Pt | `streak_silownia` |
| 🏸 Badminton | Wt/Pt | `streak_badminton` |
| 💧 Woda 2000ml | Codziennie | `streak_woda` |
| 📸 Content OFM | Codziennie | `streak_ofm_content` |
| 📖 Nauka | Codziennie | `streak_nauka` |

**W systemie:** Sheets `STREAKI` — data ostatniego wykonania + liczba dni z rzędu. Wieczorny brief pokazuje streaki.

---

## Pomodoro — sesje skupienia

```
25 min praca → 5 min przerwa → x4 → 30 min przerwa
```

**W systemie:** Telegram `/pomo [zadanie]` → bot odlicza 25 min → ping z przerwą.

---

## Time Blocking — bloky w planie dnia

Poranny brief proponuje bloky na podstawie dnia:

```
Szkolny dzień:
06:30  Wstanie + leki
07:20  Wyjście → szkoła
08:00–14:00  Szkoła
14:30–17:30  🔴 Głęboka praca (OFM/AI)
17:30–19:00  💪 Trening
19:00–20:00  🟡 Pilne krótkie
20:00–22:00  🟢 Utrzymanie + nauka
23:30  Sen

Wolny dzień:
09:00  Wstanie
09:30–12:30  🔴 Głęboka praca (3h blok)
12:30–13:00  Przerwa
13:00–14:00  🟡 Pilne x3
14:00–15:00  💪 Trening
15:00–17:00  🟢 Utrzymanie x3
```

---

## Status implementacji

- [x] 3/3/3 w porannym briefie (priorytety 🔴🟡🟢)
- [ ] 🐸 Żaba — highlight w briefie
- [ ] Streaki (STREAKI sheet + wieczorny brief)
- [ ] /pomo Telegram command
- [ ] Time blocking w porannym briefie
- [ ] Eisenhower klasyfikacja w add_task
- [ ] Google Tasks sync
