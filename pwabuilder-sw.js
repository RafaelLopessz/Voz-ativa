const CACHE_NAME = "voz-ativa-v1";

const ARQUIVOS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./launchericon-192x192.png",
  "./launchericon-512x512.png"
];

// Instala o Service Worker e guarda os arquivos principais
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ARQUIVOS))
      .then(() => self.skipWaiting())
  );
});

// Ativa e assume o controle da página
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(
        nomes
          .filter((nome) => nome !== CACHE_NAME)
          .map((nome) => caches.delete(nome))
      )
    ).then(() => self.clients.claim())
  );
});

// Tenta carregar da internet; se não conseguir, usa o cache
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((resposta) => {
      return resposta || fetch(event.request)
        .then((respostaDaRede) => {
          const copia = respostaDaRede.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, copia);
          });

          return respostaDaRede;
        })
        .catch(() => caches.match("./"));
    })
  );
});
