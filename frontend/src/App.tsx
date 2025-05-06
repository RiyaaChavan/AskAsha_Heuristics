import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Chatbot from './Components/Chatbot';
import Interview from './Components/Interview';
import Header from './Components/Header';
import Home from './pages/Home';
import ProfileSetup from './Components/ProfileSetup';
import LoadingComp from './Components/LoadingComp';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [showHeader, setShowHeader] = useState(false);
  
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
  };

  return (
    <Router>
      <div className="app-container">
        {/* Show loading when isLoading is true */}
        {isLoading && <LoadingComp />}
        
        {/* Only show header when showHeader is true */}
        {showHeader && !isLoading && <Header userName="C" notificationCount={1} />}
        
        {/* Only show routes when not loading */}
        {!isLoading && (
          <Routes>
            <Route path="/" element={<Home onGetStarted={handleStartLoading} />} />
            <Route path="/jobsearch" element={<Chatbot userId="User" />} />
            <Route path="/askasha" element={<Interview userId="User" />} />
            <Route path="/profile-setup" element={<ProfileSetup onProfileComplete={handleProfileComplete} />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;