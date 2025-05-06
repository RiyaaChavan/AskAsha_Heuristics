import React from 'react';
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
import DebugInfo from './Components/DebugInfo';
import KeepAlive from './Components/KeepAlive';

const ProfileRequiredRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      // First check localStorage for the profileCreated flag
      if (localStorage.getItem('profileCreated') === 'true') {
        console.log("Found profile flag in localStorage");
        setHasProfile(true);
        setLoading(false);
        return;
      }

      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        // Fix URL format - remove the extra /api in the path
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const url = apiUrl.endsWith('/api') 
          ? `${apiUrl}/profile/${currentUser.uid}`
          : `${apiUrl}/api/profile/${currentUser.uid}`;
        
        console.log("Checking profile at:", url);
        const response = await fetch(url);
        console.log("Profile check response:", response.status);
        
        if (response.ok) {
          localStorage.setItem('profileCreated', 'true');
          localStorage.setItem('userId', currentUser.uid);
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

// Layout component that includes the Header
const Layout = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  const userName = currentUser?.displayName || currentUser?.email?.charAt(0) || 'U';
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header userName={userName.charAt(0)} notificationCount={1} />
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <KeepAlive />
      <DebugInfo />
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          
          {/* Protected routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/" element={
            <ProtectedRoute>
              <ProfileRequiredRoute>
                <Layout>
                  <Chatbot userId={localStorage.getItem('userId') || 'anonymous'} />
                </Layout>
              </ProfileRequiredRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/chatbot" element={
            <ProtectedRoute>
              <ProfileRequiredRoute>
                <Layout>
                  <Chatbot userId={localStorage.getItem('userId') || 'anonymous'} />
                </Layout>
              </ProfileRequiredRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/interview" element={
            <ProtectedRoute>
              <ProfileRequiredRoute>
                <Layout>
                  <Interview userId={localStorage.getItem('userId') || 'anonymous'} />
                </Layout>
              </ProfileRequiredRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/jobsearch" element={
            <ProtectedRoute>
              <ProfileRequiredRoute>
                <Layout>
                  <Chatbot userId={localStorage.getItem('userId') || 'anonymous'} />
                </Layout>
              </ProfileRequiredRoute>
            </ProtectedRoute>
          } />
          
          {/* Fallback route - redirect to home if no matching route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;