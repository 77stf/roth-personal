# Video Processing Pipeline — Plan

> Status: PLANOWANIE | Do zbudowania po UI/UX
> Tool: https://github.com/bradautomates/claude-video
> Powiązane: [[OFM-Expert-System]], [[AI Consulting Pipeline]]

---

## Cel

Automatyczne przetwarzanie wideo z materiałów Dr. Hadiego (skrypty, tutoriale) na tekst i opisy dla Obsidian. Claude ogląda klatki + słyszy audio → wyciąga informacje → zapisuje do wiki/ofm/[kanał]/.

## Zastosowanie

1. **Skrypty OFM** — modelka na ekranie → AI opisuje co robi + wyciąga tekst skryptu
2. **Tutoriale** — nagranie Hadiego → wyciąga kluczowe informacje do sub-agenta
3. **Poradniki kanałowe** — każdy kanał (reddit, chatting, twitter itp) ma tutoriale → każdy idzie do swojego sub-agenta

---

## Pipeline

```
Plik .mp4 / .mov
    ↓
claude-video (bradautomates/claude-video)
    ├── Frame extraction (co Xs)
    ├── Audio transcription (Whisper lub Claude)
    └── Claude vision: opisuje każdą klatkę
    ↓
JSON output: { transcript, frames_description, key_points }
    ↓
Nasz processor (lib/video-processor.ts)
    ├── Identyfikuje kanał (reddit / chatting / instagram...)
    ├── Formatuje na Obsidian markdown
    └── Zapisuje do wiki/ofm/[kanał]/[tytuł].md
    ↓
Sub-agent dla kanału automatycznie ładuje nową wiedzę
```

---

## Implementacja

### Krok 1 — Setup claude-video
```bash
git clone https://github.com/bradautomates/claude-video
cd claude-video
npm install
# Wymaga ANTHROPIC_API_KEY
```

### Krok 2 — API endpoint
```
POST /api/tools/process-video
Body: { videoPath, channel, title }
→ Uruchamia claude-video
→ Przetwarza output
→ Zapisuje do Obsidian
→ Zwraca { success, filePath, keyPoints }
```

### Krok 3 — Telegram komenda
```
/process_video [kanał] [tytuł]
→ Użytkownik wgrywa wideo do Telegrama
→ Bot pobiera plik
→ Wywołuje /api/tools/process-video
→ Odpowiada: "✅ Zapisano do wiki/ofm/chatting/skrypt-xyz.md"
```

---

## Format wyjściowy (Obsidian)

```markdown
# [Tytuł wideo] — [Kanał]

> Źródło: wideo | Przetworzone: [data] | Długość: Xmin

## Kluczowe punkty
- punkt 1
- punkt 2

## Transkrypt
[pełny tekst z audio]

## Opisy wizualne
**[0:00-0:30]** [opis co widać na ekranie]
**[0:30-1:00]** [opis dalej...]

## Tagi
#ofm #[kanał] #skrypt #hadi
```

---

## Ważne — treści dla dorosłych

Claude potrafi opisywać treści wizualne z wideo (klatki). Dla skryptów OFM gdzie modelka jest na ekranie — Claude opisuje pozycje, gesty, ekspresje w kontekście skryptu chattingowego. To kluczowe dla pełnego kontekstu dla sub-agenta chattingowego.

Obsidian vault jest prywatny, lokalne pliki.

---

## Kolejność budowy

1. Przetestuj claude-video lokalnie na przykładowym wideo (nie OFM)
2. Zbuduj `lib/video-processor.ts`
3. Zbuduj `/api/tools/process-video` endpoint
4. Dodaj `/process_video` komendę Telegram
5. Przetwórz kanały Hadiego (zacznij od chatting — priorytet)
6. Zasilaj sub-agentów OFM w miarę przetwarzania
