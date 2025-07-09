const CACHE_NAME = "gpt-ui-online-v2"
const STATIC_CACHE = "gpt-ui-static-v2"
const DYNAMIC_CACHE = "gpt-ui-dynamic-v2"

const staticAssets = [
  "/",
  "/chat",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/edit-icon.svg",
]

const apiRoutes = ["/api/chat", "/api/chat/stream"]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log("Caching static assets")
        return cache.addAll(staticAssets)
      }),
    ]),
  )
  self.skipWaiting()
})

// Activate event - clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log("Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

// Fetch event - network-first for API, cache-first for static
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle API routes - always try network first
  if (apiRoutes.some((route) => url.pathname.startsWith(route))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Don't cache API responses, just return them
          return response
        })
        .catch((error) => {
          console.log("API request failed:", error)
          // Return a basic error response for API failures
          return new Response(JSON.stringify({ error: "Network unavailable", offline: true }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
          })
        }),
    )
    return
  }

  // Handle static assets - cache first
  if (staticAssets.includes(url.pathname) || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(request).then((response) => {
        return (
          response ||
          fetch(request).then((fetchResponse) => {
            return caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, fetchResponse.clone())
              return fetchResponse
            })
          })
        )
      }),
    )
    return
  }

  // Handle other requests - network first, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone()
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(request).then((response) => {
          if (response) {
            return response
          }
          // If it's a navigation request and not in cache, return index
          if (request.destination === "document") {
            return caches.match("/")
          }
          // For other requests, return a basic response
          return new Response("Offline", { status: 503 })
        })
      }),
  )
})

// Background sync for online functionality
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    console.log("Background sync triggered")
    // Handle any pending sync operations
  }
})

// Push notifications
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
      },
      requireInteraction: false,
      silent: false,
    }

    event.waitUntil(self.registration.showNotification(data.title || "GPT UI", options))
  }
})

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url === self.location.origin && "focus" in client) {
          return client.focus()
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow("/")
      }
    }),
  )
})

// Handle messages from main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})
