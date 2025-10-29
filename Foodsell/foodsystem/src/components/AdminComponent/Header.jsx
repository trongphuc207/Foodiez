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
    <header className="admin-header d-flex justify-content-between align-items-center p-3">
      <h4 className="m-0">Admin Dashboard</h4>

      <div className="d-flex align-items-center gap-2">
        {/* Nút Thông tin với icon mặt người */}
        <div className="position-relative" ref={menuRef}>
          <button
            className="btn btn-light btn-sm d-flex align-items-center gap-2"
            onClick={() => setShowMenu((v) => !v)}
          >
            <img
              src={user?.avatar || personIcon}
              alt="avatar"
              style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover" }}
            />
            <span>Thông tin</span>
          </button>

          {showMenu && (
            <div
              className="card shadow"
              style={{ position: "absolute", right: 0, top: "110%", minWidth: 200, zIndex: 1000 }}
            >
              <div className="list-group list-group-flush">
                <button className="list-group-item list-group-item-action" onClick={openProfile}>
                  Xem thông tin
                </button>
                <button
                  className="list-group-item list-group-item-action"
                  onClick={() => { setShowChangePwd(true); setShowMenu(false); }}
                >
                  Đổi mật khẩu
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Logout */}
        <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Logout</button>
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
