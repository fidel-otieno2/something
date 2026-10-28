import './Viewer.css';

export default function Viewer({ type, url, onClose }) {
  return (
    <div className="viewer-overlay" onClick={onClose}>
      <button className="viewer-close" onClick={onClose}>✕</button>
      {type === 'video'
        ? <video src={url} controls playsInline autoPlay className="viewer-media" onClick={e => e.stopPropagation()} />
        : <img src={url} className="viewer-media" alt="full view" onClick={e => e.stopPropagation()} />
      }
    </div>
  );
}
