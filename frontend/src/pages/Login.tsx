import { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import searchicon from "../assets/search.png"
import "./Logic.css"


export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { when: "beforeChildren", staggerChildren: 0.2, duration: 0.5 }
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

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        navigate('/profile-setup');
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setError('Failed to sign in with Google');
    }
  };

  return (
    <div className="login-container">
      <motion.div
        className="login-box"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Left Section */}
        <motion.div
          className="left-section"
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

          <div className="content-container">
            <motion.h1 className="main-heading" variants={itemVariants}>
              Connect, Learn, <br /> Grow Together
            </motion.h1>
            <motion.p className="sub-heading" variants={itemVariants}>
              Join our community of professionals and expand your network.
              Access exclusive events and opportunities tailored just for you.
            </motion.p>
            <motion.div className="tags-container" variants={itemVariants}>
              {["Sessions", "Jobs", "Companies", "Events"].map((item, index) => (
                <motion.span
                  key={index}
                  className="tag"
                  whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}
                >
                  {item}
                </motion.span>
              ))}
            </motion.div>
          </div>

          {/* Animated Background Circles */}
          <motion.div
            className="circle-pink"
            animate={{ x: [0, 30, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
          />
          <motion.div
            className="circle-purple"
            animate={{ x: [0, -20, 0], y: [0, 20, 0], scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 20, ease: "easeInOut", delay: 2 }}
          />
        </motion.div>

        {/* Right Section */}
        <motion.div
          className="right-section"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2
            className="welcome-text"
            variants={itemVariants}
          >
            Welcome to AskAsha
          </motion.h2>

          {error && (
            <motion.div
              className="error-message"
              variants={itemVariants}
            >
              {error}
            </motion.div>
          )}

          <motion.div variants={itemVariants}>
            <input
              type="email"
              placeholder="Your email address"
              className="input-field"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <input
              type="password"
              placeholder="Password"
              className="input-field"
            />
          </motion.div>

          <motion.button
            className="signin-button"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            Sign In
          </motion.button>

          <motion.div className="divider" variants={itemVariants}>
            <div className="divider-line"></div>
            <span className="divider-text">OR</span>
            <div className="divider-line"></div>
          </motion.div>

          <motion.button
            onClick={handleGoogleSignIn}
            className="google-button"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <img
              src={searchicon}
              alt="Google"
              className="google-icon"
            />
            <span>Continue with Google</span>
          </motion.button>

          <motion.p className="signup-text" variants={itemVariants}>
            <span>Don't have an account? </span>
            <a href="#" className="signup-link">
              Sign Up
            </a>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}


