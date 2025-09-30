import "./Footer.css"

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">FoodieExpress</h3>
            <p className="footer-description">
              Mang đến những món ăn ngon nhất từ các nhà hàng uy tín, giao hàng nhanh chóng và an toàn đến tận nơi.
            </p>
            <div className="social-links">
              <a href="#" className="social-link">
                📘 Facebook
              </a>
              <a href="#" className="social-link">
                📷 Instagram
              </a>
              <a href="#" className="social-link">
                🐦 Twitter
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="section-title">Dịch vụ</h4>
            <ul className="footer-links">
              <li>
                <a href="#" className="footer-link">
                  Đặt hàng online
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Giao hàng tận nơi
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Đặt bàn nhà hàng
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Catering
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="section-title">Hỗ trợ</h4>
            <ul className="footer-links">
              <li>
                <a href="#" className="footer-link">
                  Trung tâm trợ giúp
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Chính sách giao hàng
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Chính sách hoàn tiền
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="section-title">Liên hệ</h4>
            <div className="contact-info">
              <p className="contact-item">📞 Hotline: +84778956030</p>
              <p className="contact-item">✉️ Email: trongphuc20704@gmail.com</p>
              <p className="contact-item">📍 Địa chỉ: FPT University</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">© 2025 FoodieExpress. Tất cả quyền được bảo lưu.</p>
          <div className="footer-bottom-links">
            <a href="#" className="bottom-link">
              Điều khoản sử dụng
            </a>
            <a href="#" className="bottom-link">
              Chính sách bảo mật
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
