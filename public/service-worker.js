const PRECACHE = 'precache-v1'
const RUNTIME_CACHE = 'runtime'
const FILES_TO_CACHE = [
  '/',
  '/db.js',
  '/styles.css',
  '/index.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
]

// Set a event listener for when a user attempts to install the app on their browser. Will cache all static files so as to run the website without internet.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(FILES_TO_CACHE))
      .then(self.skipWaiting())
  )
})

self.addEventListener('fetch', (event) => {
  // non GET requests are not cached and requests to other origins are not cached
  // if (
  //   event.request.method !== 'GET' ||
  //   !event.request.url.startsWith(self.location.origin)
  // ) {
  //   event.respondWith(fetch(event.request))
  //   return
  // }

  // handle runtime GET requests for data from /api routes
  if (event.request.url.includes('/api/')) {
    // make network request and fallback to cache if network request fails (offline)
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            if (response.status === 200) {
              cache.put(event.request.url, response.clone())
            }
            return response
          })
          .catch(() => caches.match(event.request))
      })
    )
    return
  }

  // use cache first for all other requests for performance
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      // request is not in cache. make network request and cache the response
      return caches.open(RUNTIME_CACHE).then((cache) => {
        return fetch(event.request).then((response) => {
          return cache.put(event.request, response.clone()).then(() => {
            return response
          })
        })
      })
    })
  )
})
