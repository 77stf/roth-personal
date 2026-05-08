// ROTH Personal OS — OpenWeather API

import type { PogodaInfo } from './types'

const BASE_URL = 'https://api.openweathermap.org/data/2.5'

interface OWMResponse {
  main: { temp: number; feels_like: number; humidity: number }
  weather: { description: string; icon: string }[]
  wind: { speed: number }
  rain?: { '1h'?: number }
  snow?: { '1h'?: number }
}

export async function getPogoda(): Promise<PogodaInfo> {
  const lat = process.env['WEATHER_LAT'] ?? '51.9333'
  const lon = process.env['WEATHER_LON'] ?? '17.0167'
  const apiKey = process.env['OPENWEATHER_API_KEY']

  if (!apiKey) {
    return {
      temperatura: 15,
      odczucie: 13,
      opis: 'Brak klucza API pogody',
      rekomendacjaUbrania: 'Sprawdź pogodę ręcznie',
    }
  }

  const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pl`
  const res = await fetch(url, { next: { revalidate: 1800 } })  // cache 30 min

  if (!res.ok) {
    return {
      temperatura: 15,
      odczucie: 13,
      opis: 'Błąd pobierania pogody',
      rekomendacjaUbrania: 'Sprawdź pogodę ręcznie',
    }
  }

  const data = await res.json() as OWMResponse

  const temperatura = Math.round(data.main.temp)
  const odczucie = Math.round(data.main.feels_like)
  const opis = data.weather[0]?.description ?? 'brak opisu'
  const opad = data.rain?.['1h'] ? `Deszcz ${data.rain['1h']}mm/h` :
    data.snow?.['1h'] ? `Śnieg ${data.snow['1h']}mm/h` : undefined

  return {
    temperatura,
    odczucie,
    opis,
    rekomendacjaUbrania: getRekomendacjaUbrania(temperatura, odczucie, opad),
    opad,
    wiatr: Math.round(data.wind.speed),
  }
}

function getRekomendacjaUbrania(temp: number, odczucie: number, opad?: string): string {
  const t = odczucie  // bazuj na odczuciu termicznym

  let ubranie = ''

  if (t <= 0) ubranie = 'Kurtka zimowa, czapka, rękawiczki'
  else if (t <= 8) ubranie = 'Gruba kurtka, bluza'
  else if (t <= 14) ubranie = 'Kurtka/bluza, długie spodnie'
  else if (t <= 20) ubranie = 'Lekka kurtka lub bluza'
  else if (t <= 26) ubranie = 'Koszulka, ewentualnie lekka bluza'
  else ubranie = 'Koszulka, króciaki'

  if (opad?.includes('Deszcz')) ubranie += ' + kurtka przeciwdeszczowa'
  if (opad?.includes('Śnieg')) ubranie += ' + solidne buty'

  return ubranie
}

export function formatPogodaTelegram(p: PogodaInfo): string {
  let msg = `🌡️ *${p.temperatura}°C* (odczucie: ${p.odczucie}°C)\n`
  msg += `${p.opis}\n`
  if (p.opad) msg += `🌧️ ${p.opad}\n`
  if (p.wiatr) msg += `💨 Wiatr: ${p.wiatr} m/s\n`
  msg += `👕 ${p.rekomendacjaUbrania}`
  return msg
}
