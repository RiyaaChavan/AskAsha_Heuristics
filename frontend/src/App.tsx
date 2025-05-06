import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Chatbot from './Components/Chatbot';
import Interview from './Components/Interview';
import Header from './Components/Header';
import Home from './pages/Home';
import Loading from './Components/Loading';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [showHeader, setShowHeader] = useState(false);
  
  // Listen for route changes to determine when to show the header
  useEffect(() => {
    // This will hide the header on the home page and show it elsewhere
    const path = window.location.pathname;
    setShowHeader(path !== '/');
  }, []);

  // Function to handle loading state
  const handleStartLoading = () => {
    setIsLoading(true);
    
    // After 2 seconds, stop loading and show header
    setTimeout(() => {
      setIsLoading(false);
      setShowHeader(true);
    }, 2000);
  };

  return (
    <Router>
      <div className="app-container">
        {/* Show loading when isLoading is true */}
        {isLoading && <Loading />}
        
        {/* Only show header when showHeader is true */}
        {showHeader && !isLoading && <Header userName="C" notificationCount={1} />}
        
        {/* Only show routes when not loading */}
        {!isLoading && (
          <Routes>
            <Route path="/" element={<Home onGetStarted={handleStartLoading} />} />
            <Route path="/jobsearch" element={<Chatbot userId="User" />} />
            <Route path="/askasha" element={<Interview userId="User" />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;