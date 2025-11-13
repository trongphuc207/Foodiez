import React, { useEffect, useMemo, useState } from 'react';
import { chatAPI } from '../../api/chat';
import './ChatManagement.css';

const emptyState = {
  loading: false,
  data: [],
  error: null,
};

const ChatManagement = () => {
  const [logs, setLogs] = useState([]);
  const [query, setQuery] = useState('');
  const [state, setState] = useState(emptyState);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const loadLogs = async (searchText = '') => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await chatAPI.adminLogs(searchText);
      if (res?.success) {
        const data = Array.isArray(res.data) ? res.data : [];
        setLogs(data);
        setState({ loading: false, data, error: null });
      } else {
        throw new Error(res?.message || 'Không thể tải chat logs');
      }
    } catch (err) {
      setState({ loading: false, data: [], error: err.message });
      setLogs([]);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [refreshToken]);

  const onSearch = (e) => {
    e?.preventDefault?.();
    loadLogs(query.trim());
  };

  const uniqueConversations = useMemo(() => {
    const map = new Map();
    logs.forEach((m) => {
      const convId = Number(m?.conversationId);
      if (!convId) return;
      if (!map.has(convId)) {
        map.set(convId, {
          id: convId,
          updatedAt: m?.createdAt,
          messages: 1,
        });
      } else {
        const current = map.get(convId);
        current.messages += 1;
        if (m?.createdAt && (!current.updatedAt || new Date(m.createdAt) > new Date(current.updatedAt))) {
          current.updatedAt = m.createdAt;
        }
      }
    });
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
    );
  }, [logs]);

  const messagesOfSelectedConversation = useMemo(() => {
    if (!selectedConversation) return [];
    return logs
      .filter((m) => {
        return Number(m?.conversationId) === selectedConversation;
      })
      .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  }, [logs, selectedConversation]);

  const handleDeleteConversation = async (conversationId) => {
    if (!conversationId) return;
    const confirm = window.confirm(`Bạn có chắc muốn xóa hoàn toàn hội thoại #${conversationId}?`);
    if (!confirm) return;
    try {
      await chatAPI.adminDeleteConversation(conversationId);
      alert('Đã xóa hội thoại');
      setSelectedConversation(null);
      setRefreshToken((x) => x + 1);
    } catch (err) {
      alert('Không thể xóa hội thoại: ' + err.message);
    }
  };

  const formatDateTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString('vi-VN');
  };

  return (
    <div className="chat-management">
      <div className="chat-management-header">
        <div>
          <h2>Giám sát Chat</h2>
          <p>Admin có thể xem lịch sử tin nhắn và xóa các hội thoại vi phạm.</p>
        </div>
        <button className="refresh-btn" onClick={() => setRefreshToken((x) => x + 1)}>
          Làm mới
        </button>
      </div>

      <form className="chat-management-search" onSubmit={onSearch}>
        <input
          type="text"
          placeholder="Tìm theo nội dung, email hoặc từ khóa..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Tìm</button>
      </form>

      {state.error && (
        <div className="chat-management-error">
          <span>{state.error}</span>
        </div>
      )}

      <div className="chat-management-body">
        <div className="conversation-list">
          <div className="list-header">
            <span>Hội thoại</span>
            <span>Tin nhắn</span>
            <span>Cập nhật</span>
            <span />
          </div>
          {state.loading && <div className="conversation-empty">Đang tải...</div>}
          {!state.loading && uniqueConversations.length === 0 && (
            <div className="conversation-empty">Không có dữ liệu</div>
          )}
          {uniqueConversations.map((conv) => (
            <div
              key={conv.id}
              className={`conversation-item ${selectedConversation === conv.id ? 'active' : ''}`}
              onClick={() => setSelectedConversation(conv.id)}
            >
              <span className="conversation-id">#{conv.id}</span>
              <span>{conv.messages}</span>
              <span>{formatDateTime(conv.updatedAt)}</span>
              <button
                type="button"
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteConversation(conv.id);
                }}
              >
                Xóa
              </button>
            </div>
          ))}
        </div>

        <div className="conversation-detail">
          {selectedConversation ? (
            <>
              <div className="detail-header">
                <h3>Hội thoại #{selectedConversation}</h3>
                <button onClick={() => handleDeleteConversation(selectedConversation)}>Xóa hội thoại</button>
              </div>
              <div className="message-list">
                {messagesOfSelectedConversation.length === 0 ? (
                  <div className="message-empty">Không có tin nhắn trong hội thoại này.</div>
                ) : (
                  messagesOfSelectedConversation.map((m) => (
                    <div key={m.id} className="message-item">
                      <div className="message-meta">
                        <span className="message-id">#{m.id}</span>
                        <span className={`message-reported ${m.reported ? 'flagged' : ''}`}>
                          {m.reported ? 'ĐÃ BÁO CÁO' : ''}
                        </span>
                        <span>{formatDateTime(m.createdAt)}</span>
                      </div>
                      <div className="message-content">
                        <div>
                          <strong>Người gửi:</strong>{' '}
                          {m?.senderName || m?.senderEmail || (m?.senderId ? `User #${m.senderId}` : 'Không rõ')}
                        </div>
                        <div>
                          <strong>Nội dung:</strong> {m.content || (m.imageUrl ? '[Hình ảnh]' : '(Trống)')}
                        </div>
                        {m.imageUrl && (
                          <div>
                            <a
                              href={
                                /^https?:\/\//i.test(m.imageUrl)
                                  ? m.imageUrl
                                  : `http://localhost:8080${m.imageUrl.startsWith('/') ? '' : '/'}${m.imageUrl}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Xem hình ảnh
                            </a>
                          </div>
                        )}
                      </div>
                      {m.reportReason && (
                        <div className="message-reason">
                          <strong>Lý do báo cáo:</strong> {m.reportReason}
                          {m.reportCreatedAt ? (
                            <span style={{ marginLeft: 8, color: '#6c757d' }}>
                              ({formatDateTime(m.reportCreatedAt)})
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="conversation-placeholder">Chọn một hội thoại để xem chi tiết.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatManagement;

