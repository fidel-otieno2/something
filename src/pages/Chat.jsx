import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabase';
import Avatar from '../components/Avatar';
import AvatarPicker from '../components/AvatarPicker';
import './Chat.css';

const API = import.meta.env.VITE_API_URL;
const EMOJIS = ['❤️', '😂', '😮', '😢', '🤍'];

function groupReactions(list = []) {
  const map = {};
  list.forEach(r => {
    if (!map[r.emoji]) map[r.emoji] = [];
    map[r.emoji].push(r);
  });
  return Object.entries(map);
}

export default function Chat() {
  const { token, user, avatars } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text,     setText]     = useState('');
  const [sending,  setSending]  = useState(false);
  const [file,     setFile]     = useState(null);
  const [filePrev, setFilePrev] = useState(null);
  const [fileKind, setFileKind] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recSecs, setRecSecs] = useState(0);
  const [pickerId, setPickerId] = useState(null);
  const bottomRef = useRef();
  const fileRef   = useRef();
  const recRef    = useRef(null);
  const chunksRef = useRef([]);
  const recTimer  = useRef(null);

  const loadMessages = useCallback(async () => {
    const res  = await fetch(`${API}/messages`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setMessages(data.messages || []);
  }, [token]);

  useEffect(() => {
    loadMessages();
    const ch = supabase.channel('chat')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, loadMessages)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'message_reactions' }, loadMessages)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => () => stopTracks(), []);

  function stopTracks() {
    recRef.current?.stream?.getTracks().forEach(t => t.stop());
    if (recTimer.current) clearInterval(recTimer.current);
  }

  function pickFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setFileKind(f.type.startsWith('video') ? 'video' : f.type.startsWith('audio') ? 'audio' : 'image');
    setFilePrev(URL.createObjectURL(f));
    e.target.value = '';
  }

  function clearFile() {
    setFile(null);
    setFilePrev(null);
    setFileKind(null);
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';
      const rec = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      rec.ondataavailable = ev => { if (ev.data.size) chunksRef.current.push(ev.data); };
      rec.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' });
        if (blob.size < 400) return;
        const voice = new File([blob], rec.mimeType.includes('mp4') ? 'voice.m4a' : 'voice.webm', { type: blob.type });
        setFile(voice);
        setFileKind('audio');
        setFilePrev(URL.createObjectURL(blob));
      };
      recRef.current = rec;
      rec.start();
      setRecording(true);
      setRecSecs(0);
      recTimer.current = setInterval(() => setRecSecs(s => s + 1), 1000);
    } catch (err) {
      console.error('mic error', err);
      alert('Could not access the microphone.');
    }
  }

  function stopRecording() {
    if (recTimer.current) clearInterval(recTimer.current);
    if (recRef.current && recRef.current.state !== 'inactive') recRef.current.stop();
    setRecording(false);
  }

  async function send(e) {
    e?.preventDefault();
    if ((!text.trim() && !file) || sending) return;
    setSending(true);
    const fd = new FormData();
    if (text.trim()) fd.append('text', text.trim());
    if (file) fd.append('file', file);
    await fetch(`${API}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    setText('');
    clearFile();
    setSending(false);
  }

  async function react(messageId, emoji) {
    setPickerId(null);
    setMessages(curr => curr.map(m => {
      if (m.id !== messageId) return m;
      const mine = (m.message_reactions || []).find(r => r.user_id === user.id);
      let next = m.message_reactions || [];
      if (mine && mine.emoji === emoji) next = next.filter(r => r.user_id !== user.id);
      else if (mine) next = next.map(r => r.user_id === user.id ? { ...r, emoji } : r);
      else next = [...next, { id: `tmp-${user.id}`, message_id: messageId, user_id: user.id, username: user.displayName, emoji }];
      return { ...m, message_reactions: next };
    }));
    await fetch(`${API}/messages/${messageId}/react`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji }),
    });
    loadMessages();
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

  const grouped = messages.reduce((acc, msg) => {
    const day = new Date(msg.created_at).toDateString();
    if (!acc[day]) acc[day] = [];
    acc[day].push(msg);
    return acc;
  }, {});

  return (
    <div className="chat-page">
      <div className="chat-body">
        {Object.entries(grouped).map(([day, msgs]) => (
          <div key={day}>
            <div className="chat-day-label">{dayLabel(msgs[0].created_at)}</div>
            {msgs.map(msg => {
              const mine = msg.user_id === user.id;
              const reactions = groupReactions(msg.message_reactions);
              return (
                <div key={msg.id} className={`chat-row ${mine ? 'mine' : 'theirs'}`}>
                  {!mine && (
                    <Avatar userId={msg.user_id} username={msg.username} avatars={avatars} src={msg.avatar_url} size={28} />
                  )}
                  <div className="chat-col">
                    {!mine && <span className="chat-name">{msg.username}</span>}
                    <div
                      className={`chat-bubble ${mine ? 'bubble-mine' : 'bubble-theirs'}`}
                      onDoubleClick={() => react(msg.id, '❤️')}
                    >
                      {msg.media_url && (
                        <div className="chat-media">
                          {msg.media_type === 'audio'
                            ? <audio src={msg.media_url} controls preload="metadata" />
                            : msg.media_type === 'video'
                              ? <video src={msg.media_url} controls playsInline />
                              : <img src={msg.media_url} alt="" />
                          }
                        </div>
                      )}
                      {msg.text && <p className="chat-text">{msg.text}</p>}
                      <span className="chat-time">{fmt(msg.created_at)}</span>
                    </div>
                    <div className="chat-react-row">
                      {reactions.map(([emoji, people]) => (
                        <button
                          key={emoji}
                          type="button"
                          className={`chat-pill ${people.some(p => p.user_id === user.id) ? 'mine-pill' : ''}`}
                          onClick={() => react(msg.id, emoji)}
                        >
                          {emoji} {people.length}
                        </button>
                      ))}
                      <button type="button" className="chat-react-btn" onClick={() => setPickerId(pickerId === msg.id ? null : msg.id)}>☺</button>
                    </div>
                    {pickerId === msg.id && (
                      <div className="chat-emoji-bar">
                        {EMOJIS.map(e => (
                          <button key={e} type="button" onClick={() => react(msg.id, e)}>{e}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  {mine && (
                    <Avatar userId={msg.user_id} username={msg.username} avatars={avatars} src={msg.avatar_url} size={28} />
                  )}
                </div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {filePrev && (
        <div className="chat-img-preview">
          {fileKind === 'audio'
            ? <audio src={filePrev} controls />
            : fileKind === 'video'
              ? <video src={filePrev} />
              : <img src={filePrev} alt="preview" />
          }
          <button type="button" onClick={clearFile}>✕</button>
        </div>
      )}

      {recording && (
        <div className="chat-recording">
          Recording {recSecs}s
          <button type="button" onClick={stopRecording}>Stop</button>
        </div>
      )}

      <form className="chat-input-bar" onSubmit={send}>
        <AvatarPicker size={32} />
        <button type="button" className="chat-attach" onClick={() => fileRef.current.click()} title="Photo or video">📎</button>
        <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={pickFile} />
        <button
          type="button"
          className={`chat-mic ${recording ? 'on' : ''}`}
          onClick={recording ? stopRecording : startRecording}
          title="Voice note"
        >🎤</button>
        <input
          className="chat-input"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Message..."
          autoComplete="off"
        />
        <button className="chat-send" type="submit" disabled={sending || (!text.trim() && !file)}>
          {sending ? '...' : '➤'}
        </button>
      </form>
    </div>
  );
}
