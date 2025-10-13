import { Link } from "react-router-dom";
import "./Footer.css";

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
              <Link to="/facebook" className="social-link">📘 Facebook</Link>
              <Link to="/instagram" className="social-link">📷 Instagram</Link>
              <Link to="/twitter" className="social-link">🐦 Twitter</Link>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="section-title">Dịch vụ</h4>
            <ul className="footer-links">
              <li><Link to="/order" className="footer-link">Đặt hàng online</Link></li>
              <li><Link to="/delivery" className="footer-link">Giao hàng tận nơi</Link></li>
              <li><Link to="/booking" className="footer-link">Đặt bàn nhà hàng</Link></li>
              <li><Link to="/catering" className="footer-link">Catering</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="section-title">Hỗ trợ</h4>
            <ul className="footer-links">
              <li><Link to="/support" className="footer-link">Trung tâm trợ giúp</Link></li>
              <li><Link to="/policy-delivery" className="footer-link">Chính sách giao hàng</Link></li>
              <li><Link to="/policy-refund" className="footer-link">Chính sách hoàn tiền</Link></li>
              <li><Link to="/contact" className="footer-link">Liên hệ</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="section-title">Liên hệ</h4>
            <ul className="footer-links">
              <li><span className="footer-link">📞 Hotline: +84778956030</span></li>
              <li><span className="footer-link">✉️ Email: trongphuc20704@gmail.com</span></li>
              <li><span className="footer-link">📍 Địa chỉ: FPT University</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">© 2025 FoodieExpress. Tất cả quyền được bảo lưu.</p>
          <div className="footer-bottom-links">
            <Link to="/terms" className="bottom-link">Điều khoản sử dụng</Link>
            <Link to="/privacy" className="bottom-link">Chính sách bảo mật</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
