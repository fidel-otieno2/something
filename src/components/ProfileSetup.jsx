import { useState } from 'react';
import { useAuth } from '../AuthContext';
import AvatarPicker from './AvatarPicker';
import './ProfileSetup.css';

export default function ProfileSetup() {
  const { user, avatars, avatarsReady } = useAuth();
  const [skipped, setSkipped] = useState(() => localStorage.getItem('ff_avatar_skipped') === '1');

  if (!avatarsReady || skipped || avatars?.[user?.id]) return null;

  function skip() {
    localStorage.setItem('ff_avatar_skipped', '1');
    setSkipped(true);
  }

  return (
    <div className="ps-overlay">
      <div className="ps-card">
        <h2>Choose your photo</h2>
        <p>This picture shows up in messages, posts, comments, and notifications.</p>
        <div className="ps-picker">
          <AvatarPicker size={96} alwaysShowCamera showActions />
        </div>
        <p className="ps-hint">Take a photo or pick one from your gallery</p>
        <button className="ps-skip" onClick={skip}>Skip for now</button>
      </div>
    </div>
  );
}
