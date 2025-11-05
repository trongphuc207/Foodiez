import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { setAuthToken } from '../../api/auth';

const GoogleAuth = ({ onSuccess, onError }) => {
  const handleSuccess = async (credentialResponse) => {
    try {
      console.log('🔍 Google login successful, credential received');
      
      // Decode the JWT token to get user info
      const decoded = jwtDecode(credentialResponse.credential);
      console.log('👤 Decoded user info:', decoded);
      
      // Send the credential to your backend
      const response = await fetch('http://localhost:8080/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credentialResponse.credential
        }),
      });
      
      console.log('📡 Backend response status:', response.status);
      
      // Check if response has content
      const text = await response.text();
      console.log('📄 Raw response:', text);
      
      if (!text) {
        throw new Error('Empty response from server');
      }
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        throw new Error('Invalid JSON response from server: ' + text);
      }
      
      if (response.ok) {
        console.log('✅ Google auth response:', data);
        
        if (data.success) {
          console.log('🎉 Google authentication successful!');
          setAuthToken(data.token);
          // Dispatch custom event to notify components
          window.dispatchEvent(new CustomEvent('authSuccess', { detail: data }));
          onSuccess && onSuccess(data);
        } else {
          console.error('❌ Google auth failed:', data.message);
          throw new Error(data.message || 'Google authentication failed');
        }
      } else if (response.status === 403) {
        // Handle banned account
        console.error('⛔ Account banned:', data);
        
        // Create error object with banned account info
        const error = new Error(data.message || 'Tài khoản đã bị khóa');
        error.isBanned = true;
        error.bannedData = data.data || data.errors;
        error.response = { status: 403, data: data };
        
        onError && onError(error);
      } else {
        console.error('❌ Backend error:', data);
        throw new Error(data.message || 'Google authentication failed');
      }
    } catch (error) {
      console.error('❌ Google login error:', error);
      onError && onError(error);
    }
  };

  const handleError = () => {
    console.log('Google login failed');
    onError && onError(new Error('Google login failed'));
  };

  return (
    <GoogleOAuthProvider clientId="451867714279-dd3jppk8776pear0coenn1it0kd6seg7.apps.googleusercontent.com">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap={false}
        theme="outline"
        size="large"
        width="100%"
        text="continue_with"
        shape="rectangular"
      />
    </GoogleOAuthProvider>
  );
};

export default GoogleAuth;
