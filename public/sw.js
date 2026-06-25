const clearCaches = async () => {
  if (!self.caches) return;
  const keys = await caches.keys();
  await Promise.all(keys.map((key) => caches.delete(key)));
};

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      clearCaches(),
      self.registration.unregister(),
      self.clients.claim(),
      self.clients.matchAll({ type: "window" }).then((clients) => {
        clients.forEach((client) => client.navigate(client.url));
      }),
    ])
  );
});
