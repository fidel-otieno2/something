import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './Login.css';

const API = import.meta.env.VITE_API_URL;

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    if (!username || !password) { setError('Please fill in both fields.'); return; }
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim().toLowerCase(), password })
      });
      const data = await res.json();
      if (!res.ok) { setError('Wrong username or password.'); setLoading(false); return; }
      login(data.token, data.user);
      if (data.user.id === 'florence' && !localStorage.getItem('ff_seen_slides')) {
        navigate('/slides');
      } else {
        navigate('/gallery');
      }
    } catch {
      setError('Connection error. Try again.');
      setLoading(false);
    }
  }

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-icon">🤍</div>
        <h1>FloRish</h1>
        <p className="login-sub">Just the two of us.</p>
        <form onSubmit={handleLogin}>
          <div className="field">
            <label>Username</label>
            <input
              type="text" value={username} autoCapitalize="none"
              onChange={e => setUsername(e.target.value)}
              placeholder="fidel or florence"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••••"
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button className="btn-login" disabled={loading}>
            {loading ? 'Entering...' : 'Enter 🌸'}
          </button>
        </form>
      </div>
    </div>
  );
}
