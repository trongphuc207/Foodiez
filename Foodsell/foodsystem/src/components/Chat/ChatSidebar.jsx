import React, { useEffect, useState } from 'react';
import { chatAPI } from '../../api/chat';
import { useAuth } from '../../hooks/useAuth';

const ChatSidebar = ({ activeId, onSelect }) => {
  const [conversations, setConversations] = useState([]);
  const { user } = useAuth();
  const [q, setQ] = useState('');

  const load = async () => {
    try {
      const res = await chatAPI.getConversations();
      if (res?.success) {
        const uniq = Object.values((res.data || []).reduce((acc, c) => { acc[c.id] = c; return acc; }, {}));
        if (uniq.length) {
          setConversations(uniq);
        } else {
          const role = (user?.role || '').toString().toUpperCase();
          if (role === 'SELLER' || role === 'MERCHANT' || role === 'ADMIN') {
            try {
              const alt = await chatAPI.searchConversations('');
              if (alt?.success) {
                const uniqAlt = Object.values((alt.data || []).reduce((acc, c) => { acc[c.id] = c; return acc; }, {}));
                setConversations(uniqAlt);
              } else {
                setConversations([]);
              }
            } catch {
              setConversations([]);
            }
          } else {
            setConversations([]);
          }
        }
      } else {
        setConversations([]);
      }
    } catch (e) {
      console.warn('Load conversations error:', e.message);
      setConversations([]);
    }
  };

  useEffect(() => {
    load();
    const onAuth = () => load();
    const onFocus = () => load();
    window.addEventListener('authSuccess', onAuth);
    window.addEventListener('authLogout', onAuth);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('authSuccess', onAuth);
      window.removeEventListener('authLogout', onAuth);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  // Ensure active conversation id from URL exists so seller can open it even when list is empty.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cid = Number(params.get('cid'));
    if (cid && conversations.length === 0) {
      setConversations(prev => (prev.some(c => Number(c.id) === cid)
        ? prev
        : [{ id: cid, updatedAt: new Date().toISOString(), title: `#${cid}` }, ...prev]));
    }
  }, [conversations.length]);

  // De-duplicate by id on any list change (keep the one with a proper title)
  useEffect(() => {
    if (!conversations || conversations.length < 2) return;
    const map = new Map();
    for (const c of conversations) {
      const id = Number(c.id);
      const existing = map.get(id);
      if (!existing) {
        map.set(id, c);
      } else {
        const existingIsPlaceholder = (existing.title || '').startsWith('#');
        const currentIsPlaceholder = (c.title || '').startsWith('#');
        if (existingIsPlaceholder && !currentIsPlaceholder) {
          map.set(id, c);
        } else if (existingIsPlaceholder === currentIsPlaceholder) {
          const t1 = new Date(existing.updatedAt || 0).getTime();
          const t2 = new Date(c.updatedAt || 0).getTime();
          if (t2 > t1) map.set(id, c);
        }
      }
    }
    const deduped = Array.from(map.values());
    if (deduped.length !== conversations.length) setConversations(deduped);
  }, [conversations]);

  const search = async () => {
    try {
      const res = await chatAPI.searchConversations(q);
      if (res?.success) {
        const uniq = Object.values((res.data || []).reduce((acc, c) => { acc[c.id] = c; return acc; }, {}));
        setConversations(uniq);
      }
    } catch (e) {
      console.warn('Search conversations error:', e.message);
    }
  };

  const getInitials = (txt) => {
    if (!txt) return '#';
    const parts = txt.trim().split(/\s+/).slice(0, 2);
    return parts.map(p => p[0]).join('').toUpperCase();
  };

  const fmtUpdate = (iso) => {
    const d = new Date(iso || Date.now());
    const hms = d.toLocaleTimeString('vi-VN', { hour12: false });
    const dmy = d.toLocaleDateString('vi-VN');
    return `${hms} ${dmy}`;
  };

  const onKeyDown = (e) => { if (e.key === 'Enter') search(); };

  return (
    <div className="chat-sidebar">
      <div className="chat-sidebar-header"><div className="dot" />Cuộc trò chuyện</div>
      <div className="chat-search">
        <input value={q} onChange={(e)=>setQ(e.target.value)} onKeyDown={onKeyDown} placeholder={'Tìm theo tên hoặc từ khóa'} />
        <button onClick={search}>Tìm</button>
      </div>
      <div className="chat-conv-list">
        {conversations.length === 0 && (
          <div className="chat-empty" style={{padding:'24px 8px'}}>Chưa có cuộc trò chuyện</div>
        )}
        {conversations.map(c => (
          <div
            key={c.id}
            className={`chat-conv-item ${activeId===c.id ? 'active':''}`}
            onClick={() => onSelect(c)}
          >
            <div className="avatar">{getInitials(c.title || `#${c.id}`)}</div>
            <div className="meta">
              <div className="title">{c.title || `#${c.id}`}</div>
              <div className="sub"><span className="tag">Cập nhật</span><span>{fmtUpdate(c.updatedAt)}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChatSidebar;

