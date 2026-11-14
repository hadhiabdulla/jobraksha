const C='jr-v1';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html','engine.js','i18n.js','manifest.json'])));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(clients.claim());});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).catch(()=>caches.match('index.html'))));});
