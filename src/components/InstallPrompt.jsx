import { useEffect, useState } from 'react';
import './InstallPrompt.css';

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function install() {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="install-banner">
      <span>🤍 Add <strong>Our Space</strong> to your home screen</span>
      <div className="install-actions">
        <button onClick={install}>Install</button>
        <button onClick={() => setVisible(false)}>Not now</button>
      </div>
    </div>
  );
}
