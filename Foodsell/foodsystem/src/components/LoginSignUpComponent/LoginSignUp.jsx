import React, { useState } from 'react';
import './LoginSignUp.css';
// eslint-disable-next-line no-unused-vars
import { useAuth } from '../../hooks/useAuth'; // Custom hook for auth context
import { useLogin, useRegister, useForgotPassword, useVerifyOTP, useSendOTP } from '../../hooks/useAuthQueries'; // React Query hooks
import { useForm } from '../../hooks/useCommon'; // Custom form hook
import GoogleAuth from '../GoogleAuth/GoogleAuth';

import email_icon from '../Assets/email.png';
import password_icon from '../Assets/password.png';

const LoginSignUp = ({ onClose, defaultMode = 'signup' }) => {
  const [mode, setMode] = useState(defaultMode); // 'signup' | 'login' | 'forgot' | 'verify-otp'
  const [registeredEmail, setRegisteredEmail] = useState(''); // Store email after registration
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
    } else if (values.password.length > 128) {
      errors.password = 'Password must be less than 128 characters';
    }
    if (!values.confirmPassword) {
      errors.confirmPassword = 'Confirm password is required';
    } else if (values.password !== values.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    return errors;
  };

  const validateForgotPassword = (values) => {
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
    if (!values.otp.trim()) {
      errors.otp = 'OTP is required';
    } else if (values.otp.trim().length !== 6) {
      errors.otp = 'OTP must be 6 digits';
    }
    return errors;
  };

  // Form configurations
  const loginForm = useForm({
    initialValues: { email: '', password: '' },
    validate: validateLogin,
    onSubmit: async (values) => {
      try {
        await loginMutation.mutateAsync(values);
        onClose?.();
      } catch (error) {
        console.error('Login error:', error);
      }
    }
  });

  const signupForm = useForm({
    initialValues: { fullName: '', email: '', password: '', confirmPassword: '' },
    validate: validateSignup,
    onSubmit: async (values) => {
      try {
        await registerMutation.mutateAsync(values);
        setRegisteredEmail(values.email);
        setMode('verify-otp');
      } catch (error) {
        console.error('Registration error:', error);
      }
    }
  });

  const forgotPasswordForm = useForm({
    initialValues: { email: '' },
    validate: validateForgotPassword,
    onSubmit: async (values) => {
      try {
        await forgotPasswordMutation.mutateAsync(values);
        alert('Password reset email sent! Please check your inbox.');
        setMode('login');
      } catch (error) {
        console.error('Forgot password error:', error);
      }
    }
  });

  const otpForm = useForm({
    initialValues: { otp: '' },
    validate: validateOTP,
    onSubmit: async (values) => {
      try {
        await verifyOTPMutation.mutateAsync({ email: registeredEmail, otp: values.otp });
        alert('Email verified successfully! You can now login.');
        setMode('login');
      } catch (error) {
        console.error('OTP verification error:', error);
      }
    }
  });

  // React Query mutations
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const forgotPasswordMutation = useForgotPassword();
  const verifyOTPMutation = useVerifyOTP();
  const sendOTPMutation = useSendOTP();

  // Handle Google authentication success
  const handleGoogleSuccess = (response) => {
    console.log('Google auth success:', response);
    onClose?.();
  };

  // Handle Google authentication error
  const handleGoogleError = (error) => {
    console.error('Google auth error:', error);
  };

  // Resend OTP
  const handleResendOTP = async () => {
    try {
      await sendOTPMutation.mutateAsync({ email: registeredEmail });
      alert('OTP sent again! Please check your email.');
    } catch (error) {
      console.error('Resend OTP error:', error);
    }
  };

  // Render form based on mode
  const renderForm = () => {
    switch (mode) {
      case 'login':
        return (
          <form onSubmit={loginForm.handleSubmit} className="auth-form">
            <div className="auth-input-group">
              <img src={email_icon} alt="email" className="auth-input-icon" />
              <input
                type="email"
                placeholder="Email"
                value={loginForm.values.email}
                onChange={(e) => loginForm.setFieldValue('email', e.target.value)}
                className="auth-input"
              />
            </div>
            {loginForm.errors.email && <div className="auth-error">{loginForm.errors.email}</div>}

            <div className="auth-input-group">
              <img src={password_icon} alt="password" className="auth-input-icon" />
              <input
                type="password"
                placeholder="Password"
                value={loginForm.values.password}
                onChange={(e) => loginForm.setFieldValue('password', e.target.value)}
                className="auth-input"
              />
            </div>
            {loginForm.errors.password && <div className="auth-error">{loginForm.errors.password}</div>}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="auth-submit"
            >
              {loginMutation.isPending ? 'Logging in...' : 'Login'}
            </button>

            <div className="auth-links">
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="auth-link"
              >
                Forgot Password?
              </button>
            </div>
          </form>
        );

      case 'signup':
        return (
          <form onSubmit={signupForm.handleSubmit} className="auth-form">
            <div className="auth-input-group">
              <img src={email_icon} alt="name" className="auth-input-icon" />
              <input
                type="text"
                placeholder="Full Name"
                value={signupForm.values.fullName}
                onChange={(e) => signupForm.setFieldValue('fullName', e.target.value)}
                className="auth-input"
              />
            </div>
            {signupForm.errors.fullName && <div className="auth-error">{signupForm.errors.fullName}</div>}

            <div className="auth-input-group">
              <img src={email_icon} alt="email" className="auth-input-icon" />
              <input
                type="email"
                placeholder="Email"
                value={signupForm.values.email}
                onChange={(e) => signupForm.setFieldValue('email', e.target.value)}
                className="auth-input"
              />
            </div>
            {signupForm.errors.email && <div className="auth-error">{signupForm.errors.email}</div>}

            <div className="auth-input-group">
              <img src={password_icon} alt="password" className="auth-input-icon" />
              <input
                type="password"
                placeholder="Password"
                value={signupForm.values.password}
                onChange={(e) => signupForm.setFieldValue('password', e.target.value)}
                className="auth-input"
              />
            </div>
            {signupForm.errors.password && <div className="auth-error">{signupForm.errors.password}</div>}

            <div className="auth-input-group">
              <img src={password_icon} alt="confirm password" className="auth-input-icon" />
              <input
                type="password"
                placeholder="Confirm Password"
                value={signupForm.values.confirmPassword}
                onChange={(e) => signupForm.setFieldValue('confirmPassword', e.target.value)}
                className="auth-input"
              />
            </div>
            {signupForm.errors.confirmPassword && <div className="auth-error">{signupForm.errors.confirmPassword}</div>}

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="auth-submit"
            >
              {registerMutation.isPending ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        );

      case 'forgot':
        return (
          <form onSubmit={forgotPasswordForm.handleSubmit} className="auth-form">
            <div className="auth-input-group">
              <img src={email_icon} alt="email" className="auth-input-icon" />
              <input
                type="email"
                placeholder="Email"
                value={forgotPasswordForm.values.email}
                onChange={(e) => forgotPasswordForm.setFieldValue('email', e.target.value)}
                className="auth-input"
              />
            </div>
            {forgotPasswordForm.errors.email && <div className="auth-error">{forgotPasswordForm.errors.email}</div>}

            <button
              type="submit"
              disabled={forgotPasswordMutation.isPending}
              className="auth-submit"
            >
              {forgotPasswordMutation.isPending ? 'Sending...' : 'Send Reset Email'}
            </button>

            <div className="auth-links">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="auth-link"
              >
                Back to Login
              </button>
            </div>
          </form>
        );

      case 'verify-otp':
        return (
          <form onSubmit={otpForm.handleSubmit} className="auth-form">
            <div className="auth-input-group">
              <img src={email_icon} alt="otp" className="auth-input-icon" />
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otpForm.values.otp}
                onChange={(e) => otpForm.setFieldValue('otp', e.target.value)}
                className="auth-input"
                maxLength="6"
              />
            </div>
            {otpForm.errors.otp && <div className="auth-error">{otpForm.errors.otp}</div>}

            <button
              type="submit"
              disabled={verifyOTPMutation.isPending}
              className="auth-submit"
            >
              {verifyOTPMutation.isPending ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div className="auth-links">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={sendOTPMutation.isPending}
                className="auth-link"
              >
                {sendOTPMutation.isPending ? 'Sending...' : 'Resend OTP'}
              </button>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        <button className="auth-close" onClick={onClose}>×</button>
        
        <div className="auth-header">
          <h2 className="auth-title">
            {mode === 'login' ? 'Login' : 
             mode === 'signup' ? 'Sign Up' : 
             mode === 'forgot' ? 'Forgot Password' : 
             'Verify Email'}
          </h2>
          <div className="auth-underline"></div>
        </div>

        {/* Google Authentication */}
        {mode === 'login' && (
          <div className="auth-social">
            <GoogleAuth
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          </div>
        )}

        {/* Form */}
        {renderForm()}

        {/* Mode switching */}
        {mode === 'login' && (
          <div className="auth-switch">
            <span>Don't have an account? </span>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className="auth-link"
            >
              Sign Up
            </button>
          </div>
        )}

        {mode === 'signup' && (
          <div className="auth-switch">
            <span>Already have an account? </span>
            <button
              type="button"
              onClick={() => setMode('login')}
              className="auth-link"
            >
              Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginSignUp;