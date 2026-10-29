import { useRef, useState } from 'react';
import { useAuth } from '../AuthContext';
import Avatar from './Avatar';
import './AvatarPicker.css';

const API = import.meta.env.VITE_API_URL;

export default function AvatarPicker({ size = 36, alwaysShowCamera = false, showActions = false }) {
  const { token, user, avatars, updateMyAvatar, fetchAvatars } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [menu, setMenu] = useState(false);
  const cameraRef = useRef();
  const galleryRef = useRef();

  async function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setUploading(true);
    setMenu(false);
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

  const actions = (
    <div className={`ap-actions ${showActions ? 'ap-actions-row' : 'ap-actions-menu'}`}>
      <button type="button" onClick={() => cameraRef.current.click()}>Take photo</button>
      <button type="button" onClick={() => galleryRef.current.click()}>From gallery</button>
    </div>
  );

  return (
    <div className="ap-root">
      <div
        className={`ap-wrap ${alwaysShowCamera ? 'ap-always' : ''}`}
        onClick={() => { if (!showActions) setMenu(open => !open); }}
        title="Change profile photo"
      >
        <Avatar userId={user.id} username={user.displayName} avatars={avatars} size={size} />
        <div className="ap-overlay">{uploading ? '...' : '📷'}</div>
      </div>
      {showActions ? actions : menu ? actions : null}
      <input ref={cameraRef} type="file" accept="image/*" capture="user" style={{ display: 'none' }} onChange={handleFile} />
      <input ref={galleryRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  );
}
