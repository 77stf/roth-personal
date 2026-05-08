// ROTH Personal OS — Google Sheets API v4 client
// Jedyne źródło prawdy — ZERO hardcode w kodzie

import { google } from 'googleapis'
import type {
  BusScheduleRow, LessonPlanRow, AktywnyLek, LekHistoria, RzeczCodzienna,
  PranieLog, SprzatanieLog, TrainingSession, Przychod, Wydatek, BudzetKategoria,
  CelFinansowy, ProjektOFM, ProjektAI, OsobaProfile, WaterEntry, SystemSettings,
  Sprawdzian
} from './types'
import { SHEETS, type SheetName } from './constants'

// ─── Auth ────────────────────────────────────────────────────────────────
function getAuth() {
  return new google.auth.OAuth2(
    process.env['GOOGLE_CLIENT_ID'],
    process.env['GOOGLE_CLIENT_SECRET'],
  )
}

function getAuthWithRefresh() {
  const auth = getAuth()
  auth.setCredentials({ refresh_token: process.env['GOOGLE_REFRESH_TOKEN'] })
  return auth
}

function getSheetsClient() {
  const auth = getAuthWithRefresh()
  return google.sheets({ version: 'v4', auth })
}

const SPREADSHEET_ID = process.env['GOOGLE_SHEETS_ID']!

// ─── Bazowe operacje ──────────────────────────────────────────────────────

export async function readSheet(sheetName: SheetName, range = 'A:Z'): Promise<string[][]> {
  const sheets = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!${range}`,
  })
  return (res.data.values ?? []) as string[][]
}

export async function appendRow(sheetName: SheetName, values: (string | number | boolean)[]): Promise<void> {
  const sheets = getSheetsClient()
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:A`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  })
}

export async function updateRow(
  sheetName: SheetName,
  rowIndex: number,  // 1-based (row 1 = headers)
  values: (string | number | boolean)[],
): Promise<void> {
  const sheets = getSheetsClient()
  const row = rowIndex + 1  // skip header row
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A${row}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  })
}

// ─── 01 PLAN_LEKCJI ───────────────────────────────────────────────────────
export async function getLessonPlan(dzien?: string): Promise<LessonPlanRow[]> {
  const rows = await readSheet(SHEETS.PLAN_LEKCJI)
  if (rows.length <= 1) return []
  const headers = rows[0] ?? []

  const all = rows.slice(1).map(row => ({
    dzien: String(row[0] ?? ''),
    nrLekcji: Number(row[1] ?? 0),
    przedmiot: String(row[2] ?? ''),
    nauczyciel: String(row[3] ?? ''),
    sala: String(row[4] ?? ''),
    grupa: String(row[5] ?? ''),
  } as LessonPlanRow))

  if (dzien) {
    return all.filter(r =>
      r.dzien.toLowerCase() === dzien.toLowerCase() &&
      (r.grupa === '' || r.grupa === '2/2')
    )
  }
  return all.filter(r => r.grupa === '' || r.grupa === '2/2')
}

// ─── 02 ROZKLAD_BUSOW ─────────────────────────────────────────────────────
export async function getBusSchedule(trasa?: string): Promise<BusScheduleRow[]> {
  const rows = await readSheet(SHEETS.ROZKLAD_BUSOW)
  if (rows.length <= 1) return []

  const all = rows.slice(1).map(row => ({
    trasa: String(row[0] ?? ''),
    kierunek: String(row[1] ?? ''),
    godzina: String(row[2] ?? ''),
    aktywny: String(row[3] ?? 'T').toUpperCase() === 'T',
  } as BusScheduleRow)).filter(r => r.aktywny)

  if (trasa) {
    return all.filter(r => r.trasa.toLowerCase().includes(trasa.toLowerCase()))
  }
  return all
}

// ─── 04 SPRAWDZIANY ──────────────────────────────────────────────────────
export async function getSprawdziany(upcomingOnly = true): Promise<Sprawdzian[]> {
  const rows = await readSheet(SHEETS.SPRAWDZIANY)
  if (rows.length <= 1) return []

  const today = new Date().toISOString().split('T')[0]!

  return rows.slice(1).map((row, i) => ({
    id: String(i + 1),
    przedmiot: String(row[0] ?? ''),
    typ: String(row[1] ?? 'sprawdzian') as Sprawdzian['typ'],
    data: String(row[2] ?? ''),
    temat: String(row[3] ?? ''),
    statusNauki: String(row[4] ?? 'nie_zaczal') as Sprawdzian['statusNauki'],
    wynik: row[5] ? String(row[5]) : undefined,
  })).filter(s => !upcomingOnly || s.data >= today!)
}

export async function addSprawdzian(s: Omit<Sprawdzian, 'id'>): Promise<void> {
  await appendRow(SHEETS.SPRAWDZIANY, [
    s.przedmiot, s.typ, s.data, s.temat, s.statusNauki, s.wynik ?? '',
  ])
}

// ─── 05 LEKI_AKTYWNE ─────────────────────────────────────────────────────
export async function getAktywneReki(): Promise<AktywnyLek[]> {
  const rows = await readSheet(SHEETS.LEKI_AKTYWNE)
  if (rows.length <= 1) return []

  return rows.slice(1)
    .map(row => ({
      nazwa: String(row[0] ?? ''),
      dawka: String(row[1] ?? ''),
      godziny: String(row[2] ?? '').split(',').map(g => g.trim()).filter(Boolean),
      od: String(row[3] ?? ''),
      do: String(row[4] ?? ''),
      aktywny: String(row[5] ?? 'T').toUpperCase() === 'T',
    } as AktywnyLek))
    .filter(l => l.aktywny)
}

// ─── 06 LEKI_HISTORIA ─────────────────────────────────────────────────────
export async function logLekWzieto(lek: string, godzina: string, opoznienieMin = 0): Promise<void> {
  const data = new Date().toISOString().split('T')[0]!
  await appendRow(SHEETS.LEKI_HISTORIA, [data, lek, 'T', godzina, opoznienieMin])
}

// ─── 07 RZECZY_CODZIENNE ──────────────────────────────────────────────────
export async function getRzeczyCodzienna(): Promise<RzeczCodzienna[]> {
  const rows = await readSheet(SHEETS.RZECZY_CODZIENNE)
  if (rows.length <= 1) return []

  return rows.slice(1).map(row => ({
    nazwa: String(row[0] ?? ''),
    typ: String(row[1] ?? ''),
    godzina: String(row[2] ?? ''),
    czestotliwosc: String(row[3] ?? ''),
    ostatnio: String(row[4] ?? ''),
  } as RzeczCodzienna))
}

// ─── 08 FINANSE_PRZYCHODY ────────────────────────────────────────────────
export async function getPrzychody(miesiac?: string): Promise<Przychod[]> {
  const rows = await readSheet(SHEETS.FINANSE_PRZYCHODY)
  if (rows.length <= 1) return []

  const all = rows.slice(1).map((row, i) => ({
    id: String(i + 1),
    data: String(row[0] ?? ''),
    zrodlo: String(row[1] ?? ''),
    kwota: Number(row[2] ?? 0),
    biznes: String(row[3] ?? 'Osobiste') as Przychod['biznes'],
    miesiac: String(row[4] ?? ''),
  } as Przychod))

  if (miesiac) return all.filter(p => p.miesiac === miesiac)
  return all
}

export async function addPrzychod(p: Omit<Przychod, 'id'>): Promise<void> {
  const miesiac = p.data.substring(0, 7)
  await appendRow(SHEETS.FINANSE_PRZYCHODY, [p.data, p.zrodlo, p.kwota, p.biznes, miesiac])
}

// ─── 09 FINANSE_WYDATKI ──────────────────────────────────────────────────
export async function getWydatki(miesiac?: string): Promise<Wydatek[]> {
  const rows = await readSheet(SHEETS.FINANSE_WYDATKI)
  if (rows.length <= 1) return []

  const all = rows.slice(1).map((row, i) => ({
    id: String(i + 1),
    data: String(row[0] ?? ''),
    kategoria: String(row[1] ?? 'Inne') as Wydatek['kategoria'],
    kwota: Number(row[2] ?? 0),
    opis: String(row[3] ?? ''),
    konieczny: String(row[4] ?? 'N').toUpperCase() === 'T',
    biznesOsob: String(row[5] ?? 'Osobiste') as Wydatek['biznesOsob'],
    miesiac: String(row[6] ?? ''),
  } as Wydatek))

  if (miesiac) return all.filter(w => w.miesiac === miesiac)
  return all
}

export async function addWydatek(w: Omit<Wydatek, 'id'>): Promise<void> {
  const miesiac = w.data.substring(0, 7)
  await appendRow(SHEETS.FINANSE_WYDATKI, [
    w.data, w.kategoria, w.kwota, w.opis,
    w.konieczny ? 'T' : 'N', w.biznesOsob, miesiac,
  ])
}

// ─── 10 FINANSE_BUDZET ────────────────────────────────────────────────────
export async function getBudzet(): Promise<BudzetKategoria[]> {
  const rows = await readSheet(SHEETS.FINANSE_BUDZET)
  if (rows.length <= 1) return []

  return rows.slice(1).map(row => {
    const limit = Number(row[1] ?? 0)
    const wydano = Number(row[2] ?? 0)
    const zostalo = limit - wydano
    const procent = limit > 0 ? Math.round((wydano / limit) * 100) : 0
    return {
      kategoria: String(row[0] ?? '') as BudzetKategoria['kategoria'],
      limit, wydano, zostalo, procent,
      alert: procent >= 80,
    } as BudzetKategoria
  })
}

// ─── 11 FINANSE_CELE ─────────────────────────────────────────────────────
export async function getCeleFinansowe(): Promise<CelFinansowy[]> {
  const rows = await readSheet(SHEETS.FINANSE_CELE)
  if (rows.length <= 1) return []

  return rows.slice(1).map(row => ({
    cel: String(row[0] ?? ''),
    kwotaDocelowa: Number(row[1] ?? 0),
    zebrano: Number(row[2] ?? 0),
    procent: Number(row[3] ?? 0),
    deadline: String(row[4] ?? ''),
    prognoza: String(row[5] ?? ''),
  } as CelFinansowy))
}

// ─── 12 PROJEKTY_OFM (PRYWATNE — realny/fake osobno!) ────────────────────
// ZASADA KRYTYCZNA: nigdy nie zwracaj obu udziałów razem
export async function getProjektyOFM(): Promise<Omit<ProjektOFM, 'udzialRealny' | 'udzialFake'>[]> {
  const rows = await readSheet(SHEETS.PROJEKTY_OFM)
  if (rows.length <= 1) return []

  return rows.slice(1).map(row => ({
    modelka: String(row[0] ?? ''),
    status: String(row[1] ?? 'negocjacje') as ProjektOFM['status'],
    nastepnyKrok: String(row[2] ?? ''),
    przychod: Number(row[5] ?? 0),
    deadline: row[6] ? String(row[6]) : undefined,
  }))
}

// Wywołaj tylko gdy user wyraźnie otwiera widok Udziałów (osobny ekran)
export async function getOFMUdzialRealny(): Promise<{ modelka: string; udzialRealny: number }[]> {
  const rows = await readSheet(SHEETS.PROJEKTY_OFM)
  if (rows.length <= 1) return []
  return rows.slice(1).map(row => ({
    modelka: String(row[0] ?? ''),
    udzialRealny: Number(row[3] ?? 0),
  }))
}

export async function getOFMUdzialFake(): Promise<{ modelka: string; udzialFake: number }[]> {
  const rows = await readSheet(SHEETS.PROJEKTY_OFM)
  if (rows.length <= 1) return []
  return rows.slice(1).map(row => ({
    modelka: String(row[0] ?? ''),
    udzialFake: Number(row[4] ?? 0),
  }))
}

// ─── 13 PROJEKTY_AI (PRYWATNE) ───────────────────────────────────────────
export async function getProjektyAI(): Promise<Omit<ProjektAI, 'wartoscRealna' | 'wartoscPrezentowana' | 'udzialRealny' | 'udzialFake'>[]> {
  const rows = await readSheet(SHEETS.PROJEKTY_AI)
  if (rows.length <= 1) return []

  return rows.slice(1).map(row => ({
    firma: String(row[0] ?? ''),
    etap: String(row[1] ?? 'negocjacje') as ProjektAI['etap'],
    kontakt: String(row[5] ?? ''),
    deadline: row[6] ? String(row[6]) : undefined,
  }))
}

// ─── 14 OSOBY_PROFILE ────────────────────────────────────────────────────
export async function getOsobyProfile(): Promise<OsobaProfile[]> {
  const rows = await readSheet(SHEETS.OSOBY_PROFILE)
  if (rows.length <= 1) return []

  return rows.slice(1).map(row => ({
    imie: String(row[0] ?? ''),
    rola: String(row[1] ?? ''),
    ostatniKontakt: String(row[2] ?? ''),
    otwarteSrawy: String(row[3] ?? '').split(';').map(s => s.trim()).filter(Boolean),
    notatki: String(row[4] ?? ''),
    alertBrakKontaktu: Number(row[5] ?? 3),
  } as OsobaProfile))
}

export async function updateOsobaKontakt(imie: string, notatki: string): Promise<void> {
  const rows = await readSheet(SHEETS.OSOBY_PROFILE)
  const rowIndex = rows.findIndex(r => String(r[0]).toLowerCase() === imie.toLowerCase())
  if (rowIndex === -1) return

  const row = rows[rowIndex]!
  const dzisiaj = new Date().toISOString().split('T')[0]!
  await updateRow(SHEETS.OSOBY_PROFILE, rowIndex, [
    row[0] ?? '', row[1] ?? '', dzisiaj, row[3] ?? '', notatki, row[5] ?? 3,
  ])
}

// ─── 15 PRANIE_LOG ───────────────────────────────────────────────────────
export async function getPranieLog(): Promise<PranieLog[]> {
  const rows = await readSheet(SHEETS.PRANIE_LOG)
  if (rows.length <= 1) return []

  return rows.slice(1).map(row => ({
    kategoria: String(row[0] ?? '') as PranieLog['kategoria'],
    dataOstatniego: String(row[1] ?? ''),
    status: String(row[2] ?? 'ok') as PranieLog['status'],
    uwagi: row[3] ? String(row[3]) : undefined,
    limitDni: Number(row[4] ?? 5),
  } as PranieLog))
}

export async function updatePranie(kategoria: string, data: string): Promise<void> {
  const rows = await readSheet(SHEETS.PRANIE_LOG)
  const rowIndex = rows.findIndex(r => String(r[0]).toLowerCase() === kategoria.toLowerCase())
  if (rowIndex === -1) return

  const row = rows[rowIndex]!
  await updateRow(SHEETS.PRANIE_LOG, rowIndex, [
    row[0] ?? '', data, 'ok', row[3] ?? '', row[4] ?? 5,
  ])
}

// ─── 16 SPRZATANIE_LOG ───────────────────────────────────────────────────
export async function getSprzatanieLog(): Promise<SprzatanieLog> {
  const rows = await readSheet(SHEETS.SPRZATANIE_LOG)
  const lastRow = rows[rows.length - 1]

  return {
    data: String(lastRow?.[0] ?? ''),
    wykonano: String(lastRow?.[1] ?? 'N').toUpperCase() === 'T',
    nastepne: String(lastRow?.[2] ?? ''),
    uwagi: lastRow?.[3] ? String(lastRow[3]) : undefined,
  }
}

export async function logSprzatanie(): Promise<void> {
  const dzisiaj = new Date()
  const data = dzisiaj.toISOString().split('T')[0]!
  const nastepne = new Date(dzisiaj.getTime() + 3 * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0]!
  await appendRow(SHEETS.SPRZATANIE_LOG, [data, 'T', nastepne, ''])
}

// ─── 17 TRENINGI_LOG ─────────────────────────────────────────────────────
export async function getTreningiLog(last7days = true): Promise<TrainingSession[]> {
  const rows = await readSheet(SHEETS.TRENINGI_LOG)
  if (rows.length <= 1) return []

  const all = rows.slice(1).map((row, i) => ({
    id: String(i + 1),
    data: String(row[0] ?? ''),
    typ: String(row[1] ?? 'rest') as TrainingSession['typ'],
    planowany: String(row[2] ?? 'T').toUpperCase() === 'T',
    czasFaktyczny: row[3] ? Number(row[3]) : undefined,
    status: String(row[4] ?? 'zaplanowany') as TrainingSession['status'],
    uwagi: row[5] ? String(row[5]) : undefined,
  } as TrainingSession))

  if (last7days) {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 7)
    const cutoffStr = cutoff.toISOString().split('T')[0]!
    return all.filter(t => t.data >= cutoffStr)
  }
  return all
}

export async function logTrening(session: Omit<TrainingSession, 'id'>): Promise<void> {
  await appendRow(SHEETS.TRENINGI_LOG, [
    session.data, session.typ, session.planowany ? 'T' : 'N',
    session.czasFaktyczny ?? '', session.status, session.uwagi ?? '',
  ])
}

// ─── 19 WATER_TRACKER ────────────────────────────────────────────────────
export async function getWaterToday(): Promise<WaterEntry> {
  const dzisiaj = new Date().toISOString().split('T')[0]!
  const rows = await readSheet(SHEETS.WATER_TRACKER)
  const todayRow = rows.find(r => String(r[0]) === dzisiaj)

  if (!todayRow) {
    return { data: dzisiaj, celMl: 2000, wypito: 0, procent: 0, godzinySpozycia: [] }
  }

  return {
    data: dzisiaj,
    celMl: Number(todayRow[1] ?? 2000),
    wypito: Number(todayRow[2] ?? 0),
    procent: Number(todayRow[3] ?? 0),
    godzinySpozycia: String(todayRow[4] ?? '').split(',').filter(Boolean),
  }
}

export async function addWater(ml: number): Promise<WaterEntry> {
  const dzisiaj = new Date().toISOString().split('T')[0]!
  const rows = await readSheet(SHEETS.WATER_TRACKER)
  const existing = rows.find(r => String(r[0]) === dzisiaj)
  const now = new Date().toTimeString().substring(0, 5)

  const sheets = getSheetsClient()

  if (existing) {
    const wypito = Number(existing[2] ?? 0) + ml
    const procent = Math.round((wypito / 2000) * 100)
    const godziny = [...String(existing[4] ?? '').split(',').filter(Boolean), now].join(',')

    const rowIdx = rows.indexOf(existing) + 1
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.WATER_TRACKER}!A${rowIdx}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[dzisiaj, 2000, wypito, procent, godziny]] },
    })
    return { data: dzisiaj, celMl: 2000, wypito, procent, godzinySpozycia: godziny.split(',') }
  } else {
    const procent = Math.round((ml / 2000) * 100)
    await appendRow(SHEETS.WATER_TRACKER, [dzisiaj, 2000, ml, procent, now])
    return { data: dzisiaj, celMl: 2000, wypito: ml, procent, godzinySpozycia: [now] }
  }
}

// ─── 21 CYTATY ───────────────────────────────────────────────────────────
export async function getCytat(kategoria?: string): Promise<string> {
  const rows = await readSheet(SHEETS.CYTATY)
  if (rows.length <= 1) return 'Każdy dzień to krok bliżej Tajlandii.'

  const filtered = kategoria
    ? rows.slice(1).filter(r => String(r[2] ?? '').toLowerCase() === kategoria.toLowerCase())
    : rows.slice(1)

  const pick = filtered[Math.floor(Math.random() * filtered.length)]
  if (!pick) return 'Każdy dzień to krok bliżej Tajlandii.'

  const cytat = String(pick[0] ?? '')
  const autor = String(pick[1] ?? '')
  return autor ? `"${cytat}" — ${autor}` : cytat
}

// ─── 22 USTAWIENIA ───────────────────────────────────────────────────────
export async function getUstawienie(klucz: string): Promise<string | null> {
  const rows = await readSheet(SHEETS.USTAWIENIA)
  const row = rows.find(r => String(r[0]) === klucz)
  return row ? String(row[1] ?? '') : null
}

export async function setUstawienie(klucz: string, wartosc: string, opis = ''): Promise<void> {
  const rows = await readSheet(SHEETS.USTAWIENIA)
  const rowIndex = rows.findIndex(r => String(r[0]) === klucz)
  const dzisiaj = new Date().toISOString()

  if (rowIndex !== -1) {
    await updateRow(SHEETS.USTAWIENIA, rowIndex, [klucz, wartosc, opis, dzisiaj])
  } else {
    await appendRow(SHEETS.USTAWIENIA, [klucz, wartosc, opis, dzisiaj])
  }
}
