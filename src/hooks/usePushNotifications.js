import { useCallback, useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

function currentPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

async function getVapidKey() {
  if (import.meta.env.VITE_VAPID_PUBLIC_KEY) return import.meta.env.VITE_VAPID_PUBLIC_KEY;
  const res  = await fetch(`${API}/push/vapid-key`);
  const data = await res.json();
  return data.key;
}

async function sendToServer(subscription, token) {
  await fetch(`${API}/push/subscribe`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription }),
  });
}

async function subscribePush(token) {
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    const key = await getVapidKey();
    if (!key) throw new Error('Missing VAPID key');
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key),
    });
  }
  await sendToServer(sub, token);
  return sub;
}

export function usePushNotifications(token) {
  const [permission, setPermission] = useState(currentPermission);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPermission(currentPermission());
  }, [token]);

  useEffect(() => {
    if (!token || permission !== 'granted') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    subscribePush(token).catch(err => console.error('Push subscribe error:', err));
    const id = setInterval(() => {
      subscribePush(token).catch(() => {});
    }, 6 * 60 * 60 * 1000);
    return () => clearInterval(id);
  }, [token, permission]);

  const enable = useCallback(async () => {
    if (!token || !('Notification' in window)) return currentPermission();
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm === 'granted') await subscribePush(token);
      return perm;
    } catch (err) {
      console.error('Push permission error:', err);
      return currentPermission();
    } finally {
      setBusy(false);
    }
  }, [token]);

  return { permission, enable, busy };
}
