/**
 * ROTH Personal OS — Upload planu lekcji 3PB (Grupa 2/2, WF 3/3, bez religii)
 * node scripts/upload-plan-lekcji.mjs
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

// Format: [dzien, nrLekcji, przedmiot, nauczyciel, sala, grupa]
const PLAN = [
  // ── PONIEDZIALEK ── (lekcje 2-8)
  ['Poniedzialek', 2,  'j.niem_d',     '',  'WR 03', '2/2'],
  ['Poniedzialek', 3,  'PrPodsSiec',   '',  'BS 21', '2/2'],
  ['Poniedzialek', 4,  'PodsSieci',    '',  'BS 21', '2/2'],
  ['Poniedzialek', 5,  'j.polski',     '',  'RA 12', 'cala_klasa'],
  ['Poniedzialek', 6,  'PrProjOpr',    '',  'FK 22', '2/2'],
  ['Poniedzialek', 7,  'matematyka',   '',  'GM 14', 'cala_klasa'],
  ['Poniedzialek', 8,  'ProgApInt',    '',  'FK 22', '2/2'],

  // ── WTOREK ── (lekcje 3-11)
  ['Wtorek', 3,  'PrTestApli',              '', 'MT 21', '2/2'],
  ['Wtorek', 4,  'AdmBaz',                  '', 'TK 04', '2/2'],
  ['Wtorek', 5,  'PrBazDan',                '', 'TK 04', '2/2'],
  ['Wtorek', 6,  'j.ang_k',                 '', 'AW 06', '2/2'],
  ['Wtorek', 7,  'matematyka',              '', 'GM 14', 'cala_klasa'],
  ['Wtorek', 8,  'ProjOpr',                 '', 'FK 04', '2/2'],
  ['Wtorek', 9,  'historia',                '', 'AL 12', 'cala_klasa'],
  ['Wtorek', 10, 'historia i terazniejszosc','', 'AL 12', 'cala_klasa'],
  ['Wtorek', 11, 'geografia',               '', 'PO 11', 'cala_klasa'],

  // ── SRODA ── (lekcje 6-11)
  ['Sroda', 6,  'matematyka',   '', 'GM 14', 'cala_klasa'],
  ['Sroda', 7,  'PrGrafMulti',  '', 'MA 06', '2/2'],
  ['Sroda', 8,  'biologia',     '', 'CZ 11', 'cala_klasa'],
  ['Sroda', 9,  'WF',           '', 'AS',    '3/3'],
  ['Sroda', 10, 'chemia',       '', 'KP 01', 'cala_klasa'],
  ['Sroda', 11, 'fizyka',       '', 'PK 11', 'cala_klasa'],

  // ── CZWARTEK ── (lekcje 4-10)
  ['Czwartek', 4,  'WF',                   '', 'AS',    '3/3'],
  ['Czwartek', 5,  'WF',                   '', 'AS',    '3/3'],
  ['Czwartek', 6,  'j.polski',             '', 'RA 12', 'cala_klasa'],
  ['Czwartek', 7,  'matematyka rozszerzona','', 'GM 14', 'cala_klasa'],
  ['Czwartek', 8,  'j.niem_d',             '', 'WR 24', '2/2'],
  ['Czwartek', 9,  'r_angielski',          '', 'AW 11', '2/2'],
  ['Czwartek', 10, 'informatyka',          '', 'BS 21', '2/2'],

  // ── PIATEK ── (lekcje 7-10)
  ['Piatek', 7,  'j.polski',  '', 'RA 11', 'cala_klasa'],
  ['Piatek', 8,  'TestApli',  '', 'MT 23', '2/2'],
  ['Piatek', 9,  'PrApInt',   '', 'FK 04', '2/2'],
  ['Piatek', 10, 'PrApInt',   '', 'FK 04', '2/2'],
]

async function main() {
  console.log('\n📚 ROTH Personal OS — Upload planu lekcji 3PB\n')

  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: 'PLAN_LEKCJI!A:Z',
  })

  const rows = [
    ['dzien', 'nrLekcji', 'przedmiot', 'nauczyciel', 'sala', 'grupa'],
    ...PLAN,
  ]

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: 'PLAN_LEKCJI!A1',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: rows },
  })

  console.log(`✅ PLAN_LEKCJI: ${PLAN.length} lekcji wgrane`)
  console.log('\nPodsumowanie:')
  const byDay = {}
  for (const row of PLAN) {
    const day = row[0]
    byDay[day] = (byDay[day] ?? 0) + 1
  }
  for (const [day, count] of Object.entries(byDay)) {
    console.log(`  ${day}: ${count} lekcji`)
  }
  console.log('\n🎉 Gotowe!\n')
}

main().catch(err => {
  console.error('❌ Błąd:', err.message)
  process.exit(1)
})
