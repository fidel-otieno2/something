import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabase';
import PostCard from '../components/PostCard';
import UploadModal from '../components/UploadModal';
import Viewer from '../components/Viewer';
import './Gallery.css';

const API = import.meta.env.VITE_API_URL;

export default function Gallery() {
  const { token, user, logout } = useAuth();
  const [posts,       setPosts]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showUpload,  setShowUpload]  = useState(false);
  const [viewer,      setViewer]      = useState(null); // { type, url }

  async function loadPosts() {
    try {
      const res  = await fetch(`${API}/posts`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) { logout(); return; }
      const data = await res.json();
      setPosts(data.posts || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
    const channel = supabase.channel('gallery')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' },    () => loadPosts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reactions' }, () => loadPosts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' },  () => loadPosts())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <div className="gallery-page">
      {/* HEADER */}
      <header className="g-header">
        <span className="g-logo">🤍 Wetu</span>
        <div className="g-header-right">
          <span className="g-username">{user?.displayName}</span>
          <button className="btn-logout" onClick={logout}>↩</button>
        </div>
      </header>

      {/* UPLOAD TRIGGER */}
      <div className="upload-bar">
        <div className="upload-inner">
          <div className="avatar">{user?.displayName?.[0]?.toUpperCase()}</div>
          <button className="upload-trigger" onClick={() => setShowUpload(true)}>
            Share a moment, photo or video... 🌸
          </button>
        </div>
      </div>

      {/* FEED */}
      <main className="feed">
        {loading ? (
          <div className="feed-loading"><span className="spinner" /></div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌸</div>
            <p>No memories yet.<br />Be the first to post something beautiful.</p>
          </div>
        ) : (
          posts.map((post, i) => (
            <PostCard
              key={post.id}
              post={post}
              user={user}
              token={token}
              api={API}
              onReload={loadPosts}
              onOpenViewer={setViewer}
              index={i}
            />
          ))
        )}
      </main>

      {showUpload && (
        <UploadModal
          token={token}
          api={API}
          onClose={() => setShowUpload(false)}
          onPosted={() => { setShowUpload(false); loadPosts(); }}
        />
      )}

      {viewer && <Viewer type={viewer.type} url={viewer.url} onClose={() => setViewer(null)} />}
    </div>
  );
}
