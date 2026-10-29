import './Avatar.css';

export default function Avatar({ userId, username, avatars, size = 36 }) {
  const url = avatars?.[userId];
  const initial = (username || userId || '?')[0].toUpperCase();
  return (
    <div className="avatar-wrap" style={{ width: size, height: size }}>
      {url
        ? <img src={url} alt={username} className="avatar-img" />
        : <div className="avatar-fallback" style={{ fontSize: size * 0.38 }}>{initial}</div>
      }
    </div>
  );
}
