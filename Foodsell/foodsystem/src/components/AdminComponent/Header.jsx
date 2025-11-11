import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { authAPI } from "../../api/auth";
import ChangePasswordModal from "../ChangePasswordModal/ChangePasswordModal";
import ProfileView from "../ProfileViewComponent/ProfileView";
import personIcon from "../Assets/person.png";
import "./admin.css";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout, refreshProfile } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showChangePwd, setShowChangePwd] = useState(false);
  const menuRef = useRef(null);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [showMenu]);

  const handleLogout = () => {
    logout();
    // Điều hướng về trang chủ
    navigate("/");
  };

  const handleChangePassword = async (currentPassword, newPassword) => {
    try {
      await authAPI.changePassword(currentPassword, newPassword);
      alert("Đổi mật khẩu thành công");
      setShowChangePwd(false);
    } catch (err) {
      alert(err?.message || "Đổi mật khẩu thất bại");
      throw err; // để modal giữ trạng thái nếu cần
    }
  };

  const openProfile = async () => {
    try {
      await refreshProfile?.();
    } catch { /* ignore */ }
    setShowProfile(true);
    setShowMenu(false);
  };

  return (
    <header className="admin-header-modern">
      <h4 className="header-title">Admin Dashboard</h4>

      <div className="header-actions">
        {/* User Menu */}
        <div className="user-menu-container" ref={menuRef}>
          <button
            className="user-menu-trigger"
            onClick={() => setShowMenu((v) => !v)}
          >
            <img
              src={user?.avatar || personIcon}
              alt="avatar"
              className="user-avatar"
            />
            <span className="user-name">{user?.name || 'Thông tin'}</span>
            <span className="dropdown-arrow">{showMenu ? '▼' : '▶'}</span>
          </button>

          {showMenu && (
            <div className="user-dropdown-menu">
              <div className="dropdown-header">
                <img
                  src={user?.avatar || personIcon}
                  alt="avatar"
                  className="dropdown-avatar"
                />
                <div className="dropdown-user-info">
                  <div className="dropdown-name">{user?.name || 'Admin'}</div>
                  <div className="dropdown-email">{user?.email || 'admin@foodiez.com'}</div>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item" onClick={openProfile}>
                <span className="item-icon">👤</span>
                <span>Xem thông tin</span>
              </button>
              <button
                className="dropdown-item"
                onClick={() => { setShowChangePwd(true); setShowMenu(false); }}
              >
                <span className="item-icon">🔐</span>
                <span>Đổi mật khẩu</span>
              </button>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button className="logout-button" onClick={handleLogout}>
          <span className="logout-icon">🚪</span>
          <span>Logout</span>
        </button>
      </div>

      {/* Overlay xem thông tin tài khoản */}
      {showProfile && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1050 }}>
          <div className="bg-white p-3 rounded" style={{ width: "min(800px, 95vw)" }}>
            <ProfileView onClose={() => setShowProfile(false)} user={user} />
          </div>
        </div>
      )}

      {/* Modal đổi mật khẩu */}
      <ChangePasswordModal
        isOpen={showChangePwd}
        onClose={() => setShowChangePwd(false)}
        onSubmit={handleChangePassword}
      />
    </header>
  );
}
