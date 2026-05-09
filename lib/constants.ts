// ROTH Personal OS — Stałe systemu
// Zasady krytyczne zakodowane jako type-safe constants

import type { EnergyZoneInfo, ScoringComponent, KategoriaPrania } from './types'

// ─── ZASADY KRYTYCZNE — NIGDY NIE ŁAMAĆ ──────────────────────────────────
export const ROTH_RULES = {
  NEVER_SHOW_REAL_FAKE_TOGETHER: true,   // udziały realny/fake tylko na osobnych ekranach
  VERIFY_TELEGRAM_CHAT_ID: true,          // każdy webhook sprawdza TELEGRAM_CHAT_ID
  CHECK_CALENDAR_BEFORE_ANTIP: true,      // anty-prokrastynacja dopiero po sprawdzeniu kalendarza
  NO_HARDCODE_DATA: true,                 // ZERO danych w kodzie — tylko z Google Sheets
  MOBILE_FIRST_MIN_WIDTH: 375,            // px — minimum viewport
  NO_RED_TASKS_BEFORE_NOON: true,         // czerwone zadania od 12:00
  CALENDAR_APPROVAL_REQUIRED: true,       // ROTH nie zmienia kalendarza bez [OK]
  OBSIDIAN_API_KEY_ENV_ONLY: true,        // klucz tylko w .env.local
} as const

// ─── STREFY ENERGETYCZNE ──────────────────────────────────────────────────
export const ENERGY_ZONES: EnergyZoneInfo[] = [
  {
    name: 'ROZRUCH',
    hours: '07:00-11:00',
    level: 'niska',
    color: 'GREEN',
  },
  {
    name: 'WZROST',
    hours: '11:00-14:00',
    level: 'rosnaca',
    color: 'YELLOW',
  },
  {
    name: 'SZCZYT',
    hours: '14:00-19:00',
    level: 'wysoka',
    color: 'RED',
  },
  {
    name: 'WIECZOR',
    hours: '19:00-23:00',
    level: 'plateau',
    color: 'RED',
  },
  {
    name: 'ZWALNIANIE',
    hours: '23:00-01:00',
    level: 'spada',
    color: 'GREEN',
  },
]

// ─── SKŁADNIKI SCORINGU DNIA (0-20) ──────────────────────────────────────
export const SCORING_COMPONENTS: Omit<ScoringComponent, 'active'>[] = [
  { name: 'dzien_szkolny', points: 2 },
  { name: 'sprawdzian_kartkowka', points: 4 },
  { name: 'meeting_biznesowy', points: 3 },
  { name: 'trening', points: 2 },
  { name: 'deadline_projektu', points: 5 },
  { name: 'sen_lt_6h', points: 3 },
  { name: 'choroba', points: 4 },
  { name: 'wyjazd', points: 3 },
  { name: 'energia_1_2', points: 3 },
]

export const SCORING_PROGI = [
  { min: 0, max: 5, label: 'Lekki', opis: 'Pełny plan + extra wyzwanie' },
  { min: 6, max: 10, label: 'Normalny', opis: 'Standardowy plan' },
  { min: 11, max: 15, label: 'Ciężki', opis: 'Nie dokładam extra' },
  { min: 16, max: 20, label: 'Ekstremalny', opis: 'Absolutne minimum' },
]

// ─── TRENINGI ─────────────────────────────────────────────────────────────
// UWAGA: silownia_dni i badminton_dni są PRAWDZIWYMI źródłami w USTAWIENIA (Sheets)
// Poniżej tylko defaults — edytuj przez Sheets, nie tu
export const SILOWNIA = {
  dni: ['poniedzialek', 'sroda', 'piatek'] as string[],  // domyślne — edytuj w Sheets
  czasMinuty: 75,
} as const

export const BADMINTON = {
  dni: ['wtorek', 'piatek'] as string[],  // edytuj w Sheets (klucz: badminton_dni)
  dzien: 'wtorek',                         // backwards compat — pierwszy dzień z dni[]
  godzina: '19:30',
  koniec: '20:30',
  wyjazd: '19:10',
  powrot: '20:50',
} as const

// Alias — backwards compat dla stron które importują TRAINING_SCHEDULE
export const TRAINING_SCHEDULE: Record<string, string> = {
  poniedzialek: 'Siłownia — Full Body',
  sroda: 'Siłownia — Plecy + Klata',
  piatek: 'Siłownia — Barki + Klata',
}

// Anti-fragile: zastępstwo gdy trening odpada
export const TRENING_ZASTEPSTWO: Record<string, string[]> = {
  silownia: [
    '20 pompek + 20 przysiadów + 20 brzuszków (15 min)',
    'Spacer 30 min — liczy się ruch',
    'Stretching + mobilność 20 min',
    '3 serie planku + 3 serie pompek diamentowych',
  ],
  badminton: [
    'Bieganie 20 min lub szybki marsz',
    '20 pompek + 20 przysiadów (10 min)',
    'Rowerek/spacer dla aktywnego odpoczynku',
    'Stretching całego ciała 20 min',
  ],
  ogolne: [
    'Spacer 20 min — minimum aktywności',
    '10 pompek + 10 przysiadów co godzinę',
    'Stretching 15 min przed snem',
  ],
}

export const MIN_REST_DAY_GAP = 1

// ─── PRANIE — LIMITY DNI ─────────────────────────────────────────────────
export const PRANIE_LIMITY: Record<KategoriaPrania, number> = {
  biale: 5,
  ciemne: 5,
  kolorowe_jasne: 6,
  szare_mieszane: 6,
  sportowe_delikatne: 3,
}

// ─── WODA ────────────────────────────────────────────────────────────────
export const WATER = {
  celMinMl: 2000,
  celMaxMl: 2500,
  pytanieGodziny: [9, 11, 13, 15, 17, 19, 21],  // co 2h
  opcjeMl: [250, 500],
} as const

// ─── SPRZĄTANIE ──────────────────────────────────────────────────────────
export const SPRZATANIE = {
  czestotliwoscDni: 3,
  czasMinuty: 20,
} as const

// ─── ALERT PARTNERA ──────────────────────────────────────────────────────
export const ALERT_PARTNER_DNI = 3  // brak kontaktu > 3 dni

// ─── ANTY-PROKRASTYNACJA ─────────────────────────────────────────────────
export const ANTIP = {
  brakAktywnosciGodziny: 2,
  trzeDniProcent: 50,      // 3 dni pod rząd < 50% tasków
} as const

// ─── TELEGRAM KOMENDY ────────────────────────────────────────────────────
export const TELEGRAM_COMMANDS = [
  { command: 'start', description: 'Witaj w ROTH OS' },
  { command: 'brief', description: 'Pokaż aktualny brief dnia' },
  { command: 'kartkowka', description: 'Zapisz kartkówkę (np. /kartkowka fizyka jutro)' },
  { command: 'sprawdzian', description: 'Zapisz sprawdzian (/sprawdzian matematyka piątek)' },
  { command: 'kolo', description: 'Zapisz kolokwium (/kolo angielski środa)' },
  { command: 'ofm', description: 'OFM Daily Brief — Azul content + Reddit + revenue' },
  { command: 'opuscil_trening', description: 'Trening opuszczony — dostań zastępstwo' },
  { command: 'kolega_odwola', description: 'Przelicz busy bez kolegi' },
  { command: 'wsiadam', description: 'Wsiadam w bus — timer powrotu' },
  { command: 'dotarlem', description: 'Potwierdzenie dotarcia' },
  { command: 'koniec_silownia', description: 'Zakończ trening siłowni' },
  { command: 'choruje', description: 'Aktywuj Tryb Aktywny-Chory' },
  { command: 'przedluzam', description: 'Przesuń wieczorne zadania' },
  { command: 'posprzatane', description: 'Reset cyklu sprzątania' },
] as const

// ─── GODZINY LEKCJI (standardowy plan ZSE Śrem) ──────────────────────────
export const LESSON_TIMES: Record<number, { od: string; do: string }> = {
  1:  { od: '07:30', do: '08:15' },
  2:  { od: '08:20', do: '09:05' },
  3:  { od: '09:10', do: '09:55' },
  4:  { od: '10:05', do: '10:50' },
  5:  { od: '10:55', do: '11:40' },
  6:  { od: '11:45', do: '12:30' },
  7:  { od: '12:45', do: '13:30' },
  8:  { od: '13:35', do: '14:20' },
  9:  { od: '14:25', do: '15:10' },
  10: { od: '15:20', do: '16:05' },
  11: { od: '16:10', do: '16:55' },
}

// ─── NAZWY PRZEDMIOTÓW (skróty → pełne nazwy) ────────────────────────────
export const PRZEDMIOT_NAZWY: Record<string, string> = {
  'j.niem_d':                  'Język Niemiecki',
  'PrPodsSiec':                'Pracownia Podstaw Sieci',
  'PodsSieci':                 'Podstawy Sieci',
  'j.polski':                  'Język Polski',
  'PrProjOpr':                 'Pracownia Proj. Operacyjnego',
  'matematyka':                'Matematyka',
  'ProgApInt':                 'Programowanie Aplikacji Intern.',
  'PrTestApli':                'Pracownia Testowania Aplikacji',
  'AdmBaz':                    'Administracja Bazami Danych',
  'PrBazDan':                  'Pracownia Baz Danych',
  'j.ang_k':                   'Język Angielski',
  'ProjOpr':                   'Projekt Operacyjny',
  'historia':                  'Historia',
  'historia i terazniejszosc': 'Historia i Teraźniejszość',
  'geografia':                 'Geografia',
  'PrGrafMulti':               'Pracownia Grafiki Multimedialnej',
  'biologia':                  'Biologia',
  'WF':                        'Wychowanie Fizyczne',
  'chemia':                    'Chemia',
  'fizyka':                    'Fizyka',
  'matematyka rozszerzona':    'Matematyka Rozszerzona',
  'r_angielski':               'Angielski Rozszerzony',
  'informatyka':               'Informatyka',
  'TestApli':                  'Testowanie Aplikacji',
  'PrApInt':                   'Pracownia Aplikacji Intern.',
}

// Kolory kategorii przedmiotów
export const PRZEDMIOT_KOLORY: Record<string, string> = {
  'matematyka':             '#6366f1',
  'matematyka rozszerzona': '#6366f1',
  'fizyka':                 '#8b5cf6',
  'chemia':                 '#a855f7',
  'biologia':               '#22c55e',
  'j.polski':               '#f59e0b',
  'j.ang_k':                '#3b82f6',
  'r_angielski':            '#3b82f6',
  'j.niem_d':               '#06b6d4',
  'historia':               '#ef4444',
  'historia i terazniejszosc': '#ef4444',
  'geografia':              '#f97316',
  'WF':                     '#84cc16',
  'informatyka':            '#14b8a6',
  'default':                '#94a3b8',
}

// ─── SZKOŁA ──────────────────────────────────────────────────────────────
export const SZKOLA = {
  klasa: '3PB',
  grupa: '2/2',
  dojazd: { minuty: 30, bufor: 10 },  // 30 min przed lekcją, 10 min do przystanku
  zastepstwaLinki: {
    poniedzialek: 'https://www.zse-srem.pl/asp/poniedzialek,67,,1',
    wtorek: 'https://www.zse-srem.pl/asp/wtorek,68,,1',
    sroda: 'https://www.zse-srem.pl/asp/sroda,69,,1',
    czwartek: 'https://www.zse-srem.pl/asp/czwartek,70,,1',
    piatek: 'https://www.zse-srem.pl/asp/piatek,71,,1',
  },
} as const

// ─── TRANSPORT ────────────────────────────────────────────────────────────
export const TRANSPORT = {
  przystanekDoDomu: 10,         // min piechotą od domu do przystanku
  buforPKS: 5,                  // min bufor nieprzewidywalności PKS
  minBezpiecznaPrzesiadka: 8,  // min < = RYZYKOWNA przesiadka
  powrotBuffor: 30,             // min bufor po powrocie na zadania
} as const

// ─── CYTATY — KATEGORIE ──────────────────────────────────────────────────
export const CYTAT_KATEGORIE = {
  lekki: 'motywacyjny',
  normalny: 'skupienie',
  ciezki: 'wytrwalosc',
  ekstremalny: 'przetrwanie',
} as const

// ─── NAZWY 22 ARKUSZY GOOGLE SHEETS ──────────────────────────────────────
export const SHEETS = {
  PLAN_LEKCJI: 'PLAN_LEKCJI',
  ROZKLAD_BUSOW: 'ROZKLAD_BUSOW',
  ZASTEPSTWA_LINKI: 'ZASTEPSTWA_LINKI',
  SPRAWDZIANY: 'SPRAWDZIANY',
  LEKI_AKTYWNE: 'LEKI_AKTYWNE',
  LEKI_HISTORIA: 'LEKI_HISTORIA',
  RZECZY_CODZIENNE: 'RZECZY_CODZIENNE',
  FINANSE_PRZYCHODY: 'FINANSE_PRZYCHODY',
  FINANSE_WYDATKI: 'FINANSE_WYDATKI',
  FINANSE_BUDZET: 'FINANSE_BUDZET',
  FINANSE_CELE: 'FINANSE_CELE',
  PROJEKTY_OFM: 'PROJEKTY_OFM',
  PROJEKTY_AI: 'PROJEKTY_AI',
  OSOBY_PROFILE: 'OSOBY_PROFILE',
  PRANIE_LOG: 'PRANIE_LOG',
  SPRZATANIE_LOG: 'SPRZATANIE_LOG',
  TRENINGI_LOG: 'TRENINGI_LOG',
  WYJAZDY_PAKOWANIE: 'WYJAZDY_PAKOWANIE',
  WATER_TRACKER: 'WATER_TRACKER',
  SCREEN_TIME_LOG: 'SCREEN_TIME_LOG',
  CYTATY: 'CYTATY',
  USTAWIENIA: 'USTAWIENIA',
  ZADANIA_DNIA: 'ZADANIA_DNIA',
  DIET_LOG: 'DIET_LOG',
  SYSTEM_LOG: 'SYSTEM_LOG',
} as const

export type SheetName = (typeof SHEETS)[keyof typeof SHEETS]

// ─── OBSIDIAN FOLDERY ────────────────────────────────────────────────────
export const OBSIDIAN_FOLDERS = {
  inbox: '00_INBOX',
  people: '01_People',
  projects: '02_Projects',
  knowledge: '03_Knowledge/OFM',
  weeklyReviews: '04_Weekly_Reviews',
  ideas: '05_Ideas',
  decisions: '06_Decisions',
  dailyNotes: '07_Daily_Notes',
  thailand: '08_Thailand_Road',
} as const

// ─── OFM — AUTORYTETY WERYFIKACJI ────────────────────────────────────────
export const OFM_AUTORYTETY = ['Dr. Hadi', 'Mikołaj', 'Sorin'] as const
export type OFMAutorytet = (typeof OFM_AUTORYTETY)[number]

// ─── IDEA LAB — PERSONY ──────────────────────────────────────────────────
export const IDEA_LAB_PERSONY = [
  'Inwestor',
  'Operator_OFM',
  'Mentor',
  'Adwokat_Diabla',
  'Strateg_AI',
] as const
