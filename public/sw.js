/* ScienceLab 3D Service Worker v2: Hỗ trợ PWA đa nền tảng (PC, iOS, Android) & chạy Offline */
const VERSION = "v2-sgk-2026";
const STATIC_CACHE = `sciencelab-static-${VERSION}`;
const PAGE_CACHE = `sciencelab-pages-${VERSION}`;
const PRECACHE_URLS = [
  "/",
  "/manifest.json",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/hdri/dikhololo_night_1k.hdr",
  "/fonts/DejaVuSans.ttf"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PAGE_CACHE).then((cache) =>
      Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => ![STATIC_CACHE, PAGE_CACHE].includes(k))
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

const isStaticAsset = (url) =>
  url.pathname.startsWith("/_next/static/") ||
  url.pathname.startsWith("/icons/") ||
  url.pathname.startsWith("/fonts/") ||
  url.pathname.startsWith("/hdri/") ||
  /\.(?:png|jpg|jpeg|svg|webp|ico|woff2?|ttf|hdr|js|css)$/i.test(url.pathname) ||
  url.hostname === "fonts.gstatic.com" ||
  url.hostname === "fonts.googleapis.com";

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.pathname.startsWith("/api/")) return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(PAGE_CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() =>
          caches.match(req).then((hit) => hit || caches.match("/"))
        )
    );
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(req).then((hit) => {
          const networkFetch = fetch(req)
            .then((res) => {
              if (res && (res.ok || res.type === "opaque")) {
                cache.put(req, res.clone());
              }
              return res;
            })
            .catch(() => hit);
          return hit || networkFetch;
        })
      )
    );
  }
});
