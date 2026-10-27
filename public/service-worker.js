// Service Worker for My Health Coach PWA

const CACHE_NAME = "my-health-coach-v1";

// Files to cache for offline use
const urlsToCache = [
  "/",
  "/index.html",
  "/logo.png",
  "/manifest.json",
];

// Install event - cache files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request);
    })
  );
});

// Push event - handle incoming push notifications
self.addEventListener("push", (event) => {
  console.log("Push notification received:", event);

  let data = {
    title: "My Health Coach",
    body: "You have a new notification",
    icon: "/logo.png",
    url: "/dashboard",
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/logo.png",
    badge: "/logo.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/dashboard",
      timestamp: data.timestamp || Date.now(),
    },
    actions: [
      {
        action: "open",
        title: "Open App",
      },
      {
        action: "close",
        title: "Dismiss",
      },
    ],
    requireInteraction: true,
    tag: "health-coach-notification",
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event - handle user interaction
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event);

  event.notification.close();

  if (event.action === "close") {
    return;
  }

  // Open the app or focus existing window
  const urlToOpen = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Check if there's already an open window
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // Open new window if none exists
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync for offline actions (optional)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-health-data") {
    console.log("Background sync triggered");
    // Handle background sync here
  }
});
