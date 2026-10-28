import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login         from './pages/Login';
import Slides        from './pages/Slides';
import Gallery       from './pages/Gallery';
import InstallPrompt from './components/InstallPrompt';

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function RootRedirect() {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (user?.id === 'florence' && !localStorage.getItem('ff_seen_slides')) {
    return <Navigate to="/slides" replace />;
  }
  return <Navigate to="/gallery" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <InstallPrompt />
      <BrowserRouter>
        <Routes>
          <Route path="/"        element={<RootRedirect />} />
          <Route path="/login"   element={<Login />} />
          <Route path="/slides"  element={<PrivateRoute><Slides /></PrivateRoute>} />
          <Route path="/gallery" element={<PrivateRoute><Gallery /></PrivateRoute>} />
          <Route path="*"        element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
