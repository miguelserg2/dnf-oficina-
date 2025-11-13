const CACHE_NAME = 'dnf-office-virtual-cache-v1';
// Lista de recursos básicos para cachear (el "App Shell").
const URLS_TO_CACHE = [
  '/',
  '/index.html',
];

// Evento de instalación: se dispara cuando el SW se instala por primera vez.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Evento de activación: se dispara cuando el SW se activa.
// Se usa para limpiar cachés antiguas y asegurar que el SW esté actualizado.
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Evento de fetch: se dispara cada vez que la aplicación realiza una petición de red.
// Intercepta la petición para servir desde la caché si es posible.
self.addEventListener('fetch', (event) => {
    // Solo se gestionan las peticiones GET.
    if (event.request.method !== 'GET') {
        return;
    }

    // Estrategia: "Network first, falling back to cache".
    // Intenta obtener el recurso de la red primero para tener la versión más actualizada.
    // Si falla (offline), lo busca en la caché.
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Si la petición de red tiene éxito, se clona la respuesta y se guarda en caché.
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
                return response;
            })
            .catch(() => {
                // Si la petición de red falla, se busca en la caché.
                return caches.match(event.request).then((response) => {
                    // Si se encuentra en caché, se devuelve. Si no, la petición fallará.
                    return response; 
                });
            })
    );
});
