// ROTH Personal OS — Service Worker
// Offline-first: cache plan dnia + rozkłady busów

const CACHE_NAME = 'roth-v1'
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/manifest.json',
]

// Zasoby które cachujemy offline
const API_CACHE_ROUTES = [
  '/api/transport',
  '/api/water',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Pomijaj non-GET requests
  if (event.request.method !== 'GET') return

  // Pomijaj zewnętrzne URL
  if (url.origin !== self.location.origin) return

  // Strategia: Network first, fallback do cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache'uj tylko OK responses
        if (response.ok && !url.pathname.startsWith('/api/telegram')) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone)
          })
        }
        return response
      })
      .catch(() => {
        // Offline — zwróć z cache
        return caches.match(event.request).then((cached) => {
          if (cached) return cached

          // Fallback dla nawigacji
          if (event.request.mode === 'navigate') {
            return caches.match('/dashboard')
          }

          return new Response(
            JSON.stringify({ error: 'Offline — brak połączenia z internetem' }),
            { headers: { 'Content-Type': 'application/json' } }
          )
        })
      })
  )
})
