import React, { useState } from 'react';
import './LoginSignUp.css';

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
    if (mode === 'signup' && !form.fullName.trim()) err.fullName = 'Full name is required';
    if (mode === 'signup' && !form.username.trim()) err.username = 'Username is required';
    if (!form.email.trim()) err.email = 'Email is required';
    if (!form.password || form.password.length < 6) err.password = 'Min 6 characters';
    if (mode === 'signup' && !form.birthday) err.birthday = 'Birthday is required';
    if (mode === 'signup' && !form.address.trim()) err.address = 'Address is required';
    return err;
  };

  const validateForgot = () => {
    const err = {};
    if (!forgotForm.email.trim()) err.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(forgotForm.email)) err.email = 'Email is invalid';
    return err;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length) return;

    if (mode === 'signup') {
      console.log('Signup payload:', form);
    } else {
      console.log('Login payload:', { email: form.email, password: form.password });
    }
  };

  const onForgotSubmit = (e) => {
    e.preventDefault();
    const err = validateForgot();
    setForgotErrors(err);
    if (Object.keys(err).length) return;

    console.log('Forgot password payload:', forgotForm);
    alert('Password reset link has been sent to your email!');
    setMode('login');
  };

  const handleGoogleLogin = () => {
    alert('Mock Google login: chưa tích hợp API.');
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

      {/* Social login - only show for login and signup */}
      {mode !== 'forgot' && (
        <div className="auth-social">
          <button type="button" className="auth-google-btn" onClick={handleGoogleLogin}>
            <svg className="auth-g-icon" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.1 6.3 28.8 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5 44.5 36.3 44.5 25c0-1.5-.1-3-.4-4.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.8 16.1 19 13 24 13c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.1 6.3 28.8 4.5 24 4.5 16 4.5 9.1 9.2 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 45.5c5.9 0 11.1-2.3 14.9-6l-6.9-5.6c-2.1 1.5-4.8 2.4-8 2.4-5.3 0-9.7-3.4-11.3-8l-6.6 5.1C9.1 40.8 16 45.5 24 45.5z"/>
              <path fill="#1976D2" d="M43.6 20.5H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.6l6.9 5.6c4-3.7 6.6-9.1 6.6-15.7 0-1.5-.1-3-.4-4.5z"/>
            </svg>
            Continue with Google
          </button>
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

        <button type="submit" className="auth-submit">
          {mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Send Reset Link' : 'Sign in'}
        </button>
      </form>
      )}
    </div>
  );
};

export default LoginSignUp;
