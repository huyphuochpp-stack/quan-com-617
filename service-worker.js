const CACHE = "quancom617-v1";

const SHELL = [
  "./",
  "./index.html",
  "./manifest.json"
];

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(SHELL);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys
          .filter(function(key) {
            return key !== CACHE;
          })
          .map(function(key) {
            return caches.delete(key);
          })
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", function(event) {
  // Không cache API Google Apps Script
  if (event.request.url.includes("script.google.com")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function(cached) {

      if (cached) {
        return cached;
      }

      return fetch(event.request).then(function(response) {

        // Chỉ cache response hợp lệ
        if (!response || response.status !== 200) {
          return response;
        }

        var copy = response.clone();

        caches.open(CACHE).then(function(cache) {
          cache.put(event.request, copy);
        });

        return response;
      });

    })
  );
});