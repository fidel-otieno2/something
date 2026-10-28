import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('ff_token'));
  const [user,  setUser]  = useState(() => JSON.parse(localStorage.getItem('ff_user') || 'null'));

  function login(tok, usr) {
    localStorage.setItem('ff_token', tok);
    localStorage.setItem('ff_user',  JSON.stringify(usr));
    setToken(tok);
    setUser(usr);
  }

  function logout() {
    localStorage.removeItem('ff_token');
    localStorage.removeItem('ff_user');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
