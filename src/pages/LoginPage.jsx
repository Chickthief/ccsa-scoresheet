import React from 'react';
import LoginForm from '../components/auth/LoginForm';

function LoginPage({ onLoginSuccess }) {
  return (
    <div className="iphone-container"> {/* Or a more specific login-page-container */}
      {/* You might have a shared Header/Footer component here eventually */}
      <LoginForm onLoginSuccess={onLoginSuccess} />
    </div>
  );
}
export default LoginPage;