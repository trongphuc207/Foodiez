import React, { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { chatAPI } from '../../api/chat';
import { useAuth } from '../../hooks/useAuth';

const ChatWindow = ({ conversation }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const clientRef = useRef(null);
  const subRef = useRef(null);
  const listRef = useRef(null);

  const dedupeMessages = (list) => {
    const map = new Map();
    for (const m of (list || [])) {
      const sid = m.senderId ?? m.sender?.id;
      const key = m.id ?? `${sid}-${m.content}-${m.createdAt}`;
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
        if (res?.success) setMessages(res.data);
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
            const exists = prev.some(p => (p.id === incoming.id) || (p.content === incoming.content && (p.senderId ?? p.sender?.id) === sid));
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

  const send = () => {
    if (!text.trim() || !conversation || !clientRef.current?.connected) return;
    const payload = { conversationId: conversation.id, senderId: user?.id, content: text.trim() };
    setMessages(prev => [...prev, { id: Date.now(), conversationId: conversation.id, senderId: user?.id, content: payload.content, createdAt: new Date().toISOString() }]);
    clientRef.current.publish({ destination: '/app/chat.sendMessage', body: JSON.stringify(payload)});
    setText('');
  };

  const report = async (messageId) => {
    const reason = prompt('Lý do báo cáo (không bắt buộc)') || 'Inappropriate content';
    await chatAPI.reportMessage(messageId, reason);
    alert('Đã gửi báo cáo');
  }

  const fmtTime = (iso) => new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const fmtDate = (iso) => new Date(iso).toLocaleDateString('vi-VN', { weekday:'short', day:'2-digit', month:'2-digit' });

  if (!conversation) return <div className="chat-window"><div className="chat-empty">{'Chọn một cuộc trò chuyện để bắt đầu'}</div></div>;

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="title">{conversation.title || `Cuộc trò chuyện #${conversation.id}`}</div>
        <div className="right"><a onClick={()=>window.location.reload()}>{'Làm mới'}</a></div>
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
            out.push(
              <div key={m.id} className={`chat-message ${sid===user?.id? 'mine':'other'}`}>
                <div>{m.content}</div>
                <div className="chat-tools">
                  <span className="time">{fmtTime(m.createdAt)}</span>
                  <span className="report-link" onClick={()=>report(m.id)}>{'Báo cáo'}</span>
                </div>
              </div>
            );
          });
          return out;
        })()
      }</div>
      <div className="chat-input">
        <textarea rows={1} value={text} onChange={(e)=>setText(e.target.value)} placeholder={'Nhập tin nhắn...'} onKeyDown={(e)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(); } }} />
        <button onClick={send} disabled={!text.trim()}>{'Gửi'}</button>
      </div>
    </div>
  );
}

export default ChatWindow;
