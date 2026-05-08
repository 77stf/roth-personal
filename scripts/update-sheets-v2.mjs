/**
 * ROTH Personal OS — Aktualizacja Google Sheets z realnymi danymi
 * Dane z CLAUDE.md v4.0 FINAL
 * Uruchom: node scripts/update-sheets-v2.mjs
 */

import { readFileSync } from 'fs'
import { google } from 'googleapis'

const envFile = readFileSync('.env.local', 'utf-8')
const env = {}
for (const line of envFile.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const [key, ...rest] = trimmed.split('=')
  env[key.trim()] = rest.join('=').trim()
}

const auth = new google.auth.OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET)
auth.setCredentials({ refresh_token: env.GOOGLE_REFRESH_TOKEN })
const sheets = google.sheets({ version: 'v4', auth })
const SPREADSHEET_ID = env.GOOGLE_SHEETS_ID

async function clearAndSet(sheetName, values) {
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:Z`,
  })
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  })
  console.log(`  ✅ ${sheetName} — ${values.length - 1} wierszy`)
}

async function appendRows(sheetName, rows) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A1`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: rows },
  })
  console.log(`  ✅ ${sheetName} — dodano ${rows.length} wierszy`)
}

async function main() {
  console.log('\n🚀 ROTH Personal OS — Aktualizacja danych w Sheets\n')

  // ─── 1. ROZKLAD_BUSOW — realne godziny ───────────────────────────────────
  console.log('📍 ROZKLAD_BUSOW (realne godziny z CLAUDE.md v4.0)...')
  await clearAndSet('ROZKLAD_BUSOW', [
    ['trasa', 'kierunek', 'godzina', 'aktywny'],
    // Konarskie → Bnin (do szkoły, etap 1)
    ['Konarskie-Bnin', 'do_szkoly', '06:54', 'T'],
    ['Konarskie-Bnin', 'do_szkoly', '07:35', 'T'],
    ['Konarskie-Bnin', 'do_szkoly', '08:11', 'T'],
    ['Konarskie-Bnin', 'do_szkoly', '09:32', 'T'],
    ['Konarskie-Bnin', 'do_szkoly', '09:54', 'T'],
    ['Konarskie-Bnin', 'do_domu', '12:56', 'T'],
    ['Konarskie-Bnin', 'do_domu', '13:34', 'T'],
    ['Konarskie-Bnin', 'do_domu', '14:11', 'T'],
    ['Konarskie-Bnin', 'do_domu', '14:50', 'T'],
    // Bnin → Śrem (do szkoły, etap 2 / przesiadka)
    ['Bnin-Srem', 'do_szkoly', '07:07', 'T'],
    ['Bnin-Srem', 'do_szkoly', '08:33', 'T'],
    ['Bnin-Srem', 'do_szkoly', '09:52', 'T'],
    ['Bnin-Srem', 'do_domu', '10:57', 'T'],
    ['Bnin-Srem', 'do_domu', '11:46', 'T'],
    ['Bnin-Srem', 'do_domu', '13:21', 'T'],
    ['Bnin-Srem', 'do_domu', '13:52', 'T'],
    // Konarskie → Śrem (bezpośredni)
    ['Konarskie-Srem', 'do_szkoly', '07:09', 'T'],
    ['Konarskie-Srem', 'do_domu', '11:53', 'T'],
    ['Konarskie-Srem', 'do_domu', '13:28', 'T'],
  ])

  // ─── 2. RZECZY_CODZIENNE — dodaj Lanolinę ────────────────────────────────
  console.log('💊 RZECZY_CODZIENNE (dodaję Lanolinę)...')
  await clearAndSet('RZECZY_CODZIENNE', [
    ['nazwa', 'typ', 'godzina', 'czestotliwosc', 'ostatnio'],
    ['Kawa', 'napoj', '07:30', 'codziennie', ''],
    ['Witaminy', 'suplement', '08:00', 'codziennie', ''],
    ['Woda - uzupelnij bidon', 'nawodnienie', '07:00', 'codziennie', ''],
    ['Lanolina (usta)', 'pielegnacja', 'wieczor', 'codziennie', ''],
  ])

  // ─── 3. OSOBY_PROFILE — 8 osób z CLAUDE.md ───────────────────────────────
  console.log('👥 OSOBY_PROFILE (8 osób)...')
  await clearAndSet('OSOBY_PROFILE', [
    ['imie', 'rola', 'ostatniKontakt', 'otwarteSrawy', 'notatki', 'alertBrakKontaktu'],
    ['Dr. Hadi Saleh', 'Mentor AI / Partner Biznesowy', '', 'Projekt AI consulting', 'Mentor z branzy AI, kluczowy kontakt biznesowy', '14'],
    ['Mikolaj', 'Przyjaciel / Kolega z klasy', '', '', 'Bliski przyjaciel, kolega szkolny', '7'],
    ['Sorin', 'Kontakt OFM', '', 'OFM wspolpraca', 'Kontakt w branzy OFM', '14'],
    ['Robert', 'Kolega / Kontakt', '', '', 'Znajomy', '30'],
    ['Kacper', 'Przyjaciel', '', '', 'Kolega', '14'],
    ['Franek', 'Przyjaciel', '', '', 'Kolega', '14'],
    ['Marcel', 'Przyjaciel', '', '', 'Kolega', '14'],
    ['Nikodem', 'Przyjaciel', '', '', 'Kolega', '14'],
  ])

  // ─── 4. USTAWIENIA — kompleksowe ─────────────────────────────────────────
  console.log('⚙️ USTAWIENIA (kompleksowe)...')
  const now = new Date().toISOString()
  await clearAndSet('USTAWIENIA', [
    ['klucz', 'wartosc', 'opis', 'zaktualizowano'],
    ['tryb_nocny', 'T', 'Nocna sowa — aktywna po 22:00', now],
    ['klasa', '3PB', 'Klasa szkolna', now],
    ['grupa', '2/2', 'Podgrupa do fizyki i innych', now],
    ['water_cel_ml', '2000', 'Dzienny cel wody w ml', now],
    ['miasto', 'Srem', 'Lokalizacja dla pogody (Śrem)', now],
    ['sen_polnoc', '00:30', 'Docelowa godzina zasniecia', now],
    ['budzenie', '06:20', 'Godzina pobudki w dni szkolne', now],
    ['transport_bufor_min', '10', 'Bufor czasowy na przystanek (minuty)', now],
    ['transport_baza', 'Konarskie', 'Przystanek startowy', now],
    ['badminton_dni', 'wtorek,piatek', 'Dni treningow badmintona', now],
    ['wielki_cel', 'Tajlandia 2027', 'Glowny cel zyciowy', now],
    ['jezyk_systemu', 'pl', 'Jezyk interfejsu systemu', now],
    ['scoring_max', '20', 'Maksymalna liczba punktow dnia', now],
    ['ofm_prowizja_domyslna', '50', 'Domyslny procent prowizji OFM', now],
    ['ai_model', 'claude-sonnet-4-6', 'Model AI do briefingow', now],
    ['briefing_rano_godz', '07:00', 'Godzina porannego briefingu Telegram', now],
    ['briefing_wieczor_godz', '21:00', 'Godzina wieczornego briefingu Telegram', now],
  ])

  // ─── 5. FINANSE_BUDZET — 9 kategorii ─────────────────────────────────────
  console.log('💰 FINANSE_BUDZET (9 kategorii)...')
  await clearAndSet('FINANSE_BUDZET', [
    ['kategoria', 'limit', 'wydano'],
    ['Jedzenie', 400, 0],
    ['Transport', 150, 0],
    ['Rozrywka', 200, 0],
    ['Ubrania', 100, 0],
    ['Zdrowie', 100, 0],
    ['Biznes', 300, 0],
    ['Edukacja', 100, 0],
    ['Oszczednosci', 500, 0],
    ['Inne', 150, 0],
  ])

  // ─── 6. PRANIE_LOG — daty (tydzien temu) ─────────────────────────────────
  console.log('🧺 PRANIE_LOG (ostatnie pranie tydzien temu = 2026-05-01)...')
  await clearAndSet('PRANIE_LOG', [
    ['kategoria', 'dataOstatniego', 'status', 'uwagi', 'limitDni'],
    ['biale', '2026-05-01', 'ok', '', 5],
    ['ciemne', '2026-05-01', 'ok', '', 5],
    ['kolorowe_jasne', '2026-05-01', 'ok', '', 6],
    ['szare_mieszane', '2026-05-01', 'ok', '', 6],
    ['sportowe_delikatne', '2026-05-01', 'ok', '', 3],
  ])

  // ─── 7. CYTATY — z CLAUDE.md / dodatkowe ─────────────────────────────────
  console.log('💬 CYTATY (uzupelnione)...')
  await clearAndSet('CYTATY', [
    ['cytat', 'autor', 'kategoria'],
    ['Kazdy dzien to krok blizej Tajlandii.', 'ROTH', 'motywacyjny'],
    ['Dyscyplina to wolnosc.', 'Jocko Willink', 'skupienie'],
    ['Nie ma gotowosci — jest tylko dzialanie.', '', 'motywacyjny'],
    ['Zlozone rzeczy wymagaja prostych systemow.', '', 'skupienie'],
    ['Zrob to dzis, bo jutro bedziesz zalowal wczoraj.', '', 'wytrwalosc'],
    ['Elita nie odpoczywa — elita regeneruje sie strategicznie.', '', 'przetrwanie'],
    ['Praca bez planu to chaos. Plan bez pracy to marzenie.', '', 'produktywnosc'],
    ['Twoj czas jest najcenniejszym zasobem.', '', 'czas'],
    ['Kazde NIE dla rozrywki to TAK dla Tajlandii.', 'ROTH', 'cel'],
    ['System bije motywacje w dlugim terminie.', '', 'systemy'],
  ])

  console.log('\n🎉 Wszystkie dane zaktualizowane!\n')
  console.log('Nastepne kroki:')
  console.log('  1. Wrzuc env vars na Vercel')
  console.log('  2. Ustaw webhook Telegrama')
  console.log('  3. Wysli PLAN_LEKCJI → wpisemy do Sheets')
  console.log('  4. Przetestuj /api/briefings/morning\n')
}

main().catch(err => {
  console.error('\n❌ Blad:', err.message)
  console.error(err.stack)
  process.exit(1)
})
