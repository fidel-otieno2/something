import { useEffect } from 'react';

const API        = import.meta.env.VITE_API_URL;
const VAPID_KEY  = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

async function sendToServer(subscription, token) {
  await fetch(`${API}/push/subscribe`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription }),
  });
}

export function usePushNotifications(token) {
  useEffect(() => {
    if (!token || !('serviceWorker' in navigator) || !('PushManager' in window)) return;

    async function subscribe() {
      try {
        const reg = await navigator.serviceWorker.ready;

        const existing = await reg.pushManager.getSubscription();
        if (existing) { await sendToServer(existing, token); return; }

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_KEY),
        });

        await sendToServer(subscription, token);
      } catch (err) {
        console.error('Push subscribe error:', err);
      }
    }

    subscribe();
  }, [token]);
}
