import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Chatbot from './Components/Chatbot';
import Interview from './Components/Interview';
import Header from './Components/Header';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './Components/ProtectedRoute';
import Login from './pages/Login';
import { ProfileSetup } from './Components/ProfileSetup';
import Profile from './pages/Profile';
import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';

const ProfileRequiredRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const checkProfile = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        console.log("Checking profile at:", `${import.meta.env.VITE_API_URL}/profile/${currentUser.uid}`);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/profile/${currentUser.uid}`);
        console.log("Profile check response:", response.status);
        
        // If profile exists, proceed
        if (response.ok) {
          setHasProfile(true);
          setLoading(false);
        } else {
          // Retry up to 3 times if the profile check fails
          if (retryCount < 3) {
            console.log(`Retrying profile check (${retryCount + 1}/3)...`);
            setRetryCount(retryCount + 1);
            setTimeout(() => checkProfile(), 1000); // Retry after 1 second
          } else {
            setHasProfile(false);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error checking profile:', error);
        setHasProfile(false);
        setLoading(false);
      }
    };

    checkProfile();
  }, [currentUser, retryCount]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#934f73]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!hasProfile) {
    return <Navigate to="/profile-setup" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<ProtectedRoute><ProfileRequiredRoute><Chatbot /></ProfileRequiredRoute></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/interview" element={<ProtectedRoute><ProfileRequiredRoute><Interview /></ProfileRequiredRoute></ProtectedRoute>} />
          {/* This route can be removed if you use '/' as the destination after profile completion */}
          <Route path="/jobsearch" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
