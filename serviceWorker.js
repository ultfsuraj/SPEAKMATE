const assets = [
  'https://speakmate-2vp.pages.dev/',
  'https://speakmate-2vp.pages.dev/?launcher=homescreen',
  'https://speakmate-2vp.pages.dev/style.css',
  'https://speakmate-2vp.pages.dev/script.js',
  'https://speakmate-2vp.pages.dev/sw-register.js',
  'https://speakmate-2vp.pages.dev/chatbot.webp',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0',
  'https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&display=swap',
  'https://fonts.gstatic.com/s/figtree/v5/_Xms-HUzqDCFdgfMm4S9DaRvzig.woff2',
  'https://fonts.gstatic.com/s/materialsymbolsoutlined/v192/kJF1BvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oDMzByHX9rA6RzaxHMPdY43zj-jCxv3fzvRNU22ZXGJpEpjC_1v-p_4MrImHCIJIZrDCvHOejbdhzrA.woff2',
]

const cacheSet = new Set(assets)

self.addEventListener('install', (event) => {
  // browser kills within 40s, so wait until large assets
  event.waitUntil(
    caches.open('assets').then((cache) => {
      try {
        cache.addAll(assets)
      } catch (e) {
        console.log('error in caching asset')
      }
    }),
  )
})

// old assets are fetched, and also a network call is made to update the cache for next requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (!cacheSet.has(url.href)) {
    event.respondWith(fetch(event.request))
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        caches.open('assets').then((cache) => {
          cache.put(event.request, networkResponse.clone())
          return networkResponse
        })
      })

      return response || fetchPromise
    }),
  )
})
