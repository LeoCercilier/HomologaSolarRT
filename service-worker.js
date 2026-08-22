const CACHE_NAME = "homologasolar-v1";

const ARQUIVOS = [
  "./",
  "./index.html",
  "./login.html",
  "./dashboard.html",
  "./clientes.html",
  "./responsaveis-tecnicos.html",
  "./projeto-detalhes.html",
  "./projeto.html",
  "./template.html"
];

self.addEventListener("install", event => {

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ARQUIVOS))
  );

  self.skipWaiting();

});


self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys().then(chaves => {

      return Promise.all(

        chaves
          .filter(chave => chave !== CACHE_NAME)
          .map(chave => caches.delete(chave))

      );

    })

  );

  self.clients.claim();

});


self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  /*
   * Não armazenar requisições do Supabase.
   * Os dados continuam vindo normalmente do banco.
   */

  if (url.hostname.includes("supabase.co")) {
    return;
  }

  event.respondWith(

    fetch(event.request)
      .then(resposta => {

        const copia = resposta.clone();

        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, copia);
          });

        return resposta;

      })
      .catch(() => {

        return caches.match(event.request);

      })

  );

});
