import React, { useEffect, useState } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import { useAuth } from '../../hooks/useAuth';
import './Chat.css';

const ChatPage = () => {
  const [active, setActive] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cid = params.get('cid');
    if (cid) setActive({ id: Number(cid) });
  }, []);

  if (!isAuthenticated) {
    return (
      <div style={{ padding: 20 }}>
        <h3>B?n c?n dang nh?p d? s? d?ng chat</h3>
        <p>{'Hãy bấm nút Đăng nhập ở góc trên bên phải.'}</p>
      </div>
    );
  }

  return (
    <div className="chat-layout">
      <ChatSidebar activeId={active?.id} onSelect={setActive} />
      <ChatWindow conversation={active} />
    </div>
  );
};

export default ChatPage;


