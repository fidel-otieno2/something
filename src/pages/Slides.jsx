import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Slides() {
  const navigate = useNavigate();
  const [src] = useState(() => `/slides.html?start=${Date.now()}`);

  useEffect(() => {
    localStorage.setItem('ff_seen_slides', '1');

    function handleMessage(e) {
      if (e.data === 'goto:gallery') navigate('/gallery');
      if (e.data === 'goto:login')   navigate('/login');
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#fff0f3' }}>
      <iframe
        src={src}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="For Florence"
      />
    </div>
  );
}
