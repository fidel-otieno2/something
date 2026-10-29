import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { usePushNotifications } from '../hooks/usePushNotifications';
import './NotificationPrompt.css';

function isIos() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

export default function NotificationPrompt() {
  const { token } = useAuth();
  const { permission, enable, busy } = usePushNotifications(token);
  const [snoozed, setSnoozed] = useState(() => {
    const until = Number(sessionStorage.getItem('ff_notif_snooze') || 0);
    return Date.now() < until;
  });

  useEffect(() => {
    if (!token) return;
    const onVisible = () => {
      if (document.visibilityState === 'visible' && Notification?.permission === 'granted') {
        enable();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [token, enable]);

  if (!token || snoozed) return null;

  const iosNeedsInstall = isIos() && !isStandalone();
  const needsAsk = permission === 'default';
  const blocked = permission === 'denied';
  const unsupported = permission === 'unsupported' && !iosNeedsInstall;

  if (permission === 'granted' || unsupported) return null;
  if (!needsAsk && !blocked && !iosNeedsInstall) return null;

  function snooze() {
    sessionStorage.setItem('ff_notif_snooze', String(Date.now() + 5 * 60 * 1000));
    setSnoozed(true);
  }

  async function allow() {
    const perm = await enable();
    if (perm !== 'granted' && perm !== 'denied') snooze();
  }

  return (
    <div className="notif-banner">
      {iosNeedsInstall ? (
        <>
          <span>Add <strong>FloRish</strong> to your home screen, then open it from there to get alerts.</span>
          <div className="notif-actions">
            <button type="button" onClick={snooze}>Got it</button>
          </div>
        </>
      ) : blocked ? (
        <>
          <span>Notifications are off. Turn them on for this site in your browser settings, then tap retry.</span>
          <div className="notif-actions">
            <button type="button" onClick={allow} disabled={busy}>
              {busy ? 'Checking...' : 'Try again'}
            </button>
          </div>
        </>
      ) : (
        <>
          <span>Allow notifications so new messages, voice notes, reactions, and posts reach you instantly.</span>
          <div className="notif-actions">
            <button type="button" onClick={allow} disabled={busy}>
              {busy ? 'Please wait...' : 'Allow notifications'}
            </button>
            <button type="button" onClick={snooze}>Not now</button>
          </div>
        </>
      )}
    </div>
  );
}
