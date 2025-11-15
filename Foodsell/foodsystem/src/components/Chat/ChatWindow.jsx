import React, { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { chatAPI } from '../../api/chat';
import { useAuth } from '../../hooks/useAuth';
import ImageModal from '../ReviewComponent/ImageModal';

const ChatWindow = ({ conversation }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const clientRef = useRef(null);
  const subRef = useRef(null);
  const listRef = useRef(null);
  const fileRef = useRef(null);

  const dedupeMessages = (list) => {
    const map = new Map();
    for (const m of (list || [])) {
      const sid = m.senderId ?? m.sender?.id;
      const key = m.id ?? `${sid}-${m.content || ''}-${m.imageUrl || ''}-${m.createdAt}`;
      if (!map.has(key)) map.set(key, m);
    }
    return Array.from(map.values());
  };

  useEffect(() => {
    if (!conversation) return;
    (async () => {
      try {
        const res = await chatAPI.getMessages(conversation.id);
        if (res?.success) setMessages(dedupeMessages(res.data));
        try {
          await chatAPI.markConversationRead(conversation.id);
          window.dispatchEvent(new CustomEvent('chatRead', { detail: { id: conversation.id } }));
        } catch {}
      } catch (e) {
        console.warn('Load messages error:', e.message);
        setMessages([]);
      }
    })();
  }, [conversation]);

  useEffect(() => {
    const reload = async () => {
      if (!conversation) return;
      try {
        const res = await chatAPI.getMessages(conversation.id);
        if (res?.success) setMessages(dedupeMessages(res.data));
      } catch {}
    };
    window.addEventListener('authSuccess', reload);
    window.addEventListener('focus', reload);
    return () => {
      window.removeEventListener('authSuccess', reload);
      window.removeEventListener('focus', reload);
    };
  }, [conversation]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!conversation) return;
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-chat'),
      reconnectDelay: 3000,
    });
    client.onConnect = () => {
      subRef.current = client.subscribe(`/topic/conversations/${conversation.id}`, (msg) => {
        try {
          const incoming = JSON.parse(msg.body);
          setMessages(prev => {
            const sid = incoming.senderId ?? incoming.sender?.id;
            const exists = prev.some(p => (
              p.id === incoming.id ||
              ((p.content || '') === (incoming.content || '') && (p.imageUrl || '') === (incoming.imageUrl || '') && (p.senderId ?? p.sender?.id) === sid)
            ));
            const next = exists ? prev : [...prev, incoming];
            return dedupeMessages(next);
          });
        } catch {}
      });
    };
    client.activate();
    clientRef.current = client;
    return () => {
      try { subRef.current && subRef.current.unsubscribe(); } catch {}
      try { client.deactivate(); } catch {}
    };
  }, [conversation]);

  const send = async () => {
    if (!text.trim() || !conversation) return;
    const content = text.trim();
    setText('');
    // Optimistic UI
    const tempId = Date.now();
    setMessages(prev => [...prev, { id: tempId, conversationId: conversation.id, senderId: user?.id, content, createdAt: new Date().toISOString() }]);
    try {
      // Persist via REST so message survives reload
      const res = await chatAPI.sendMessage(conversation.id, content);
      if (res?.success && res.data) {
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== tempId);
          return dedupeMessages([...filtered, res.data]);
        });
      }
      // Server will broadcast via STOMP after persisting; no local publish to avoid duplicates
    } catch (e) {
      alert('Gửi tin nhắn thất bại: ' + e.message);
      // Rollback temp message on failure
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  const onPickFile = () => fileRef.current && fileRef.current.click();
  const onFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !conversation) return;
    try {
      const res = await chatAPI.uploadImage(conversation.id, file);
      if (res?.success && res.data) {
        setMessages(prev => [...prev, res.data]);
      }
    } catch (err) {
      alert(`Tải ảnh thất bại: ${err.message}`);
    } finally {
      e.target.value = '';
    }
  };

  const report = async (messageId) => {
    const reason = prompt('Lý do báo cáo (không bắt buộc)') || 'Inappropriate content';
    await chatAPI.reportMessage(messageId, reason);
    alert('Đã gửi báo cáo');
  }

  const fmtTime = (iso) => new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const fmtDate = (iso) => new Date(iso).toLocaleDateString('vi-VN', { weekday:'short', day:'2-digit', month:'2-digit' });

  if (!conversation) return <div className="chat-window"><div className="chat-empty">Chọn một cuộc trò chuyện để bắt đầu</div></div>;

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="title">{conversation.title || `Cuộc trò chuyện #${conversation.id}`}</div>
        <div className="right"><a onClick={()=>window.location.reload()}>Làm mới</a></div>
      </div>
      <div ref={listRef} className="chat-messages">{
        (() => {
          const out = [];
          let lastDate = '';
          (messages||[]).forEach((m) => {
            const sid = m.senderId ?? m.sender?.id;
            const d = fmtDate(m.createdAt);
            if (d !== lastDate) {
              out.push(<div key={`d-${d}-${m.id}`} className="date-sep">{d}</div>);
              lastDate = d;
            }
            const resolveImageUrl = (u) => {
              if (!u) return u;
              return /^https?:\/\//i.test(u) ? u : `http://localhost:8080${u.startsWith('/') ? '' : '/'}${u}`;
            };
            const hasImage = !!m.imageUrl;
            const onlyImage = hasImage && (!m.content || !m.content.trim());
            out.push(
              <div key={m.id} className={`chat-message ${sid===user?.id? 'mine':'other'} ${hasImage ? 'has-image' : ''} ${onlyImage ? 'only-image' : ''}`}>
                {hasImage ? (
                  <div className="image-card">
                    <img 
                      className="chat-image" 
                      src={resolveImageUrl(m.imageUrl)} 
                      alt="Ảnh"
                      onClick={() => setSelectedImage(resolveImageUrl(m.imageUrl))}
                      style={{ cursor: 'pointer' }}
                    />
                    {m.content ? <div className="image-caption">{m.content}</div> : null}
                    <div className="chat-tools">
                      <span className="time">{fmtTime(m.createdAt)}</span>
                      <span className="report-link" onClick={()=>report(m.id)}>Báo cáo</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>{m.content}</div>
                    <div className="chat-tools">
                      <span className="time">{fmtTime(m.createdAt)}</span>
                      <span className="report-link" onClick={()=>report(m.id)}>Báo cáo</span>
                    </div>
                  </>
                )}
              </div>
            );
          });
          return out;
        })()
      }</div>
      <div className="chat-input">
        <button type="button" onClick={onPickFile} title="Đính kèm ảnh">📎</button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileChange} />
        <textarea rows={1} value={text} onChange={(e)=>setText(e.target.value)} placeholder={'Nhập tin nhắn...'} onKeyDown={(e)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(); } }} />
        <button onClick={send} disabled={!text.trim()}>Gửi</button>
      </div>
      
      {selectedImage && (
        <ImageModal 
          imageUrl={selectedImage} 
          onClose={() => setSelectedImage(null)} 
        />
      )}
    </div>
  );
}

export default ChatWindow;