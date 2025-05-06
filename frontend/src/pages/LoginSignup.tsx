import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './LoginSignup.css';
import axios from 'axios';

interface LoginSignupProps {
  onAuthenticated: () => void;
}

export default function LoginSignup({ onAuthenticated }: LoginSignupProps) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  });

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { when: "beforeChildren", staggerChildren: 0.1, duration: 0.5 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }

    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (!formData.name) {
        setError('Name is required');
        return false;
      }
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      let response;
      
      if (isLogin) {
        // Login request to Flask backend
        response = await axios.post('http://localhost:5000/api/auth/login', {
          email: formData.email,
          password: formData.password
        });
      } else {
        // Signup request to Flask backend
        response = await axios.post('http://localhost:5000/api/auth/signup', {
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
      }

      // Store the token in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.user_id);
      
      // Trigger the authenticated callback
      onAuthenticated();
      
      // Navigate to profile setup or dashboard
      setTimeout(() => {
        navigate('/profile-setup');
      }, 1000);
      
    } catch (error: any) {
      console.error('Authentication error:', error);
      setError(error.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  return (
    <div className="login-signup-container">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className="auth-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="logo-container" variants={itemVariants}>
            <h2 className="logo-text">
              <motion.div
                className="logo-circle"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                AA
              </motion.div>
              AskAsha
            </h2>
          </motion.div>

          <motion.h2 variants={itemVariants} className="auth-title">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </motion.h2>
          
          <motion.p variants={itemVariants} className="auth-subtitle">
            {isLogin 
              ? 'Sign in to continue your journey with AskAsha' 
              : 'Join AskAsha and discover new opportunities'}
          </motion.p>

          {error && (
            <motion.div 
              className="error-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.div>
          )}

          <motion.form 
            onSubmit={handleSubmit} 
            className="auth-form"
            variants={containerVariants}
          >
            {!isLogin && (
              <motion.div className="form-group" variants={itemVariants}>
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                />
              </motion.div>
            )}

            <motion.div className="form-group" variants={itemVariants}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
              />
            </motion.div>

            <motion.div className="form-group" variants={itemVariants}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
              />
            </motion.div>

            {!isLogin && (
              <motion.div className="form-group" variants={itemVariants}>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                />
              </motion.div>
            )}

            {isLogin && (
              <motion.div className="forgot-password" variants={itemVariants}>
                <a href="#reset-password">Forgot Password?</a>
              </motion.div>
            )}

            <motion.button
              type="submit"
              className="auth-button"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                isLogin ? 'Sign In' : 'Sign Up'
              )}
            </motion.button>
          </motion.form>

          <motion.div className="auth-footer" variants={itemVariants}>
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <motion.button
                className="toggle-auth-mode"
                onClick={toggleMode}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </motion.button>
            </p>
          </motion.div>

          <motion.p className="terms-text" variants={itemVariants}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </motion.p>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          className="bg-circle-auth-1"
          animate={{ x: [0, 30, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
        />
        <motion.div
          className="bg-circle-auth-2"
          animate={{ x: [0, -20, 0], y: [0, 20, 0], scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 20, ease: "easeInOut", delay: 2 }}
        />
      </motion.div>
    </div>
  );
}