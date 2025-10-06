import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { setAuthToken } from '../../api/auth';

const GoogleAuth = ({ onSuccess, onError }) => {
  const handleSuccess = async (credentialResponse) => {
    try {
      console.log('Google login successful');
      
      // Decode the JWT token to get user info
      const decoded = jwtDecode(credentialResponse.credential);
      console.log('Decoded user info:', decoded);
      
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
      
      if (response.ok) {
        const data = await response.json();
        console.log('Google auth response:', data);
        
        if (data.status === 'success') {
          setAuthToken(data.token);
          onSuccess && onSuccess(data);
        } else {
          throw new Error(data.message || 'Google authentication failed');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Google authentication failed');
      }
    } catch (error) {
      console.error('Google login error:', error);
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
