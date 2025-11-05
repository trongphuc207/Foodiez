import React, { useState } from 'react';
import './LoginSignUp.css';
// eslint-disable-next-line no-unused-vars
import { useAuth } from '../../hooks/useAuth'; // Custom hook for auth context
import { useLogin, useRegister, useForgotPassword, useVerifyOTP, useSendOTP } from '../../hooks/useAuthQueries'; // React Query hooks
import { useForm } from '../../hooks/useCommon'; // Custom form hook
import GoogleAuth from '../GoogleAuth/GoogleAuth';
import BannedAccountModal from './BannedAccountModal';
import BannedShopModal from './BannedShopModal';

import email_icon from '../Assets/email.png';
import password_icon from '../Assets/password.png';

const LoginSignUp = ({ onClose, defaultMode = 'signup' }) => {
  const [mode, setMode] = useState(defaultMode); // 'signup' | 'login' | 'forgot' | 'verify-otp'
  const [registeredEmail, setRegisteredEmail] = useState(''); // Store email after registration
  const [bannedUserData, setBannedUserData] = useState(null); // Store banned user data
  const [shopBanReason, setShopBanReason] = useState(null); // Store shop ban reason
  const [banType, setBanType] = useState(null); // 'ACCOUNT_BANNED' or 'SHOP_BANNED'
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

  const validateOTP = (values) => {
    const errors = {};
    if (!values.otpCode.trim()) {
      errors.otpCode = 'OTP code is required';
    } else if (values.otpCode.trim().length !== 6) {
      errors.otpCode = 'OTP code must be 6 digits';
    } else if (!/^\d{6}$/.test(values.otpCode.trim())) {
      errors.otpCode = 'OTP code must contain only numbers';
    }
    return errors;
  };
  
  // React Query mutations
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const forgotPasswordMutation = useForgotPassword();
  const verifyOTPMutation = useVerifyOTP();
  const sendOTPMutation = useSendOTP();
  
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

  const otpForm = useForm({
    otpCode: '',
  }, validateOTP);

  // Helper to get current form's values/errors/handlers
  const getCurrentForm = () => {
    if (mode === 'signup') return signupForm;
    if (mode === 'forgot') return forgotForm;
    if (mode === 'verify-otp') return otpForm;
    return loginForm;
  };

  // Submission handlers
  const onSubmit = async (values) => {
    try {
      if (mode === 'signup') {
        await registerMutation.mutateAsync(values);
        alert('Đăng ký thành công! Vui lòng kiểm tra email để lấy mã OTP.');
        // Store email and switch to OTP verification mode
        setRegisteredEmail(values.email);
        setMode('verify-otp');
      } else if (mode === 'verify-otp') {
        // Verify OTP
        await verifyOTPMutation.mutateAsync({
          email: registeredEmail,
          otpCode: values.otpCode
        });
        alert('Xác thực OTP thành công! Tài khoản đã được kích hoạt. Vui lòng đăng nhập.');
        
        // Chuyển về trang đăng nhập với email đã điền sẵn
        setMode('login');
        loginForm.setValues({
          email: registeredEmail,
          password: ''
        });
        // Reset OTP form
        otpForm.reset();
      } else {
        const result = await loginMutation.mutateAsync(values);
        alert('Đăng nhập thành công!');
        
        // Dispatch event để notify useAuth hook
        window.dispatchEvent(new CustomEvent('authSuccess', { detail: result }));
        onClose && onClose();
        
        // Check if user is admin and redirect to /admin
        if (result?.data?.role === 'admin') {
          // Redirect to admin dashboard
          window.location.href = '/admin';
        }
        // For non-admin users, let the header update automatically
      }
    } catch (error) {
      // Check if error is account banned or shop banned
      const errorCode = error.response?.data?.errors?.errorCode;
      if (error.response?.status === 403 && (errorCode === 'ACCOUNT_BANNED' || errorCode === 'SHOP_BANNED')) {
        // Show appropriate modal
        const userData = error.response.data.data || error.response.data.errors;
        setBannedUserData(userData);
        setBanType(errorCode);
        if (errorCode === 'SHOP_BANNED') {
          setShopBanReason(error.response.data.errors.shopBanReason || 'Không có lý do cụ thể');
        }
      } else {
        alert('Lỗi: ' + error.message);
      }
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

  const handleResendOTP = async () => {
    try {
      await sendOTPMutation.mutateAsync(registeredEmail);
      alert('Mã OTP mới đã được gửi đến email của bạn!');
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  const isLoading = loginMutation.isLoading || registerMutation.isLoading || forgotPasswordMutation.isLoading || verifyOTPMutation.isLoading || sendOTPMutation.isLoading;

  return (
    <div className="auth-card">
      {/* nút đóng modal (tuỳ) */}
      {onClose && (
        <button className="auth-close" onClick={onClose} aria-label="Close">×</button>
      )}

      {/* Header */}
      <div className="auth-header">
        <div className="auth-title">
          {mode === 'signup' ? 'Sign Up' : mode === 'forgot' ? 'Forgot Password' : mode === 'verify-otp' ? 'Verify OTP' : 'Login'}
        </div>
        <div className="auth-underline"></div>
      </div>

      {/* Google OAuth */}
      {mode !== 'forgot' && mode !== 'verify-otp' && (
        <div className="auth-social">
          <GoogleAuth 
            onSuccess={(data) => {
              console.log('🎉 Google login success:', data);
              alert('Đăng nhập Google thành công! Chào mừng ' + data.data.fullName);
              // Dispatch event để notify useAuth hook
              window.dispatchEvent(new CustomEvent('authSuccess', { detail: data }));
              onClose && onClose();
              
              // Check if user is admin and redirect to /admin
              if (data?.data?.role === 'admin') {
                window.location.href = '/admin';
              }
              // For non-admin users, let the header update automatically
            }}
            onError={(error) => {
              console.error('❌ Google login error:', error);
              
              // Check if account is banned
              if (error.isBanned && error.bannedData) {
                const errorCode = error.response?.data?.errors?.errorCode;
                setBannedUserData(error.bannedData);
                setBanType(errorCode);
                if (errorCode === 'SHOP_BANNED') {
                  setShopBanReason(error.response?.data?.errors?.shopBanReason || 'Không có lý do cụ thể');
                }
              } else {
                alert('Lỗi đăng nhập Google: ' + error.message);
              }
            }}
          />
          <div className="auth-or-line"><span>or</span></div>
        </div>
      )}

      {/* Form */}
      {mode === 'verify-otp' ? (
        <form onSubmit={otpForm.handleSubmit(onSubmit)} noValidate>
          <div className="auth-inputs">
            <div className="auth-otp-description">
              <p>Nhập mã OTP đã được gửi đến email: <strong>{registeredEmail}</strong></p>
            </div>
            
            <div className={`auth-input ${otpForm.errors.otpCode ? 'is-error' : ''}`}>
              <span className="auth-icon">🔐</span>
              <input
                type="text"
                name="otpCode"
                placeholder="Nhập mã OTP (6 số)"
                value={otpForm.values.otpCode}
                onChange={otpForm.handleChange}
                onBlur={otpForm.handleBlur}
                maxLength="6"
              />
            </div>
            {otpForm.errors.otpCode && <div className="auth-field-error">{otpForm.errors.otpCode}</div>}
          </div>

          <div className="auth-resend-otp">
            <button
              type="button"
              className="auth-resend-btn"
              onClick={handleResendOTP}
              disabled={sendOTPMutation.isLoading}
            >
              {sendOTPMutation.isLoading ? 'Đang gửi...' : 'Gửi lại OTP'}
            </button>
            <button
              type="button"
              className="auth-back-to-login-btn"
              onClick={() => {
                setMode('login');
                loginForm.setValues({
                  email: registeredEmail,
                  password: ''
                });
                otpForm.reset();
              }}
            >
              Quay lại đăng nhập
            </button>
          </div>

          <button type="submit" className="auth-submit" disabled={isLoading}>
            {isLoading ? 'Đang xác thực...' : 'Xác thực OTP'}
          </button>
        </form>
      ) : mode === 'forgot' ? (
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

      {/* Banned Account Modal */}
      {bannedUserData && banType === 'ACCOUNT_BANNED' && (
        <BannedAccountModal 
          userData={bannedUserData}
          onClose={() => {
            setBannedUserData(null);
            setBanType(null);
          }}
        />
      )}
      
      {/* Banned Shop Modal */}
      {bannedUserData && banType === 'SHOP_BANNED' && (
        <BannedShopModal 
          userData={bannedUserData}
          shopBanReason={shopBanReason}
          onClose={() => {
            setBannedUserData(null);
            setBanType(null);
            setShopBanReason(null);
          }}
        />
      )}
    </div>
  );
};

export default LoginSignUp;