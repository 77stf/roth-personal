# UI/UX Redesign — Design Spec

> Status: GOTOWY DO IMPLEMENTACJI | Następna sesja
> Powiązane: [[ROTH Life OS]], [[OFM-Expert-System]]

---

## Design Language

**Styl:** Corporate-modern + Terminal UX + Apple polish
**Tryb:** Light mode (tylko)
**Filozofia:** Reprezentacja firmy — zero vibe coding, system-level professional delivery

### Paleta kolorów
```
Background:    #FFFFFF (pure white)
Surface:       #F5F5F7 (Apple light grey)
Surface-2:     #E8E8ED (deeper grey panels)
Border:        #D2D2D7 (subtle borders)
Text-primary:  #1D1D1F (Apple near-black)
Text-secondary:#6E6E73 (Apple secondary grey)
Accent-red:    #FF3B30 (iOS red — najważniejsze elementy, alerty, CTA)
Accent-dark:   #000000 (headings, active states)
```

### Typografia
```
Heading font:  Inter lub SF Pro Display (system-ui fallback)
Body font:     Inter Regular 14px / line-height 1.5
Code/terminal: JetBrains Mono — dane, statusy, komendy
Weights:       400 (body), 500 (labels), 600 (headings), 700 (KPI numbers)
```

### Glassmorphism — użycie
```css
/* Panel cards — stosować na sidebar i overlay panele */
background: rgba(255, 255, 255, 0.72);
backdrop-filter: blur(20px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.6);
border-radius: 12px;
box-shadow: 0 2px 20px rgba(0,0,0,0.06);

/* Nie na każdym elemencie — tylko: sidebar, modal, top nav, stat cards */
```

### Ikonki
```
Biblioteka: lucide-react (Apple-style, stroke icons)
Rozmiary:   16px (inline), 20px (nav), 24px (feature)
Kolor:      currentColor — dziedziczą z tekstu
Zero emoji w UI
```

---

## Layout — Struktura Stron

### Sidebar (stały, 240px)
```
Logo ROTH OS                    [avatar/logo]
─────────────────────────────
Dashboard
Szkoła
Trening
OFM                             [badge: Azul]
AI Consulting
Finanse
Dom
─────────────────────────────
Ustawienia
```

### Top Bar (64px)
```
[Sidebar toggle]  [Breadcrumb]          [Scoring: 14/20 ████░░░░░░]  [Status dot]
```

### Content Grid
```
Main content: max-w-7xl, padding 24px
Cards: border-radius 12px, shadow-sm
KPI row: 4 stat cards top
Below: 2-column split (main 2/3 + sidebar 1/3)
```

---

## Komponenty do zbudowania

### StatCard
```tsx
<StatCard
  label="Energia dziś"
  value="14/20"
  trend="+2 od wczoraj"
  icon={<Zap />}
  variant="default" | "danger" | "success"
/>
// Glassmorphism background, red accent jeśli danger
```

### BriefPanel
```
Terminal-style: monospace font, dark surface
Header: "PORANNY BRIEF · Niedziela 10.05" — uppercase, tracking
Eat the Frog: wyróżniony box z czerwoną lewą borduną
Sekcje: separator lines zamiast nagłówków bold
```

### AgentStatusBadge
```
● Reddit Expert    [active]
● Instagram Expert [active]  
○ Chatting Expert  [pending — brak danych]
Zielona/czerwona/szara kropka + label + stan
```

### TaskList (3/3/3 view)
```
Deep Work  [2]    Urgent [1]    Maintenance [3]
Trzy kolumny, checkbox + label, done = strikethrough
Czerwona kropka = Eat the Frog
```

### StreakCard
```
nawyk    ████████░░  8/30 dni    🔥
Seinfeld calendar mini (7 dni wstecz: ✓/✗ boxes)
```

---

## Strony do przebudowania (kolejność)

1. `/` — Dashboard (główna, najważniejsza)
2. `/szkola` — Szkoła + sprawdziany
3. `/trening` — Trening + streaki
4. `/ofm` — OFM brief + agent status
5. `/finanse` — Budżet
6. `/dom` — Dom alerts
7. `/ustawienia` — Config

---

## Techniczne wymagania

- Tailwind CSS v4 (już w projekcie)
- lucide-react: `npm install lucide-react`
- shadcn/ui components (opcjonalnie, jeśli nie ma)
- Wszystkie komponenty w `components/ui/`
- Strony w `app/(dashboard)/`
- Server components tam gdzie możliwe, client tylko dla interakcji

---

## Jak zacząć nową sesję

1. Powiedz: "Robimy UI/UX redesign — czytaj spec z Obsidian"
2. Użyj agenta: `frontend-developer` + `ui-designer`
3. Zacznij od: `components/ui/StatCard.tsx` → `components/ui/BriefPanel.tsx` → `app/page.tsx`
4. Po każdej stronie testuj na localhost:3000
