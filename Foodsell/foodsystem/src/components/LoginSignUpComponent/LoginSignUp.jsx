import React, { useState } from 'react';
import './LoginSignUp.css';
import { authAPI, setAuthToken } from '../../api/auth';
import GoogleAuth from '../GoogleAuth/GoogleAuth';

import user_icon from '../Assets/person.png';
import email_icon from '../Assets/email.png';
import password_icon from '../Assets/password.png';

const LoginSignUp = ({ onClose, defaultMode = 'signup' }) => {
  const [mode, setMode] = useState(defaultMode); // 'signup' | 'login' | 'forgot'
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    birthday: '',
    address: '',
  });
  const [forgotForm, setForgotForm] = useState({
    email: '',
  });
  const [errors, setErrors] = useState({});
  const [forgotErrors, setForgotErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onForgotChange = (e) => {
    const { name, value } = e.target;
    setForgotForm((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (forgotErrors[name]) {
      setForgotErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const err = {};
    
    // Email validation
    if (!form.email.trim()) {
      err.email = 'Email is required';
    } else if (!isValidEmail(form.email)) {
      err.email = 'Email format is invalid';
    }
    
    // Password validation
    if (!form.password) {
      err.password = 'Password is required';
    } else if (form.password.length < 6) {
      err.password = 'Password must be at least 6 characters';
    } else if (form.password.length > 50) {
      err.password = 'Password must be less than 50 characters';
    }
    
    // Full name validation (for signup only)
    if (mode === 'signup') {
      if (!form.fullName.trim()) {
        err.fullName = 'Full name is required';
      } else if (form.fullName.trim().length < 2) {
        err.fullName = 'Full name must be at least 2 characters';
      } else if (form.fullName.trim().length > 100) {
        err.fullName = 'Full name must be less than 100 characters';
      }
    }
    
    return err;
  };
  
  const isValidEmail = (email) => {
    return /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
  };

  const validateForgot = () => {
    const err = {};
    if (!forgotForm.email.trim()) {
      err.email = 'Email is required';
    } else if (!isValidEmail(forgotForm.email)) {
      err.email = 'Email format is invalid';
    }
    return err;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length) return;

    setLoading(true);
    try {
      if (mode === 'signup') {
        const response = await authAPI.register({
          email: form.email,
          password: form.password,
          fullName: form.fullName
        });
        
        setAuthToken(response.token);
        alert('Đăng ký thành công!');
        onClose && onClose();
        window.location.reload(); // Refresh để cập nhật trạng thái đăng nhập
      } else {
        const response = await authAPI.login({
          email: form.email,
          password: form.password
        });
        
        setAuthToken(response.token);
        alert('Đăng nhập thành công!');
        onClose && onClose();
        window.location.reload(); // Refresh để cập nhật trạng thái đăng nhập
      }
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const onForgotSubmit = async (e) => {
    e.preventDefault();
    const err = validateForgot();
    setForgotErrors(err);
    if (Object.keys(err).length) return;

    setLoading(true);
    try {
      await authAPI.forgotPassword(forgotForm.email);
      alert('Link đặt lại mật khẩu đã được gửi đến email của bạn!');
      setMode('login');
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-card">
      {/* nút đóng modal (tuỳ) */}
      {onClose && (
        <button className="auth-close" onClick={onClose} aria-label="Close">×</button>
      )}

      {/* Header */}
      <div className="auth-header">
        <div className="auth-title">
          {mode === 'signup' ? 'Sign Up' : mode === 'forgot' ? 'Forgot Password' : 'Login'}
        </div>
        <div className="auth-underline"></div>
      </div>

      {/* Google OAuth - only show for login and signup */}
      {mode !== 'forgot' && (
        <div className="auth-social">
          <GoogleAuth 
            onSuccess={(data) => {
              console.log('Google login success:', data);
              alert('Đăng nhập Google thành công! Chào mừng ' + data.user.fullName);
              onClose && onClose();
              window.location.reload();
            }}
            onError={(error) => {
              console.error('Google login error:', error);
              alert('Lỗi đăng nhập Google: ' + error.message);
            }}
          />
          <div className="auth-or-line"><span>or</span></div>
        </div>
      )}


      {/* Form */}
      {mode === 'forgot' ? (
        <form onSubmit={onForgotSubmit} noValidate>
          <div className="auth-inputs">
            <div className="auth-forgot-description">
              <p>Enter your email address and we'll send you a link to reset your password.</p>
            </div>
            
            <div className={`auth-input ${forgotErrors.email ? 'is-error' : ''}`}>
              <img src={email_icon} alt="email" />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={forgotForm.email}
                onChange={onForgotChange}
              />
            </div>
            {forgotErrors.email && <div className="auth-field-error">{forgotErrors.email}</div>}
          </div>

          <button type="submit" className="auth-submit">
            Send Reset Link
          </button>
        </form>
      ) : (
        <form onSubmit={onSubmit} noValidate>
        <div className="auth-inputs">
          {mode === 'signup' && (
            <>
              <div className={`auth-input ${errors.fullName ? 'is-error' : ''}`}>
                <span className="auth-icon">👤</span>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={form.fullName}
                  onChange={onChange}
                />
              </div>
              {errors.fullName && <div className="auth-field-error">{errors.fullName}</div>}

              <div className={`auth-input ${errors.username ? 'is-error' : ''}`}>
                <img src={user_icon} alt="user" />
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={form.username}
                  onChange={onChange}
                />
              </div>
              {errors.username && <div className="auth-field-error">{errors.username}</div>}

              <div className={`auth-input ${errors.birthday ? 'is-error' : ''}`}>
                <span className="auth-icon">📅</span>
                <input
                  type="date"
                  name="birthday"
                  value={form.birthday}
                  onChange={onChange}
                />
              </div>
              {errors.birthday && <div className="auth-field-error">{errors.birthday}</div>}

              <div className={`auth-input ${errors.address ? 'is-error' : ''}`}>
                <span className="auth-icon">🏠</span>
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={form.address}
                  onChange={onChange}
                />
              </div>
              {errors.address && <div className="auth-field-error">{errors.address}</div>}
            </>
          )}

          <div className={`auth-input ${errors.email ? 'is-error' : ''}`}>
            <img src={email_icon} alt="email" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={onChange}
            />
          </div>
          {errors.email && <div className="auth-field-error">{errors.email}</div>}

          <div className={`auth-input ${errors.password ? 'is-error' : ''}`}>
            <img src={password_icon} alt="password" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={onChange}
            />
          </div>
          {errors.password && <div className="auth-field-error">{errors.password}</div>}
        </div>

        {mode === 'login' && (
          <div className="auth-forgot">
            Forgot Password? <span onClick={() => setMode('forgot')}>Click Here</span>
          </div>
        )}

        {mode !== 'forgot' && (
          <div className="auth-switch">
            <button
              type="button"
              className={`auth-btn ${mode === 'signup' ? 'is-active' : ''}`}
              onClick={() => setMode('signup')}
            >
              Sign Up
            </button>
            <button
              type="button"
              className={`auth-btn ${mode === 'login' ? 'is-active' : ''}`}
              onClick={() => setMode('login')}
            >
              Login
            </button>
          </div>
        )}

        {mode === 'forgot' && (
          <div className="auth-back">
            <button
              type="button"
              className="auth-back-btn"
              onClick={() => setMode('login')}
            >
              ← Back to Login
            </button>
          </div>
        )}

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? 'Đang xử lý...' : (mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Send Reset Link' : 'Sign in')}
        </button>
      </form>
      )}
    </div>
  );
};

export default LoginSignUp;
