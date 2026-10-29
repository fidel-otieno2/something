import './Avatar.css';

function pickUrl(userId, username, avatars, src) {
  if (src) return src;
  if (!avatars) return null;
  const keys = [userId, username, String(userId || '').toLowerCase(), String(username || '').toLowerCase()];
  for (const key of keys) {
    if (key && avatars[key]) return avatars[key];
  }
  return null;
}

export default function Avatar({ userId, username, avatars, src, size = 36 }) {
  const url = pickUrl(userId, username, avatars, src);
  const initial = (username || userId || '?')[0].toUpperCase();
  return (
    <div className="avatar-wrap" style={{ width: size, height: size, minWidth: size, minHeight: size }}>
      {url
        ? <img src={url} alt={username || ''} className="avatar-img" />
        : <div className="avatar-fallback" style={{ fontSize: size * 0.38 }}>{initial}</div>
      }
    </div>
  );
}
