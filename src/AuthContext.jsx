import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext(null);
const API = import.meta.env.VITE_API_URL;

export function AuthProvider({ children }) {
  const [token,    setToken]    = useState(() => localStorage.getItem('ff_token'));
  const [user,     setUser]     = useState(() => JSON.parse(localStorage.getItem('ff_user') || 'null'));
  const [avatars,  setAvatars]  = useState(() => JSON.parse(localStorage.getItem('ff_avatars') || '{}'));
  const [avatarsReady, setAvatarsReady] = useState(false);

  const fetchAvatars = useCallback(async (tok) => {
    if (!tok) { setAvatarsReady(true); return; }
    try {
      const res  = await fetch(`${API}/profiles`, { headers: { Authorization: `Bearer ${tok}` } });
      const data = await res.json();
      const map  = {};
      (data.profiles || []).forEach(p => { map[p.user_id] = p.avatar_url; });
      setAvatars(map);
      localStorage.setItem('ff_avatars', JSON.stringify(map));
    } catch {
      // keep cached avatars
    } finally {
      setAvatarsReady(true);
    }
  }, []);

  useEffect(() => {
    fetchAvatars(token);
  }, [token, fetchAvatars]);

  useEffect(() => {
    if (!token) return;
    const ch = supabase.channel('profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchAvatars(token))
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [token, fetchAvatars]);

  function login(tok, usr) {
    localStorage.setItem('ff_token', tok);
    localStorage.setItem('ff_user',  JSON.stringify(usr));
    setAvatarsReady(false);
    setToken(tok);
    setUser(usr);
    fetchAvatars(tok);
  }

  function logout() {
    localStorage.removeItem('ff_token');
    localStorage.removeItem('ff_user');
    localStorage.removeItem('ff_avatars');
    setToken(null);
    setUser(null);
    setAvatars({});
    setAvatarsReady(false);
  }

  function updateMyAvatar(url) {
    const updated = { ...avatars, [user.id]: url };
    setAvatars(updated);
    localStorage.setItem('ff_avatars', JSON.stringify(updated));
  }

  return (
    <AuthContext.Provider value={{ token, user, avatars, avatarsReady, login, logout, updateMyAvatar, fetchAvatars }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
