import React, { useState } from "react";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { motion } from "framer-motion";

function GoogleSignIn() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Sign in with Google
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      console.log("Successfully signed in:", result.user);
    } catch (error) {
      setError(error.message);
      console.error("Error signing in with Google:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Email/Password
  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      const currentUser = auth.currentUser;
      setUser(currentUser);
      console.log("Successfully signed in:", currentUser);
    } catch (error) {
      setError(error.message);
      console.error("Error signing in:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    setLoading(true);

    try {
      await signOut(auth);
      setUser(null);
      console.log("Successfully signed out");
    } catch (error) {
      setError(error.message);
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2,
        duration: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-500 via-purple-700 to-rose-500 p-4">
      <motion.div
        className="w-full max-w-6xl flex rounded-3xl overflow-hidden shadow-2xl bg-white bg-opacity-10 backdrop-blur-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Left section with brand info */}
        <motion.div
          className="hidden md:flex md:w-1/2 flex-col justify-center items-start p-12 text-white relative"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="absolute top-8 left-8"
            variants={itemVariants}
          >
            <h2 className="text-2xl font-bold flex items-center">
              <motion.div
                className="w-10 h-10 rounded-full bg-white mr-2 flex items-center justify-center text-purple-700 text-lg font-bold"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >H</motion.div>
              herkey
            </h2>
          </motion.div>

          <div className="z-10">
            <motion.h1
              className="text-4xl font-bold mb-6"
              variants={itemVariants}
            >
              Connect, Learn,<br />Grow Together
            </motion.h1>
            <motion.p
              className="text-white text-opacity-90 mb-8"
              variants={itemVariants}
            >
              Join our community of professionals and expand your network.
              Access exclusive events and opportunities tailored just for you.
            </motion.p>

            <motion.div
              className="flex space-x-3 mt-10"
              variants={itemVariants}
            >
              {["Sessions", "Jobs", "Companies", "Events"].map((item, index) => (
                <motion.span
                  key={index}
                  className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm"
                  whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}
                >
                  {item}
                </motion.span>
              ))}
            </motion.div>
          </div>

          {/* Background gradient circles */}
          <motion.div
            className="absolute w-64 h-64 rounded-full bg-pink-400 bg-opacity-30 blur-2xl"
            animate={{
              x: [0, 30, 0],
              y: [0, -30, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              repeat: Infinity,
              duration: 15,
              ease: "easeInOut"
            }}
            style={{ bottom: '10%', left: '10%' }}
          />
          <motion.div
            className="absolute w-96 h-96 rounded-full bg-purple-400 bg-opacity-20 blur-2xl"
            animate={{
              x: [0, -20, 0],
              y: [0, 20, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{
              repeat: Infinity,
              duration: 20,
              ease: "easeInOut",
              delay: 2
            }}
            style={{ top: '5%', right: '5%' }}
          />
        </motion.div>

        {/* Right section with form */}
        <motion.div
          className="w-full md:w-1/2 bg-white p-8 md:p-12 flex flex-col justify-center rounded-3xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {user ? (
            <motion.div
              className="user-profile text-center"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="flex flex-col items-center space-y-4">
                <motion.img
                  src={user.photoURL || "/api/placeholder/80/80"}
                  alt="Profile"
                  className="w-20 h-20 rounded-full border-4 border-purple-200"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                />
                <motion.h3
                  className="text-2xl font-bold text-purple-800"
                  variants={itemVariants}
                >
                  Welcome back, {user.displayName || user.email}
                </motion.h3>
                <motion.p
                  className="text-gray-600"
                  variants={itemVariants}
                >
                  {user.email}
                </motion.p>
                <motion.button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="mt-6 w-full py-3 bg-gradient-to-r from-rose-500 to-purple-700 text-white font-medium rounded-lg shadow-md"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {loading ? "Processing..." : "Sign Out"}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <>
              <motion.h2
                className="text-2xl font-bold text-center text-purple-800 mb-8"
                variants={itemVariants}
              >
                Welcome to Herkey
              </motion.h2>

              <motion.form
                onSubmit={handleEmailSignIn}
                className="space-y-4"
                variants={containerVariants}
              >
                <motion.div variants={itemVariants}>
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    required
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    required
                  />
                </motion.div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-rose-500 to-purple-700 text-white font-medium rounded-lg shadow-md"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {loading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
                </motion.button>
              </motion.form>

              <motion.div
                className="my-6 flex items-center justify-center"
                variants={itemVariants}
              >
                <div className="border-t border-gray-300 flex-grow mr-3"></div>
                <span className="text-sm text-gray-500">OR</span>
                <div className="border-t border-gray-300 flex-grow ml-3"></div>
              </motion.div>

              <motion.button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-300"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.1711 8.36788H17.5V8.33329H10V11.6666H14.6906C14.0005 13.607 12.1812 15.0001 10 15.0001C7.23859 15.0001 5.00001 12.7615 5.00001 10.0001C5.00001 7.23868 7.23859 5.00011 10 5.00011C11.2706 5.00011 12.4372 5.45611 13.3556 6.20009L15.7961 3.75963C14.2452 2.33603 12.2232 1.42755 10 1.42755C5.25172 1.42755 1.4275 5.25178 1.4275 10.0001C1.4275 14.7483 5.25172 18.5726 10 18.5726C14.7483 18.5726 18.5725 14.7483 18.5725 10.0001C18.5725 9.44303 18.5143 8.8978 18.4036 8.36788H18.1711Z" fill="#FFC107" />
                  <path d="M2.62744 6.12141L5.5077 8.17458C6.26934 6.30301 7.99541 5.0001 10 5.0001C11.2706 5.0001 12.4372 5.4561 13.3556 6.20008L15.7961 3.75962C14.2452 2.33602 12.2232 1.42754 10 1.42754C6.76492 1.42754 3.96731 3.33914 2.62744 6.12141Z" fill="#FF3D00" />
                  <path d="M9.99996 18.5724C12.1745 18.5724 14.1569 17.6975 15.6963 16.3203L13.0191 14.0414C12.1347 14.7141 11.0295 15.0719 9.99996 15.0001C7.83152 15.0001 5.91938 13.6225 5.22065 11.7015L2.40332 13.9103C3.72598 16.7642 6.5643 18.5724 9.99996 18.5724Z" fill="#4CAF50" />
                  <path d="M18.1711 8.36788H17.5V8.33329H10V11.6666H14.6906C14.3657 12.5807 13.7734 13.3732 13.0176 13.9445L13.0195 13.9431L15.6967 16.222C15.5063 16.3954 18.5725 14.1667 18.5725 10.0001C18.5725 9.44303 18.5143 8.8978 18.4036 8.36788H18.1711Z" fill="#1976D2" />
                </svg>
                <span className="ml-2 text-gray-700">Sign in with Google</span>
              </motion.button>

              <motion.p
                className="mt-8 text-center text-gray-600"
                variants={itemVariants}
              >
                {isSignUp ? "Already have an account?" : "Don't have an account?"}
                <motion.button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="ml-1 text-purple-600 hover:text-purple-800 font-medium"
                  whileHover={{ scale: 1.05 }}
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </motion.button>
              </motion.p>

              {error && (
                <motion.p
                  className="mt-4 text-center text-red-500 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {error}
                </motion.p>
              )}
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default GoogleSignIn;