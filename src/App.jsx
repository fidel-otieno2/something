import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login         from './pages/Login';
import Slides        from './pages/Slides';
import Gallery       from './pages/Gallery';
import Chat          from './pages/Chat';
import BottomNav     from './components/BottomNav';
import InstallPrompt from './components/InstallPrompt';
import ProfileSetup  from './components/ProfileSetup';
import NotificationPrompt from './components/NotificationPrompt';

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

function Layout() {
  const { token } = useAuth();
  const { pathname } = useLocation();
  const showNav = token && pathname !== '/login' && pathname !== '/slides';

  return (
    <>
      <Routes>
        <Route path="/"        element={<RootRedirect />} />
        <Route path="/login"   element={<Login />} />
        <Route path="/slides"  element={<PrivateRoute><Slides /></PrivateRoute>} />
        <Route path="/gallery" element={<PrivateRoute><Gallery /></PrivateRoute>} />
        <Route path="/chat"    element={<PrivateRoute><Chat /></PrivateRoute>} />
        <Route path="*"        element={<Navigate to="/" replace />} />
      </Routes>
      {showNav && <BottomNav />}
      {showNav && <ProfileSetup />}
      {showNav && <NotificationPrompt />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <InstallPrompt />
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </AuthProvider>
  );
}
