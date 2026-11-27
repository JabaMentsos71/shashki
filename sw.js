// Офлайн-кэш приложения «Шашки на троих»
const CACHE = 'checkers3-59435ac55f';
const FILES = ["./","index.html","manifest.webmanifest","icon.svg","icon-192.png","icon-512.png"];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('checkers3-') && k !== CACHE && k !== 'checkers3-fonts').map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Шрифты Google: один раз скачались — дальше из кэша
  if (url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com') {
    e.respondWith(caches.open('checkers3-fonts').then((c) => c.match(req).then((hit) => hit || fetch(req).then((r) => { c.put(req, r.clone()); return r; }))));
    return;
  }
  if (url.origin !== location.origin) return;
  // Страница: сначала свежая из сети, без сети — из кэша
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put('index.html', copy)); return r; })
      .catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
