import { useRef, useState } from 'react';
import { useAuth } from '../AuthContext';
import Avatar from './Avatar';
import './AvatarPicker.css';

const API = import.meta.env.VITE_API_URL;

export default function AvatarPicker({ size = 36, alwaysShowCamera = false }) {
  const { token, user, avatars, updateMyAvatar, fetchAvatars } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  async function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', f);
    try {
      const res  = await fetch(`${API}/profile/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (data.avatar_url) {
        updateMyAvatar(data.avatar_url);
        localStorage.setItem('ff_avatar_skipped', '1');
        fetchAvatars(token);
      }
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div
      className={`ap-wrap ${alwaysShowCamera ? 'ap-always' : ''}`}
      onClick={() => fileRef.current.click()}
      title="Change profile photo"
    >
      <Avatar userId={user.id} username={user.displayName} avatars={avatars} size={size} />
      <div className="ap-overlay">{uploading ? '...' : '📷'}</div>
      <input ref={fileRef} type="file" accept="image/*" capture="user" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  );
}
