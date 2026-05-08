/**
 * ROTH Personal OS — Inicjalizacja Google Sheets
 * Tworzy wszystkie 23 arkusze z nagłówkami i danymi startowymi.
 * Uruchom JEDEN RAZ: node scripts/init-sheets.mjs
 */

import { readFileSync } from 'fs'
import { google } from 'googleapis'

// ─── Wczytaj .env.local ───────────────────────────────────────────────────
const envFile = readFileSync('.env.local', 'utf-8')
const env = {}
for (const line of envFile.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const [key, ...rest] = trimmed.split('=')
  env[key.trim()] = rest.join('=').trim()
}

const CLIENT_ID = env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET
const REFRESH_TOKEN = env.GOOGLE_REFRESH_TOKEN
const SPREADSHEET_ID = env.GOOGLE_SHEETS_ID

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !SPREADSHEET_ID) {
  console.error('❌ Brak env vars — sprawdź .env.local')
  process.exit(1)
}

// ─── Auth ─────────────────────────────────────────────────────────────────
const auth = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET)
auth.setCredentials({ refresh_token: REFRESH_TOKEN })
const sheets = google.sheets({ version: 'v4', auth })

// ─── Definicje arkuszy ────────────────────────────────────────────────────
const SHEET_DEFINITIONS = [
  {
    name: 'PLAN_LEKCJI',
    headers: ['dzien', 'nrLekcji', 'przedmiot', 'nauczyciel', 'sala', 'grupa'],
    seed: [
      ['Poniedzialek', 1, 'Matematyka', 'Kowalski', '101', ''],
      ['Poniedzialek', 2, 'Fizyka', 'Nowak', '203', '2/2'],
      ['Wtorek', 1, 'Angielski', 'Smith', '105', ''],
    ],
  },
  {
    name: 'ROZKLAD_BUSOW',
    headers: ['trasa', 'kierunek', 'godzina', 'aktywny'],
    seed: [
      ['Śrem-Poznań', 'do_szkoly', '06:55', 'T'],
      ['Śrem-Poznań', 'do_szkoly', '07:15', 'T'],
      ['Poznań-Śrem', 'do_domu', '14:30', 'T'],
      ['Poznań-Śrem', 'do_domu', '15:10', 'T'],
      ['Poznań-Śrem', 'do_domu', '16:00', 'T'],
    ],
  },
  {
    name: 'ZASTEPSTWA_LINKI',
    headers: ['dzien', 'url', 'typ'],
    seed: [
      ['poniedzialek', 'https://www.zse-srem.pl/asp/poniedzialek,67,,1', 'zastepstwa'],
      ['wtorek', 'https://www.zse-srem.pl/asp/wtorek,68,,1', 'zastepstwa'],
      ['sroda', 'https://www.zse-srem.pl/asp/sroda,69,,1', 'zastepstwa'],
      ['czwartek', 'https://www.zse-srem.pl/asp/czwartek,70,,1', 'zastepstwa'],
      ['piatek', 'https://www.zse-srem.pl/asp/piatek,71,,1', 'zastepstwa'],
    ],
  },
  {
    name: 'SPRAWDZIANY',
    headers: ['przedmiot', 'typ', 'data', 'temat', 'statusNauki', 'wynik'],
    seed: [],
  },
  {
    name: 'LEKI_AKTYWNE',
    headers: ['nazwa', 'dawka', 'godziny', 'od', 'do', 'aktywny'],
    seed: [],
  },
  {
    name: 'LEKI_HISTORIA',
    headers: ['data', 'lek', 'wziety', 'godzina', 'opoznienieMin'],
    seed: [],
  },
  {
    name: 'RZECZY_CODZIENNE',
    headers: ['nazwa', 'typ', 'godzina', 'czestotliwosc', 'ostatnio'],
    seed: [
      ['Kawa', 'napoj', '07:30', 'codziennie', ''],
      ['Witaminy', 'suplement', '08:00', 'codziennie', ''],
      ['Woda - uzupełnij bidon', 'nawodnienie', '07:00', 'codziennie', ''],
    ],
  },
  {
    name: 'FINANSE_PRZYCHODY',
    headers: ['data', 'zrodlo', 'kwota', 'biznes', 'miesiac'],
    seed: [],
  },
  {
    name: 'FINANSE_WYDATKI',
    headers: ['data', 'kategoria', 'kwota', 'opis', 'konieczny', 'biznesOsob', 'miesiac'],
    seed: [],
  },
  {
    name: 'FINANSE_BUDZET',
    headers: ['kategoria', 'limit', 'wydano'],
    seed: [
      ['Jedzenie', 400, 0],
      ['Transport', 150, 0],
      ['Rozrywka', 200, 0],
      ['Ubrania', 100, 0],
      ['Zdrowie', 100, 0],
      ['Biznes', 300, 0],
      ['Inne', 150, 0],
    ],
  },
  {
    name: 'FINANSE_CELE',
    headers: ['cel', 'kwotaDocelowa', 'zebrano', 'procent', 'deadline', 'prognoza'],
    seed: [
      ['Tajlandia - bilet', 2000, 0, 0, '2027-06-01', ''],
      ['Tajlandia - fundusz startowy', 10000, 0, 0, '2027-06-01', ''],
      ['Laptop upgrade', 3000, 0, 0, '2026-12-31', ''],
    ],
  },
  {
    name: 'PROJEKTY_OFM',
    headers: ['modelka', 'status', 'nastepnyKrok', 'udzialRealny', 'udzialFake', 'przychod', 'deadline'],
    seed: [],
  },
  {
    name: 'PROJEKTY_AI',
    headers: ['firma', 'etap', 'opis', 'wartoscRealna', 'wartoscPrezentowana', 'kontakt', 'deadline'],
    seed: [],
  },
  {
    name: 'OSOBY_PROFILE',
    headers: ['imie', 'rola', 'ostatniKontakt', 'otwarteSrawy', 'notatki', 'alertBrakKontaktu'],
    seed: [],
  },
  {
    name: 'PRANIE_LOG',
    headers: ['kategoria', 'dataOstatniego', 'status', 'uwagi', 'limitDni'],
    seed: [
      ['biale', '', 'ok', '', 5],
      ['ciemne', '', 'ok', '', 5],
      ['kolorowe_jasne', '', 'ok', '', 6],
      ['szare_mieszane', '', 'ok', '', 6],
      ['sportowe_delikatne', '', 'ok', '', 3],
    ],
  },
  {
    name: 'SPRZATANIE_LOG',
    headers: ['data', 'wykonano', 'nastepne', 'uwagi'],
    seed: [],
  },
  {
    name: 'TRENINGI_LOG',
    headers: ['data', 'typ', 'planowany', 'czasFaktyczny', 'status', 'uwagi'],
    seed: [],
  },
  {
    name: 'WYJAZDY_PAKOWANIE',
    headers: ['wyjazd', 'rzecz', 'kategoria', 'spakowane', 'uwagi'],
    seed: [],
  },
  {
    name: 'WATER_TRACKER',
    headers: ['data', 'celMl', 'wypito', 'procent', 'godzinySpozycia'],
    seed: [],
  },
  {
    name: 'SCREEN_TIME_LOG',
    headers: ['data', 'aplikacja', 'minuty', 'kategoria', 'uwagi'],
    seed: [],
  },
  {
    name: 'CYTATY',
    headers: ['cytat', 'autor', 'kategoria'],
    seed: [
      ['Każdy dzień to krok bliżej Tajlandii.', 'ROTH', 'motywacyjny'],
      ['Dyscyplina to wolność.', 'Jocko Willink', 'skupienie'],
      ['Nie ma gotowości — jest tylko działanie.', '', 'motywacyjny'],
      ['Złożone rzeczy wymagają prostych systemów.', '', 'skupienie'],
      ['Zrób to dziś, bo jutro będziesz żałował wczoraj.', '', 'wytrwalosc'],
      ['Elita nie odpoczywa — elita regeneruje się strategicznie.', '', 'przetrwanie'],
    ],
  },
  {
    name: 'USTAWIENIA',
    headers: ['klucz', 'wartosc', 'opis', 'zaktualizowano'],
    seed: [
      ['tryb_nocny', 'T', 'Nocna sowa — aktywna po 22:00', new Date().toISOString()],
      ['klasa', '3PB', 'Klasa szkolna', new Date().toISOString()],
      ['grupa', '2/2', 'Podgrupa', new Date().toISOString()],
      ['water_cel_ml', '2000', 'Dzienny cel wody w ml', new Date().toISOString()],
      ['miasto', 'Śrem', 'Lokalizacja dla pogody', new Date().toISOString()],
    ],
  },
  {
    name: 'ZADANIA_DNIA',
    headers: ['data', 'zadanie', 'priorytet', 'energia', 'status', 'godzina', 'uwagi'],
    seed: [],
  },
]

// ─── Główna logika ────────────────────────────────────────────────────────
async function main() {
  console.log('\n🚀 ROTH Personal OS — Inicjalizacja Google Sheets\n')

  // Pobierz istniejące arkusze
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID })
  const existingSheets = (meta.data.sheets ?? []).map(s => s.properties?.title ?? '')
  console.log(`📋 Istniejące arkusze: ${existingSheets.length > 0 ? existingSheets.join(', ') : '(brak)'}`)

  // Utwórz brakujące arkusze
  const toCreate = SHEET_DEFINITIONS.filter(d => !existingSheets.includes(d.name))

  if (toCreate.length > 0) {
    console.log(`\n➕ Tworzę ${toCreate.length} arkuszy: ${toCreate.map(d => d.name).join(', ')}`)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: toCreate.map(d => ({
          addSheet: { properties: { title: d.name } },
        })),
      },
    })
    console.log('✅ Arkusze utworzone')
  } else {
    console.log('✅ Wszystkie arkusze już istnieją')
  }

  // Dodaj nagłówki i seed data
  console.log('\n📝 Uzupełniam nagłówki i dane startowe...\n')

  for (const def of SHEET_DEFINITIONS) {
    // Sprawdź czy arkusz ma już dane
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${def.name}!A1:A2`,
    }).catch(() => ({ data: { values: [] } }))

    const hasData = (existing.data.values ?? []).length > 0

    if (hasData) {
      console.log(`  ⏭️  ${def.name} — ma już dane, pomijam`)
      continue
    }

    // Zapisz nagłówki + seed
    const rows = [def.headers, ...def.seed]
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${def.name}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: rows },
    })

    console.log(`  ✅ ${def.name} — ${def.headers.length} kolumn, ${def.seed.length} wierszy seed`)
  }

  console.log('\n🎉 Inicjalizacja zakończona!\n')
  console.log('Następne kroki:')
  console.log('  1. npm run dev → sprawdź /dashboard')
  console.log('  2. Uzupełnij PLAN_LEKCJI swoim planem')
  console.log('  3. Ustaw webhook Telegrama')
  console.log('  4. Przetestuj GET http://localhost:3000/api/briefings/morning\n')
}

main().catch(err => {
  console.error('\n❌ Błąd:', err.message)
  process.exit(1)
})
