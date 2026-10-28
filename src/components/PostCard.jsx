import { useState } from 'react';
import './PostCard.css';

function timeAgo(d) {
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

export default function PostCard({ post, user, token, api, onReload, onOpenViewer, index }) {
  const [comment, setComment] = useState('');
  const myReaction = post.reactions?.some(r => r.user_id === user.id);
  const isOwner    = post.user_id === user.id;

  async function react() {
    await fetch(`${api}/posts/${post.id}/react`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` }
    });
    onReload();
  }

  async function submitComment(e) {
    e.preventDefault();
    if (!comment.trim()) return;
    await fetch(`${api}/posts/${post.id}/comments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: comment.trim() })
    });
    setComment('');
    onReload();
  }

  async function deletePost() {
    if (!confirm('Delete this memory?')) return;
    await fetch(`${api}/posts/${post.id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
    });
    onReload();
  }

  return (
    <div className="post-card" style={{ animationDelay: `${index * 0.06}s` }}>
      <div className="post-header">
        <div className="post-header-left">
          <div className="post-avatar">{post.username[0].toUpperCase()}</div>
          <div>
            <div className="post-username">{post.username}</div>
            <div className="post-time">{timeAgo(post.created_at)}</div>
          </div>
        </div>
        {isOwner && <button className="post-delete" onClick={deletePost}>🗑</button>}
      </div>

      {post.media_url && (
        <div className="post-media" onClick={() => onOpenViewer({ type: post.media_type, url: post.media_url })}>
          {post.media_type === 'video'
            ? <video src={post.media_url} preload="metadata" playsInline />
            : <img src={post.media_url} alt="memory" loading="lazy" />
          }
        </div>
      )}

      <div className="post-body">
        {post.caption && <p className="post-caption">{post.caption}</p>}

        <div className="post-actions">
          <button className={`btn-react ${myReaction ? 'reacted' : ''}`} onClick={react}>
            {myReaction ? '❤️' : '🤍'}
            <span>{post.reactions?.length || 0}</span>
          </button>
        </div>

        <div className="comments">
          {post.comments?.map(c => (
            <div key={c.id} className="comment-item">
              <div className="comment-avatar">{c.username[0].toUpperCase()}</div>
              <div className="comment-bubble">
                <div className="comment-name">{c.username}</div>
                <div className="comment-text">{c.text}</div>
              </div>
            </div>
          ))}
          <form className="comment-form" onSubmit={submitComment}>
            <input
              className="comment-input"
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Say something... 🌸"
              maxLength={200}
            />
            <button className="btn-comment" type="submit">↑</button>
          </form>
        </div>
      </div>
    </div>
  );
}
