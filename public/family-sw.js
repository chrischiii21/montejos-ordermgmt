// Minimal service worker for the family calendar so older Android browsers
// (Samsung Internet, older Chrome) treat it as installable. It caches nothing:
// every request goes straight to the network, so orders are always live.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;
	event.respondWith(fetch(event.request));
});
