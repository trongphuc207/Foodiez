import React, { useState } from 'react';
import './LoginSignUp.css';
// eslint-disable-next-line no-unused-vars
import { useAuth } from '../../hooks/useAuth'; // Custom hook for auth context
import { useLogin, useRegister, useForgotPassword } from '../../hooks/useAuthQueries'; // React Query hooks
import { useForm } from '../../hooks/useCommon'; // Custom form hook
import GoogleAuth from '../GoogleAuth/GoogleAuth';

import email_icon from '../Assets/email.png';
import password_icon from '../Assets/password.png';

const LoginSignUp = ({ onClose, defaultMode = 'signup' }) => {
  const [mode, setMode] = useState(defaultMode); // 'signup' | 'login' | 'forgot'
  // eslint-disable-next-line no-unused-vars
  const { logout } = useAuth(); // For potential logout functionality
  
  // Helper function for email validation
  const isValidEmail = (email) => {
    return /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
  };

  // Validation functions - moved before useForm calls
  const validateLogin = (values) => {
    const errors = {};
    if (!values.email.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(values.email)) {
      errors.email = 'Email format is invalid';
    }
    if (!values.password) {
      errors.password = 'Password is required';
    }
    return errors;
  };

  const validateSignup = (values) => {
    const errors = {};
    if (!values.fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (values.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    } else if (values.fullName.trim().length > 100) {
      errors.fullName = 'Full name must be less than 100 characters';
    }
    if (!values.email.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(values.email)) {
      errors.email = 'Email format is invalid';
    }
    if (!values.password) {
      errors.password = 'Password is required';
    } else if (values.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (values.password.length > 50) {
      errors.password = 'Password must be less than 50 characters';
    }
    return errors;
  };

  const validateForgot = (values) => {
    const errors = {};
    if (!values.email.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(values.email)) {
      errors.email = 'Email format is invalid';
    }
    return errors;
  };
  
  // React Query mutations
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const forgotPasswordMutation = useForgotPassword();
  
  // Form handling using custom useForm hook
  const loginForm = useForm({
    email: '',
    password: '',
  }, validateLogin);
  
  const signupForm = useForm({
    fullName: '',
    email: '',
    password: '',
  }, validateSignup);
  
  const forgotForm = useForm({
    email: '',
  }, validateForgot);

  // Helper to get current form's values/errors/handlers
  const getCurrentForm = () => {
    if (mode === 'signup') return signupForm;
    if (mode === 'forgot') return forgotForm;
    return loginForm;
  };

  // Submission handlers
  const onSubmit = async (values) => {
    try {
      if (mode === 'signup') {
        const result = await registerMutation.mutateAsync(values);
        alert('Đăng ký thành công!');
        // Dispatch event để notify useAuth hook
        window.dispatchEvent(new CustomEvent('authSuccess', { detail: result }));
        onClose && onClose();
        // Don't navigate, let the header update automatically
      } else {
        const result = await loginMutation.mutateAsync(values);
        alert('Đăng nhập thành công!');
        // Dispatch event để notify useAuth hook
        window.dispatchEvent(new CustomEvent('authSuccess', { detail: result }));
        onClose && onClose();
        // Don't navigate, let the header update automatically
      }
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  const onForgotSubmit = async (values) => {
    try {
      await forgotPasswordMutation.mutateAsync(values.email);
      alert('Link đặt lại mật khẩu đã được gửi đến email của bạn!');
      setMode('login');
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  const isLoading = loginMutation.isLoading || registerMutation.isLoading || forgotPasswordMutation.isLoading;

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

      {/* Google OAuth */}
      {mode !== 'forgot' && (
        <div className="auth-social">
          <GoogleAuth 
            onSuccess={(data) => {
              console.log('🎉 Google login success:', data);
              alert('Đăng nhập Google thành công! Chào mừng ' + data.data.fullName);
              // Dispatch event để notify useAuth hook
              window.dispatchEvent(new CustomEvent('authSuccess', { detail: data }));
              onClose && onClose();
              // Don't navigate, let the header update automatically
            }}
            onError={(error) => {
              console.error('❌ Google login error:', error);
              alert('Lỗi đăng nhập Google: ' + error.message);
            }}
          />
          <div className="auth-or-line"><span>or</span></div>
        </div>
      )}

      {/* Form */}
      {mode === 'forgot' ? (
        <form onSubmit={forgotForm.handleSubmit(onForgotSubmit)} noValidate>
          <div className="auth-inputs">
            <div className="auth-forgot-description">
              <p>Enter your email address and we'll send you a link to reset your password.</p>
            </div>
            
            <div className={`auth-input ${forgotForm.errors.email ? 'is-error' : ''}`}>
              <img src={email_icon} alt="email" />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={forgotForm.values.email}
                onChange={forgotForm.handleChange}
                onBlur={forgotForm.handleBlur}
              />
            </div>
            {forgotForm.errors.email && <div className="auth-field-error">{forgotForm.errors.email}</div>}
          </div>

          <button type="submit" className="auth-submit" disabled={isLoading}>
            {isLoading ? 'Đang gửi...' : 'Send Reset Link'}
          </button>
        </form>
      ) : (
        <form onSubmit={getCurrentForm().handleSubmit(onSubmit)} noValidate>
        <div className="auth-inputs">
          {mode === 'signup' && (
            <>
              <div className={`auth-input ${signupForm.errors.fullName ? 'is-error' : ''}`}>
                <span className="auth-icon">👤</span>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={signupForm.values.fullName}
                  onChange={signupForm.handleChange}
                  onBlur={signupForm.handleBlur}
                />
              </div>
              {signupForm.errors.fullName && <div className="auth-field-error">{signupForm.errors.fullName}</div>}
            </>
          )}

          <div className={`auth-input ${getCurrentForm().errors.email ? 'is-error' : ''}`}>
            <img src={email_icon} alt="email" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={getCurrentForm().values.email}
              onChange={getCurrentForm().handleChange}
              onBlur={getCurrentForm().handleBlur}
            />
          </div>
          {getCurrentForm().errors.email && <div className="auth-field-error">{getCurrentForm().errors.email}</div>}

          {mode !== 'forgot' && (
            <>
              <div className={`auth-input ${getCurrentForm().errors.password ? 'is-error' : ''}`}>
                <img src={password_icon} alt="password" />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={getCurrentForm().values.password}
                  onChange={getCurrentForm().handleChange}
                  onBlur={getCurrentForm().handleBlur}
                />
              </div>
              {getCurrentForm().errors.password && <div className="auth-field-error">{getCurrentForm().errors.password}</div>}
            </>
          )}
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

        <button type="submit" className="auth-submit" disabled={isLoading}>
          {isLoading ? 'Đang xử lý...' : (mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Send Reset Link' : 'Sign in')}
        </button>
      </form>
      )}
    </div>
  );
};

export default LoginSignUp;