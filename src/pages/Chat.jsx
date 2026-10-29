import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabase';
import './Chat.css';

const API = import.meta.env.VITE_API_URL;

export default function Chat() {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text,     setText]     = useState('');
  const [sending,  setSending]  = useState(false);
  const [imgFile,  setImgFile]  = useState(null);
  const [imgPrev,  setImgPrev]  = useState(null);
  const bottomRef = useRef();
  const fileRef   = useRef();

  const loadMessages = useCallback(async () => {
    const res  = await fetch(`${API}/messages`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setMessages(data.messages || []);
  }, [token]);

  useEffect(() => {
    loadMessages();
    const ch = supabase.channel('chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, loadMessages)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function pickImage(e) {
    const f = e.target.files[0];
    if (!f) return;
    setImgFile(f);
    setImgPrev(URL.createObjectURL(f));
  }

  async function send(e) {
    e.preventDefault();
    if ((!text.trim() && !imgFile) || sending) return;
    setSending(true);
    const fd = new FormData();
    if (text.trim()) fd.append('text', text.trim());
    if (imgFile) fd.append('file', imgFile);
    await fetch(`${API}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    setText('');
    setImgFile(null);
    setImgPrev(null);
    setSending(false);
  }

  function fmt(d) {
    return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  function dayLabel(d) {
    const date = new Date(d);
    const today = new Date();
    const diff  = Math.floor((today - date) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // Group messages by day
  const grouped = messages.reduce((acc, msg) => {
    const day = new Date(msg.created_at).toDateString();
    if (!acc[day]) acc[day] = [];
    acc[day].push(msg);
    return acc;
  }, {});

  return (
    <div className="chat-page">
      <header className="chat-header">
        <div className="chat-header-avatar">
          {user?.id === 'fidel' ? 'F' : 'F'}
        </div>
        <div className="chat-header-info">
          <div className="chat-header-name">
            {user?.id === 'fidel' ? 'Florence 🤍' : 'Fidel 🤍'}
          </div>
          <div className="chat-header-sub">FloRish</div>
        </div>
      </header>

      <div className="chat-body">
        {Object.entries(grouped).map(([day, msgs]) => (
          <div key={day}>
            <div className="chat-day-label">{dayLabel(msgs[0].created_at)}</div>
            {msgs.map(msg => {
              const mine = msg.user_id === user.id;
              return (
                <div key={msg.id} className={`chat-row ${mine ? 'mine' : 'theirs'}`}>
                  <div className={`chat-bubble ${mine ? 'bubble-mine' : 'bubble-theirs'}`}>
                    {msg.media_url && (
                      <div className="chat-media">
                        {msg.media_type === 'video'
                          ? <video src={msg.media_url} controls playsInline />
                          : <img src={msg.media_url} alt="" />
                        }
                      </div>
                    )}
                    {msg.text && <p className="chat-text">{msg.text}</p>}
                    <span className="chat-time">{fmt(msg.created_at)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {imgPrev && (
        <div className="chat-img-preview">
          <img src={imgPrev} alt="preview" />
          <button onClick={() => { setImgFile(null); setImgPrev(null); }}>✕</button>
        </div>
      )}

      <form className="chat-input-bar" onSubmit={send}>
        <button type="button" className="chat-attach" onClick={() => fileRef.current.click()}>📎</button>
        <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={pickImage} />
        <input
          className="chat-input"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Message..."
          autoComplete="off"
        />
        <button className="chat-send" type="submit" disabled={sending || (!text.trim() && !imgFile)}>
          {sending ? '...' : '➤'}
        </button>
      </form>
    </div>
  );
}
