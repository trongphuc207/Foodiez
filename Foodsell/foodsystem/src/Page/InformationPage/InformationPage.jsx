import React from 'react';
import './InformationPage.css';

const InformationPage = () => {
  return (
    <div className="information-page">
      <div className="information-container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Chào mừng đến với FoodieExpress</h1>
            <p className="hero-subtitle">
              Nền tảng giao đồ ăn trực tuyến hiện đại, kết nối khách hàng với các nhà hàng và shipper
            </p>
          </div>
        </section>

        {/* About Section */}
        <section className="about-section">
          <div className="section-content">
            <h2 className="section-title">Về FoodieExpress</h2>
            <div className="about-text">
              <p>
                <strong>FoodieExpress</strong> là một ứng dụng giao đồ ăn toàn diện được thiết kế để mang đến 
                trải nghiệm mua sắm và giao hàng thực phẩm tốt nhất cho mọi người. Chúng tôi kết nối khách hàng 
                với hàng trăm nhà hàng và cửa hàng thực phẩm địa phương, đồng thời cung cấp dịch vụ giao hàng 
                nhanh chóng và đáng tin cậy.
              </p>
              <p>
                Với giao diện thân thiện, dễ sử dụng và công nghệ tiên tiến, FoodieExpress giúp bạn dễ dàng 
                tìm kiếm, đặt hàng và nhận món ăn yêu thích chỉ với vài cú click chuột.
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="section-content">
            <h2 className="section-title">Tính năng nổi bật</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🔍</div>
                <h3 className="feature-title">Tìm kiếm thông minh</h3>
                <p className="feature-description">
                  Tìm kiếm sản phẩm dễ dàng với bộ lọc theo danh mục, giá cả, và cửa hàng. 
                  Hỗ trợ tìm kiếm bằng AI chatbot để có trải nghiệm tốt hơn.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🛒</div>
                <h3 className="feature-title">Giỏ hàng thông minh</h3>
                <p className="feature-description">
                  Quản lý giỏ hàng dễ dàng với khả năng lưu trữ và khôi phục. 
                  Thêm, sửa, xóa sản phẩm một cách nhanh chóng và tiện lợi.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">💳</div>
                <h3 className="feature-title">Thanh toán an toàn</h3>
                <p className="feature-description">
                  Tích hợp PayOS để thanh toán trực tuyến an toàn và nhanh chóng. 
                  Hỗ trợ nhiều phương thức thanh toán khác nhau.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📦</div>
                <h3 className="feature-title">Theo dõi đơn hàng</h3>
                <p className="feature-description">
                  Theo dõi trạng thái đơn hàng real-time từ khi đặt hàng đến khi giao hàng. 
                  Nhận thông báo cập nhật tự động.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">⭐</div>
                <h3 className="feature-title">Đánh giá và Review</h3>
                <p className="feature-description">
                  Chia sẻ trải nghiệm của bạn với hệ thống đánh giá và review chi tiết. 
                  Giúp cộng đồng lựa chọn món ăn tốt nhất.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">💬</div>
                <h3 className="feature-title">Chat trực tuyến</h3>
                <p className="feature-description">
                  Chat trực tiếp với cửa hàng và shipper để được hỗ trợ nhanh chóng. 
                  AI Chatbot sẵn sàng trả lời mọi câu hỏi của bạn 24/7.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🎁</div>
                <h3 className="feature-title">Voucher và Khuyến mãi</h3>
                <p className="feature-description">
                  Nhận nhiều voucher và mã giảm giá hấp dẫn. 
                  Áp dụng ngay khi thanh toán để tiết kiệm chi phí.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🤖</div>
                <h3 className="feature-title">AI Chatbot</h3>
                <p className="feature-description">
                  Trợ lý AI thông minh giúp tìm kiếm sản phẩm, tư vấn mua hàng, 
                  và trả lời các câu hỏi về dịch vụ một cách nhanh chóng.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* For Different Users Section */}
        <section className="users-section">
          <div className="section-content">
            <h2 className="section-title">Dành cho mọi người</h2>
            <div className="users-grid">
              <div className="user-card">
                <div className="user-icon">👤</div>
                <h3 className="user-title">Khách hàng</h3>
                <ul className="user-features">
                  <li>Đặt món ăn yêu thích dễ dàng</li>
                  <li>Theo dõi đơn hàng real-time</li>
                  <li>Đánh giá và chia sẻ trải nghiệm</li>
                  <li>Quản lý địa chỉ giao hàng</li>
                  <li>Lưu sản phẩm yêu thích</li>
                </ul>
              </div>

              <div className="user-card">
                <div className="user-icon">🏪</div>
                <h3 className="user-title">Nhà hàng / Seller</h3>
                <ul className="user-features">
                  <li>Quản lý sản phẩm và menu</li>
                  <li>Dashboard thống kê doanh thu</li>
                  <li>Quản lý đơn hàng hiệu quả</li>
                  <li>Theo dõi khách hàng và đánh giá</li>
                  <li>Tạo và quản lý voucher</li>
                </ul>
              </div>

              <div className="user-card">
                <div className="user-icon">🚚</div>
                <h3 className="user-title">Shipper</h3>
                <ul className="user-features">
                  <li>Nhận và quản lý đơn giao hàng</li>
                  <li>Theo dõi thu nhập</li>
                  <li>Tối ưu hóa tuyến đường</li>
                  <li>Cập nhật trạng thái giao hàng</li>
                  <li>Chat với khách hàng</li>
                </ul>
              </div>

              <div className="user-card">
                <div className="user-icon">👨‍💼</div>
                <h3 className="user-title">Quản trị viên</h3>
                <ul className="user-features">
                  <li>Quản lý toàn bộ hệ thống</li>
                  <li>Duyệt đăng ký cửa hàng</li>
                  <li>Quản lý người dùng và quyền</li>
                  <li>Xem báo cáo và thống kê</li>
                  <li>Quản lý voucher hệ thống</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="technology-section">
          <div className="section-content">
            <h2 className="section-title">Công nghệ hiện đại</h2>
            <div className="tech-content">
              <p>
                FoodieExpress được xây dựng với các công nghệ tiên tiến nhất để đảm bảo hiệu suất, 
                bảo mật và trải nghiệm người dùng tốt nhất:
              </p>
              <div className="tech-list">
                <div className="tech-item">
                  <strong>Frontend:</strong> React.js, Bootstrap, React Query
                </div>
                <div className="tech-item">
                  <strong>Backend:</strong> Spring Boot, Java 21, Spring Security
                </div>
                <div className="tech-item">
                  <strong>Database:</strong> SQL Server
                </div>
                <div className="tech-item">
                  <strong>Real-time:</strong> WebSocket, STOMP Protocol
                </div>
                <div className="tech-item">
                  <strong>AI:</strong> Google Gemini AI
                </div>
                <div className="tech-item">
                  <strong>Payment:</strong> PayOS Integration
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="contact-section">
          <div className="section-content">
            <h2 className="section-title">Liên hệ với chúng tôi</h2>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <span>Hotline: <a href="tel:0978126731">0978126731</a></span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📧</span>
                <span>Email: support@foodieexpress.com</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">💬</span>
                <span>Chat trực tuyến: Sử dụng chatbot AI hoặc chat với cửa hàng</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-content">
            <h2 className="cta-title">Sẵn sàng bắt đầu?</h2>
            <p className="cta-description">
              Đăng ký ngay để trải nghiệm dịch vụ giao đồ ăn tốt nhất!
            </p>
            <div className="cta-buttons">
              <a href="/products" className="cta-button primary">
                Đặt hàng ngay
              </a>
              <a href="/shops/register" className="cta-button secondary">
                Đăng ký cửa hàng
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default InformationPage;

