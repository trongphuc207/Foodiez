import React, { useState, useRef, useEffect } from 'react';
import { geminiAPI } from '../../api/gemini';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../hooks/useAuth';
import './GeminiChatbot.css';

const GeminiChatbot = () => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Xin chào! Tôi là chatbot hỗ trợ mua bán sản phẩm. Tôi có thể giúp bạn tìm kiếm sản phẩm, tư vấn về cửa hàng, và trả lời các câu hỏi về mua bán. Bạn cần hỗ trợ gì?',
      sender: 'bot',
      timestamp: new Date(),
      products: null
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await geminiAPI.chat(userMessage.text);
      
      if (response.success && response.data) {
        const responseText = response.data.response || 'Xin lỗi, tôi không thể trả lời câu hỏi này.';
        
        // Parse products from response
        const products = parseProductsFromResponse(responseText);
        
        const botMessage = {
          id: Date.now() + 1,
          text: responseText,
          sender: 'bot',
          timestamp: new Date(),
          products: products
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(response.message || 'Không thể nhận phản hồi từ chatbot');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.',
        sender: 'bot',
        timestamp: new Date(),
        products: null
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const parseProductsFromResponse = (text) => {
    try {
      const lines = text.split('\n');
      const products = [];
      let inProductList = false;
      
      for (const line of lines) {
        if (line.trim() === 'PRODUCT_LIST_START') {
          inProductList = true;
          continue;
        }
        if (line.trim() === 'PRODUCT_LIST_END') {
          break;
        }
        if (inProductList && line.startsWith('PRODUCT|')) {
          const parts = line.split('|');
          if (parts.length >= 4) {
            products.push({
              id: parseInt(parts[1]),
              name: parts[2],
              price: parseFloat(parts[3]),
              description: parts[4] || '',
              imageUrl: parts[5] || '',
              shopName: parts[6] || '',
              shopAddress: parts[7] || '',
              shopRating: parts[8] || ''
            });
          }
        }
      }
      
      return products.length > 0 ? products : null;
    } catch (error) {
      console.error('Error parsing products:', error);
      return null;
    }
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
      return;
    }

    const cartProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageUrl || "/placeholder.svg",
      description: product.description
    };

    addToCart(cartProduct);
    alert(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

  return (
    <>
      {/* Chat Button */}
      <button 
        className={`gemini-chat-button ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Mở chatbot"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="gemini-chat-window">
          <div className="gemini-chat-header">
            <div className="gemini-chat-header-info">
              <div className="gemini-chat-avatar">🤖</div>
              <div>
                <h3>Chatbot Hỗ Trợ</h3>
                <span className="gemini-chat-status">Đang hoạt động</span>
              </div>
            </div>
            <button 
              className="gemini-chat-minimize"
              onClick={() => setIsOpen(false)}
              aria-label="Thu nhỏ chatbot"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>

          <div className="gemini-chat-messages">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`gemini-message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
              >
                <div className="gemini-message-content">
                  <p>{message.text}</p>
                  {message.products && message.products.length > 0 && (
                    <div className="gemini-product-list">
                      {message.products.map((product, index) => (
                        <div key={product.id} className="gemini-product-item">
                          <div className="gemini-product-header">
                            <span className="gemini-product-number">{index + 1}</span>
                            <h4 className="gemini-product-title">{product.name}</h4>
                          </div>
                          <div className="gemini-product-info">
                            <div className="gemini-product-price-row">
                              <span className="gemini-product-price">{product.price.toLocaleString('vi-VN')} VNĐ</span>
                              {product.shopRating && (
                                <span className="gemini-product-rating">⭐ {product.shopRating}/5</span>
                              )}
                            </div>
                            {product.shopName && (
                              <div className="gemini-product-shop">
                                <span className="gemini-shop-label">Cửa hàng:</span>
                                <span className="gemini-shop-name">{product.shopName}</span>
                              </div>
                            )}
                            {product.shopAddress && (
                              <div className="gemini-product-address">
                                <span className="gemini-address-icon">📍</span>
                                <span>{product.shopAddress}</span>
                              </div>
                            )}
                            {product.description && (
                              <p className="gemini-product-description">{product.description}</p>
                            )}
                          </div>
                          <button
                            className="gemini-add-to-cart-btn"
                            onClick={() => handleAddToCart(product)}
                          >
                            Thêm vào giỏ
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <span className="gemini-message-time">{formatTime(message.timestamp)}</span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="gemini-message bot-message">
                <div className="gemini-message-content">
                  <div className="gemini-typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="gemini-chat-input-container">
            <input
              ref={inputRef}
              type="text"
              className="gemini-chat-input"
              placeholder="Nhập câu hỏi của bạn..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <button
              className="gemini-chat-send-button"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default GeminiChatbot;

