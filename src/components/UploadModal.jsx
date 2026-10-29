import { useState, useRef } from 'react';
import './UploadModal.css';

export default function UploadModal({ token, api, onClose, onPosted }) {
  const [file,     setFile]     = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [fileType, setFileType] = useState(null);
  const [caption,  setCaption]  = useState('');
  const [posting,  setPosting]  = useState(false);
  const inputRef = useRef();

  function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setFileType(f.type.startsWith('video') ? 'video' : 'image');
  }

  async function submit() {
    if (!file && !caption.trim()) return;
    setPosting(true);
    const fd = new FormData();
    if (file) fd.append('file', file);
    if (caption.trim()) fd.append('caption', caption.trim());
    try {
      const res = await fetch(`${api}/posts`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      onPosted();
    } catch (err) {
      alert(err.message || 'Upload failed. Try again.');
      setPosting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 className="modal-title">New Memory 🤍</h2>

        {!preview ? (
          <div className="file-drop" onClick={() => inputRef.current.click()}>
            <span>📷</span>
            <p>Tap to choose photo or video</p>
            <input ref={inputRef} type="file" accept="image/*,video/*" style={{ display:'none' }} onChange={handleFile} />
          </div>
        ) : (
          <div className="preview-wrap">
            {fileType === 'video'
              ? <video src={preview} controls playsInline className="preview-media" />
              : <img src={preview} className="preview-media" alt="preview" />
            }
            <button className="change-file" onClick={() => { setFile(null); setPreview(null); }}>Change</button>
          </div>
        )}

        <textarea
          className="caption-input"
          value={caption}
          onChange={e => setCaption(e.target.value)}
          placeholder="Add a caption... (optional)"
          maxLength={300}
        />

        {posting && <div className="upload-progress"><div className="upload-bar-fill" /></div>}

        <button className="btn-post" onClick={submit} disabled={posting}>
          {posting ? 'Posting...' : 'Post 🌸'}
        </button>
      </div>
    </div>
  );
}
