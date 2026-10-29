import { useState } from 'react';
import Avatar from './Avatar';
import './PostCard.css';

function timeAgo(d) {
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function PostCard({ post, user, token, api, avatars, onReload, onOpenViewer, index }) {
  const [comment,   setComment]   = useState('');
  const [hearted,   setHearted]   = useState(false); // double-tap animation
  const [submitting, setSubmitting] = useState(false);
  const myReaction = post.reactions?.some(r => r.user_id === user.id);
  const isOwner    = post.user_id === user.id;
  const likeCount  = post.reactions?.length || 0;
  const comments   = post.comments || [];

  async function react() {
    await fetch(`${api}/posts/${post.id}/react`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` }
    });
    onReload();
  }

  function doubleTap() {
    if (!myReaction) react();
    setHearted(true);
    setTimeout(() => setHearted(false), 900);
  }

  async function submitComment(e) {
    e.preventDefault();
    if (!comment.trim() || submitting) return;
    setSubmitting(true);
    await fetch(`${api}/posts/${post.id}/comments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: comment.trim() })
    });
    setComment('');
    setSubmitting(false);
    onReload();
  }

  async function deletePost() {
    if (!confirm('Delete this memory?')) return;
    await fetch(`${api}/posts/${post.id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
    });
    onReload();
  }

  async function deleteComment(id) {
    await fetch(`${api}/comments/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
    });
    onReload();
  }

  return (
    <article className="pc" style={{ animationDelay: `${index * 0.06}s` }}>

      {/* ── HEADER ── */}
      <div className="pc-header">
        <div className="pc-header-left">
          <Avatar userId={post.user_id} username={post.username} avatars={avatars} size={32} />
          <span className="pc-username">{post.username}</span>
        </div>
        {isOwner && (
          <button className="pc-more" onClick={deletePost} title="Delete">•••</button>
        )}
      </div>

      {/* ── MEDIA ── */}
      {post.media_url && (
        <div className="pc-media" onDoubleClick={doubleTap}
          onClick={() => onOpenViewer({ type: post.media_type, url: post.media_url })}>
          {post.media_type === 'video'
            ? <video src={post.media_url} preload="metadata" playsInline />
            : <img src={post.media_url} alt="memory" loading="lazy" />
          }
          {hearted && <div className="pc-heart-burst">❤️</div>}
        </div>
      )}

      {/* ── ACTIONS ── */}
      <div className="pc-actions">
        <button className={`pc-btn-heart ${myReaction ? 'liked' : ''}`} onClick={react}>
          {myReaction
            ? <svg viewBox="0 0 24 24" fill="#ed4956"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          }
        </button>
        <button className="pc-btn-comment-icon" onClick={() => document.getElementById(`ci-${post.id}`)?.focus()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </button>
      </div>

      {/* ── LIKES ── */}
      {likeCount > 0 && (
        <div className="pc-likes">{likeCount} {likeCount === 1 ? 'like' : 'likes'}</div>
      )}

      {/* ── CAPTION ── */}
      {post.caption && (
        <div className="pc-caption">
          <span className="pc-cap-user">{post.username}</span> {post.caption}
        </div>
      )}

      {/* ── COMMENTS ── */}
      {comments.length > 0 && (
        <div className="pc-comments">
          {comments.map(c => (
            <div key={c.id} className="pc-comment">
              <Avatar userId={c.user_id} username={c.username} avatars={avatars} size={22} />
              <span className="pc-comment-body">
                <span className="pc-cap-user">{c.username}</span> {c.text}
              </span>
              {c.user_id === user.id && (
                <button className="pc-del-comment" onClick={() => deleteComment(c.id)}>×</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── TIME ── */}
      <div className="pc-time">{timeAgo(post.created_at)}</div>

      {/* ── COMMENT INPUT ── */}
      <form className="pc-comment-form" onSubmit={submitComment}>
        <Avatar userId={user.id} username={user.displayName} avatars={avatars} size={28} />
        <input
          id={`ci-${post.id}`}
          className="pc-comment-input"
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Add a comment..."
          maxLength={200}
        />
        {comment.trim() && (
          <button className="pc-post-btn" type="submit" disabled={submitting}>Post</button>
        )}
      </form>

    </article>
  );
}
