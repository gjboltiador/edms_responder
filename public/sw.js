const CACHE_NAME = 'emergency-responder-v1'
const OFFLINE_CACHE = 'offline-maps-v1'

// Files to cache for offline functionality
const STATIC_CACHE = [
  '/',
  '/map',
  '/offline.html',
  '/images/marker-icon.svg',
  '/images/marker-shadow.svg'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets')
        return cache.addAll(STATIC_CACHE)
      })
      .then(() => {
        console.log('Service Worker installed')
        return self.skipWaiting()
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('Service Worker activated')
      return self.clients.claim()
    })
  )
})

// Fetch event - handle offline functionality
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle map tile requests
  if (url.pathname.includes('/tile.openstreetmap.org/')) {
    event.respondWith(handleMapTileRequest(request))
    return
  }

  // Handle routing API requests
  if (url.hostname.includes('router.project-osrm.org')) {
    event.respondWith(handleRoutingRequest(request))
    return
  }

  // Handle other requests
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response
          }
          return fetch(request)
            .then((response) => {
              // Cache successful responses
              if (response && response.status === 200) {
                const responseClone = response.clone()
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseClone)
                  })
              }
              return response
            })
            .catch(() => {
              // Return offline page for navigation requests
              if (request.destination === 'document') {
                return caches.match('/offline.html')
              }
              return new Response('Offline', { status: 503 })
            })
        })
    )
  }
})

// Handle map tile requests with offline caching
async function handleMapTileRequest(request) {
  const cache = await caches.open(OFFLINE_CACHE)
  
  try {
    // Try to fetch from network first
    const response = await fetch(request)
    if (response.ok) {
      // Cache the tile
      const responseClone = response.clone()
      cache.put(request, responseClone)
      return response
    }
  } catch (error) {
    console.log('Network failed for tile:', request.url)
  }

  // Try to serve from cache
  const cachedResponse = await cache.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  // Return a placeholder tile if nothing is cached
  return new Response(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    {
      headers: { 'Content-Type': 'image/png' }
    }
  )
}

// Handle routing requests with offline caching
async function handleRoutingRequest(request) {
  const cache = await caches.open(CACHE_NAME)
  
  try {
    // Try to fetch from network first
    const response = await fetch(request)
    if (response.ok) {
      // Cache the route
      const responseClone = response.clone()
      cache.put(request, responseClone)
      return response
    }
  } catch (error) {
    console.log('Network failed for route:', request.url)
  }

  // Try to serve from cache
  const cachedResponse = await cache.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  // Return a simple direct route if nothing is cached
  const url = new URL(request.url)
  const coordinates = url.pathname.split('/').pop()?.split(';')
  
  if (coordinates && coordinates.length >= 2) {
    const [origin, destination] = coordinates
    const [originLng, originLat] = origin.split(',').map(Number)
    const [destLng, destLat] = destination.split(',').map(Number)
    
    const directRoute = {
      routes: [{
        distance: calculateDistance(originLat, originLng, destLat, destLng),
        duration: calculateDistance(originLat, originLng, destLat, destLng) * 60, // Rough estimate
        geometry: {
          coordinates: [
            [originLng, originLat],
            [destLng, destLat]
          ]
        },
        legs: [{
          steps: [{
            maneuver: {
              instruction: 'Head toward destination',
              location: [destLng, destLat]
            }
          }]
        }]
      }]
    }
    
    return new Response(JSON.stringify(directRoute), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response('Route not available offline', { status: 503 })
}

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Background sync for location updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'location-sync') {
    event.waitUntil(syncLocationData())
  }
})

async function syncLocationData() {
  try {
    const clients = await self.clients.matchAll()
    clients.forEach((client) => {
      client.postMessage({
        type: 'LOCATION_SYNC',
        timestamp: Date.now()
      })
    })
  } catch (error) {
    console.error('Location sync failed:', error)
  }
}

// Handle push notifications for location updates
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Location update available',
    icon: '/images/marker-icon.svg',
    badge: '/images/marker-icon.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  }

  event.waitUntil(
    self.registration.showNotification('Emergency Responder', options)
  )
}) 