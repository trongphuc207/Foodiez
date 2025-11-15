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
      
      if (response.ok) {
        const data = await response.json();
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
      } else {
        const errorData = await response.json();
        console.error('❌ Backend error:', errorData);
        throw new Error(errorData.message || 'Google authentication failed');
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
    <GoogleOAuthProvider clientId="415128695987-74n36p1u0borb4974me4lthvpvcdsqdh.apps.googleusercontent.com">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap={false}
        auto_select={false}
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
