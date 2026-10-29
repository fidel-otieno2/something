import { NavLink } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import AvatarPicker from './AvatarPicker';
import './BottomNav.css';

export default function BottomNav() {
  const { logout, user } = useAuth();
  return (
    <nav className="top-nav">
      <div className="top-nav-brand">
        <span className="top-nav-logo">FloRish 🤍</span>
        <NavLink to="/slides" className="top-nav-story" title="Replay the proposal from the start">
          Proposal
        </NavLink>
      </div>
      <div className="top-nav-tabs">
        <NavLink to="/gallery" className={({ isActive }) => isActive ? 'tab active' : 'tab'}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
          </svg>
          <span>Gallery</span>
        </NavLink>
        <NavLink to="/chat" className={({ isActive }) => isActive ? 'tab active' : 'tab'}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span>Messages</span>
        </NavLink>
        <AvatarPicker size={32} />
        <button className="tab logout-tab" onClick={logout} title={`Log out ${user?.displayName || ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>{user?.displayName}</span>
        </button>
      </div>
    </nav>
  );
}
