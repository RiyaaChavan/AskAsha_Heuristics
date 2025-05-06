import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Chatbot from './Components/Chatbot';
import Interview from './Components/Interview';
import Header from './Components/Header';
import Home from './pages/Home';
import ProfileSetup from './Components/ProfileSetup';
import LoadingComp from './Components/LoadingComp';
import LoginSignup from './pages/LoginSignup';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [showHeader, setShowHeader] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState({
    userId: '',
    name: '',
    email: '',
    profileCompleted: false
  });
  
  // Check if the user is already authenticated on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (token && userId) {
      // Set default auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch user data
      fetchUserData(token);
      
      setIsAuthenticated(true);
    }
  }, []);
  
  // Function to fetch user data from backend
  const fetchUserData = async (token: string) => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setUserData({
        userId: response.data.user_id,
        name: response.data.name,
        email: response.data.email,
        profileCompleted: response.data.profile_completed
      });
      
      if (response.data.profile_completed) {
        setShowHeader(true);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // If there's an error, clear the stored token and redirect to login
      handleLogout();
    }
  };
  
  // Function to handle user logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setShowHeader(false);
    setUserData({
      userId: '',
      name: '',
      email: '',
      profileCompleted: false
    });
  };
  
  // Function to handle loading state
  const handleStartLoading = () => {
    setIsLoading(true);
    
    // After 2 seconds, stop loading
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  // Function to display header when profile setup is complete
  const handleProfileComplete = () => {
    setShowHeader(true);
    setUserData({
      ...userData,
      profileCompleted: true
    });
  };
  
  // Function to handle successful authentication
  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserData(token);
    }
  };

  return (
    <Router>
      <div className="app-container">
        {/* Show loading when isLoading is true */}
        {isLoading && <LoadingComp />}
        
        {/* Only show header when showHeader is true and user is authenticated */}
        {showHeader && isAuthenticated && !isLoading && (
          <Header 
            userName={userData.name ? userData.name.charAt(0) : "A"} 
            notificationCount={1}
            onLogout={handleLogout}
          />
        )}
        
        {/* Only show routes when not loading */}
        {!isLoading && (
          <Routes>
            <Route path="/" element={<Home onGetStarted={handleStartLoading} />} />
            
            <Route 
              path="/login" 
              element={
                isAuthenticated ? 
                  <Navigate to={userData.profileCompleted ? "/askasha" : "/profile-setup"} /> : 
                  <LoginSignup onAuthenticated={handleAuthenticated} />
              } 
            />
            
            <Route 
              path="/jobsearch" 
              element={
                isAuthenticated ? 
                  <Chatbot userId={userData.userId} /> : 
                  <Navigate to="/login" />
              } 
            />
            
            <Route 
              path="/askasha" 
              element={
                isAuthenticated ? 
                  <Interview userId={userData.userId} /> : 
                  <Navigate to="/login" />
              } 
            />
            
            <Route 
              path="/profile-setup" 
              element={
                isAuthenticated ? 
                  <ProfileSetup onProfileComplete={handleProfileComplete} /> : 
                  <Navigate to="/login" />
              } 
            />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;