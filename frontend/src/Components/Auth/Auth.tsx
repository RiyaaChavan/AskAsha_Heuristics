import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import './Auth.css';

const Auth: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  
  return (
    <div className="auth-container">
      {isLoginView ? (
        <Login onSwitchToSignup={() => setIsLoginView(false)} />
      ) : (
        <Signup onSwitchToLogin={() => setIsLoginView(true)} />
      )}
    </div>
  );
};

export default Auth;