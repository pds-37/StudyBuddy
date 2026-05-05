self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : { title: 'StudyBuddy Veda', body: 'You have a new update!' };
  
  const options = {
    body: data.body,
    icon: '/logo192.png', // Fallback icon
    badge: '/badge.png',
    data: data.data || {},
    vibrate: [100, 50, 100],
    actions: [
      { action: 'open', title: 'Open StudyBuddy' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});
