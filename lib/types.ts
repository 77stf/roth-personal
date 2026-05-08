// ROTH Personal OS — TypeScript types
// Wszystkie typy systemu w jednym miejscu

// ─── Strefy energetyczne ───────────────────────────────────────────────────
export type EnergyZone = 'ROZRUCH' | 'WZROST' | 'SZCZYT' | 'WIECZOR' | 'ZWALNIANIE'
export type TaskColor = 'RED' | 'YELLOW' | 'GREEN'
export type EnergyLevel = 1 | 2 | 3 | 4 | 5

export interface EnergyZoneInfo {
  name: EnergyZone
  hours: string
  level: 'niska' | 'rosnaca' | 'wysoka' | 'plateau' | 'spada'
  color: TaskColor
}

// ─── Scoring dnia ─────────────────────────────────────────────────────────
export interface DayScoring {
  total: number       // 0-20
  label: string       // "Lekki" | "Normalny" | "Ciężki" | "Ekstremalny"
  components: ScoringComponent[]
}

export interface ScoringComponent {
  name: string
  points: number
  active: boolean
}

// ─── Transport ────────────────────────────────────────────────────────────
export interface BusRoute {
  from: string
  to: string
  departure: string    // "HH:mm"
  arrival: string      // "HH:mm"
  duration: number     // minuty
  type: 'direct' | 'transfer'
  transferAt?: string
  transferTime?: number  // minuty na przesiadkę
  risky?: boolean        // przesiadka < 8 min
}

export interface TransportRecommendation {
  safe: BusRoute
  fast?: BusRoute       // z ostrzeżeniem RYZYKOWNA
  leaveHomeAt: string   // safe option - 10 min
  firstLessonAt: string
}

export interface BusScheduleRow {
  trasa: string
  kierunek: string
  godzina: string
  aktywny: boolean
}

// ─── Zadania (Google Tasks / wewnętrzne) ──────────────────────────────────
export interface Task {
  id: string
  title: string
  color: TaskColor
  done: boolean
  dueTime?: string      // "HH:mm"
  category?: TaskCategory
  notes?: string
  createdAt: string
}

export type TaskCategory =
  | 'OFM'
  | 'AI_CONSULTING'
  | 'SZKOLA'
  | 'DOM'
  | 'SPORT'
  | 'FINANSE'
  | 'OSOBISTE'
  | 'INNE'

// ─── Szkoła ──────────────────────────────────────────────────────────────
export interface LessonPlanRow {
  dzien: string
  nrLekcji: number
  przedmiot: string
  nauczyciel: string
  sala: string
  grupa: string   // "" = cała klasa, "2/2" = konkretna grupa
}

export interface Zastepstwo {
  klasa: string
  lekcja: number
  przedmiot: string
  nauczyciel: string
  sala: string
  uwagi: string
  dotyczy: boolean  // czy dotyczy 3PB gr.2/2
}

export interface Sprawdzian {
  id: string
  przedmiot: string
  typ: 'sprawdzian' | 'kartkowka' | 'praca_domowa' | 'referat' | 'projekt'
  data: string     // ISO date
  temat: string
  statusNauki: 'nie_zaczal' | 'w_trakcie' | 'gotowy'
  wynik?: string
}

// ─── Sport ────────────────────────────────────────────────────────────────
export type TrainingType = 'full_body' | 'plecki_klata' | 'barki_klata' | 'badminton' | 'domowy' | 'rest'

export interface TrainingSession {
  id: string
  data: string         // ISO date
  typ: TrainingType
  planowany: boolean
  czasFaktyczny?: number  // minuty
  status: 'zaplanowany' | 'wykonany' | 'odwolany' | 'przesuniety'
  uwagi?: string
}

// ─── Zdrowie i leki ──────────────────────────────────────────────────────
export interface AktywnyLek {
  nazwa: string
  dawka: string
  godziny: string[]   // ["08:00", "20:00"]
  od: string          // ISO date
  do: string          // ISO date
  aktywny: boolean
}

export interface LekHistoria {
  data: string
  lek: string
  wziety: boolean
  godzina: string
  opoznienieMin: number
}

export interface RzeczCodzienna {
  nazwa: string
  typ: string
  godzina: string
  czestotliwosc: string
  ostatnio: string
}

// ─── Dom ─────────────────────────────────────────────────────────────────
export type KategoriaPrania = 'biale' | 'ciemne' | 'kolorowe_jasne' | 'szare_mieszane' | 'sportowe_delikatne'

export interface PranieLog {
  kategoria: KategoriaPrania
  dataOstatniego: string  // ISO date
  status: 'ok' | 'alert' | 'pilne'
  uwagi?: string
  limitDni: number
}

export interface SprzatanieLog {
  data: string
  wykonano: boolean
  nastepne: string    // ISO date
  uwagi?: string
}

// ─── Finanse ─────────────────────────────────────────────────────────────
export type KategoriaWydatku =
  | 'Jedzenie'
  | 'Transport'
  | 'Silownia'
  | 'Ubrania'
  | 'Subskrypcje'
  | 'Biznes'
  | 'Inne'

export interface Przychod {
  id: string
  data: string
  zrodlo: string
  kwota: number
  biznes: 'OFM' | 'AI' | 'Osobiste'
  miesiac: string     // "2025-04"
}

export interface Wydatek {
  id: string
  data: string
  kategoria: KategoriaWydatku
  kwota: number
  opis: string
  konieczny: boolean
  biznesOsob: 'Biznes' | 'Osobiste'
  miesiac: string
}

export interface BudzetKategoria {
  kategoria: KategoriaWydatku
  limit: number
  wydano: number
  zostalo: number
  procent: number
  alert: boolean      // >80%
}

export interface CelFinansowy {
  cel: string
  kwotaDocelowa: number
  zebrano: number
  procent: number
  deadline: string
  prognoza: string   // "za X miesięcy"
}

// ─── OFM ─────────────────────────────────────────────────────────────────
export type StatusModelki = 'negocjacje' | 'onboarding' | 'aktywna' | 'pauza' | 'zakonczona'
export type StatusMetodyOFM = 'ZATWIERDZONA' | 'NIEZWERYFIKOWANA' | 'ODRZUCONA'

export interface ProjektOFM {
  modelka: string
  status: StatusModelki
  nastepnyKrok: string
  udzialRealny: number    // %  — NIGDY w jednym widoku z fake
  udzialFake: number      // %  — NIGDY w jednym widoku z real
  przychod: number        // PLN/mies
  deadline?: string
}

export interface MetodaOFM {
  nazwa: string
  kategoria: string
  status: StatusMetodyOFM
  weryfikacjaKto?: string    // Dr. Hadi | Mikolaj | Sorin
  weryfikacjaData?: string
  odrzucenieKto?: string
  odrzecenieData?: string
  powodOdrzucenia?: string
  opis: string
}

// ─── AI Consulting ────────────────────────────────────────────────────────
export type EtapKontraktu = 'negocjacje' | 'podpisany' | 'realizacja' | 'zakonczony'

export interface ProjektAI {
  firma: string
  etap: EtapKontraktu
  wartoscRealna: number     // PRYWATNE — tylko dla właściciela
  wartoscPrezentowana: number  // PRYWATNE
  udzialRealny: number
  udzialFake: number
  kontakt: string
  deadline?: string
}

// ─── Osoby ────────────────────────────────────────────────────────────────
export interface OsobaProfile {
  imie: string
  rola: string
  ostatniKontakt: string   // ISO date
  otwarteSrawy: string[]
  notatki: string
  alertBrakKontaktu: number  // dni
}

// ─── Water Tracker ────────────────────────────────────────────────────────
export interface WaterEntry {
  data: string
  celMl: number
  wypito: number
  procent: number
  godzinySpozycia: string[]
}

// ─── Idea Lab ─────────────────────────────────────────────────────────────
export type PersonaIdeaLab = 'Inwestor' | 'Operator_OFM' | 'Mentor' | 'Adwokat_Diabla' | 'Strateg_AI'
export type WerdyktIdeaLab = 'REALIZUJ' | 'POCZEKAJ' | 'ODRZUC'

export interface OcenaPersony {
  persona: PersonaIdeaLab
  ocena: string
  plusy: string[]
  minusy: string[]
  rekomendacja: string
}

export interface OcenaIdeaLab {
  pomysl: string
  persony: OcenaPersony[]
  werdykt: WerdyktIdeaLab
  uzasadnienie: string
  nastepneKroki: string[]
  zapisanoDoObsidian: boolean
}

// ─── Tajlandia Roadmapa ───────────────────────────────────────────────────
export type StatusMilestone = 'nie_zaczety' | 'w_toku' | 'osiagniety'

export interface Milestone {
  numer: number
  nazwa: string
  status: StatusMilestone
  celPrzychodu?: number     // PLN/mies
  wartoscKontraktu?: number
  osiagnietyData?: string
}

// ─── Briefing ─────────────────────────────────────────────────────────────
export interface MorningBrief {
  data: string
  dzienTygodnia: string
  scoring: DayScoring
  pogoda: PogodaInfo
  transport?: TransportRecommendation
  priorytety: Task[]
  planDnia: PlanBlok[]
  alerty: string[]
  leki: AktywnyLek[]
  celWodyDzis: number
  cytat: string
}

export interface EveningBrief {
  data: string
  ukonczoneTaski: Task[]
  nieukonczoneTaski: Task[]
  ocenaDnia: number    // 0-10
  komentarzROTH: string
  planJutra: PlanBlok[]
  transportJutro?: TransportRecommendation
  zastepstwaJutro: Zastepstwo[]
  frictionLog?: string
  alertyDomowe: string[]
  lekiWieczorne: AktywnyLek[]
  wodaDzis: number
  celWody: number
}

export interface PreSleepProtocol {
  rzeczyZrobioneDzis: number
  jutroEvent?: string    // "szkołę/trening/meeting"
  jutroGodzina?: string
  optymalnySen: string   // "23:30"
  zostaloMinut: number
}

// ─── Pogoda ──────────────────────────────────────────────────────────────
export interface PogodaInfo {
  temperatura: number
  odczucie: number
  opis: string
  rekomendacjaUbrania: string
  opad?: string
  wiatr?: number
}

// ─── Plan dnia ────────────────────────────────────────────────────────────
export interface PlanBlok {
  start: string     // "HH:mm"
  koniec: string    // "HH:mm"
  tytuł: string
  typ: 'zadanie' | 'szkola' | 'trening' | 'transport' | 'break' | 'sen'
  color: TaskColor
  opis?: string
}

// ─── API responses ────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// ─── Ustawienia ───────────────────────────────────────────────────────────
export interface SystemSettings {
  klucz: string
  wartosc: string
  opis: string
  ostatniaAktualizacja: string
}

// ─── Weekly Review ────────────────────────────────────────────────────────
export interface WeeklyReviewState {
  pytanieNr: number   // 1-7
  odpowiedzi: Record<number, string>
  zakonczone: boolean
}

export interface WeeklyReviewReport {
  tydzien: string    // "2025-W16"
  odpowiedzi: Record<number, string>
  statystyki: {
    trenigiLiczba: number
    taskiProcent: number
    wodaSredniaMl: number
    financeSaldo: number
  }
  top3Poprawy: string[]
  commitments: string[]
}
