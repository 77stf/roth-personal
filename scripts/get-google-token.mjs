/**
 * Jednorazowy skrypt do uzyskania Google Refresh Token.
 * Uruchom: node scripts/get-google-token.mjs
 * Wymaga: GOOGLE_CLIENT_ID i GOOGLE_CLIENT_SECRET w .env.local
 */

import { createServer } from 'http';
import { readFileSync } from 'fs';
import { parse } from 'url';

// Wczytaj .env.local ręcznie (bez dotenv dependency)
const envFile = readFileSync('.env.local', 'utf-8');
const env = {};
for (const line of envFile.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const [key, ...rest] = trimmed.split('=');
  env[key.trim()] = rest.join('=').trim();
}

const CLIENT_ID = env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3333/callback';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Brak GOOGLE_CLIENT_ID lub GOOGLE_CLIENT_SECRET w .env.local');
  process.exit(1);
}

// Scopes potrzebne dla Sheets + Calendar
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/calendar.readonly',
].join(' ');

const authUrl =
  `https://accounts.google.com/o/oauth2/v2/auth` +
  `?client_id=${CLIENT_ID}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_type=code` +
  `&scope=${encodeURIComponent(SCOPES)}` +
  `&access_type=offline` +
  `&prompt=consent`;

console.log('\n=== GOOGLE REFRESH TOKEN GENERATOR ===\n');
console.log('1. Otwórz w przeglądarce:\n');
console.log(authUrl);
console.log('\n2. Zaloguj się na konto Google i zezwól na dostęp.');
console.log('3. Zostaniesz przekierowany — skrypt automatycznie przechwyci kod.\n');

// Lokalny serwer do przechwycenia callback
const server = createServer(async (req, res) => {
  const { pathname, query } = parse(req.url, true);

  if (pathname !== '/callback') {
    res.end('Not found');
    return;
  }

  const code = query.code;
  if (!code) {
    res.end('Brak kodu autoryzacyjnego.');
    return;
  }

  // Wymień code na refresh_token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  const data = await tokenRes.json();

  if (data.error) {
    console.error('\nBłąd:', data.error_description || data.error);
    res.end('Błąd — sprawdź terminal.');
    server.close();
    return;
  }

  console.log('\n=== SUKCES ===\n');
  console.log('Wklej to do .env.local:\n');
  console.log(`GOOGLE_REFRESH_TOKEN=${data.refresh_token}`);
  console.log('\n');

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <h2>Token uzyskany pomyslnie!</h2>
    <p>Sprawdz terminal — skopiuj GOOGLE_REFRESH_TOKEN do .env.local</p>
    <p>Mozesz zamknac ta karte.</p>
  `);

  server.close();
  process.exit(0);
});

server.listen(3333, () => {
  console.log('Serwer nasłuchuje na http://localhost:3333 ...\n');
});
