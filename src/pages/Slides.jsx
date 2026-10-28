import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Slides() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('ff_seen_slides', '1');

    // Listen for clicks on /gallery or /login links inside the iframe
    function handleMessage(e) {
      if (e.data === 'goto:gallery') navigate('/gallery');
      if (e.data === 'goto:login')   navigate('/login');
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#fff0f3' }}>
      <iframe
        src="/slides.html"
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="For Florence"
      />
    </div>
  );
}
