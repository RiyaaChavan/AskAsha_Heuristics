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

  useEffect(() => {
    const checkProfile = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/${currentUser.uid}`);
        if (response.ok) {
          setHasProfile(true);
        } else {
          setHasProfile(false);
        }
      } catch (error) {
        console.error('Error checking profile:', error);
        setHasProfile(false);
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, [currentUser]);

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
          <Route path="/login" element={<Login />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <ProfileRequiredRoute>
                <Chatbot userId={localStorage.getItem('userId') || 'anonymous'} />
              </ProfileRequiredRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/chatbot" element={
            <ProtectedRoute>
              <ProfileRequiredRoute>
                <Chatbot userId={localStorage.getItem('userId') || 'anonymous'} />
              </ProfileRequiredRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/interview" element={
            <ProtectedRoute>
              <ProfileRequiredRoute>
                <Interview userId={localStorage.getItem('userId') || 'anonymous'} />
              </ProfileRequiredRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/jobsearch" element={
            <ProtectedRoute>
              <ProfileRequiredRoute>
                <Chatbot userId={localStorage.getItem('userId') || 'anonymous'} />
              </ProfileRequiredRoute>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
