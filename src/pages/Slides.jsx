import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Slides() {
  const navigate = useNavigate();

  useEffect(() => {
    // Mark slides as seen so Florence goes straight to gallery next time
    localStorage.setItem('ff_seen_slides', '1');
  }, []);

  function handleEnterGallery() {
    navigate('/gallery');
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#fff0f3' }}>
      <iframe
        src="/slides.html"
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="For Florence"
      />
      {/* Floating button to enter gallery after slides */}
      <button
        onClick={handleEnterGallery}
        style={{
          position: 'fixed', bottom: '32px', left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg,#c9748a,#8b3a52)',
          color: '#fff', border: 'none', borderRadius: '50px',
          padding: '14px 36px', fontSize: '1rem', fontWeight: 500,
          cursor: 'pointer', zIndex: 999,
          boxShadow: '0 4px 20px rgba(201,116,138,.4)',
          fontFamily: 'Inter, system-ui, sans-serif',
          whiteSpace: 'nowrap'
        }}
      >
        Enter Our Space 🤍
      </button>
    </div>
  );
}
