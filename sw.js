const CACHE = "hunter-v1";
const SHELL = ["./","./index.html","./config.js","./corpus.geojson","./node.html","./about.html",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css","https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(()=>self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  // API-kall (Worker) skal alltid til nett (aldri cache live data)
  if (u.pathname.startsWith("/api/") || u.pathname==="/ingest" || u.pathname==="/track" || u.pathname==="/survey" || u.pathname==="/whoami") return;
  // shell: cache-first, fall tilbake til nett
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
    if (e.request.method==="GET" && resp.ok && u.origin===location.origin)
      { const cp=resp.clone(); caches.open(CACHE).then(c=>c.put(e.request,cp)); }
    return resp;
  }).catch(()=>caches.match("./index.html"))));
});
