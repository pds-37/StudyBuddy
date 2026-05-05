import { apiClient } from "../api/client";
import { env } from "../constants/env";

/**
 * Registers the service worker and subscribes to push notifications.
 */
export async function subscribeToPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications are not supported in this browser.');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered:', registration);

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: env.vapidPublicKey
    });

    await apiClient.post('/notifications/subscribe', { subscription });
    console.log('Push subscription successful');
    return true;
  } catch (error) {
    console.error('Push subscription failed:', error);
    return false;
  }
}

/**
 * Checks if the user has already granted notification permission.
 */
export function getNotificationPermission() {
  return Notification.permission;
}
