import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
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
import Signup from './pages/Signup';
import Navbar from './Components/Navbar';
import CareerCoach from './Components/CareerCoach';
import InterviewAssistant from './Components/InterviewAssistant';

function AppWithNavbar() {
  const location = useLocation();
  const hideNavbar = ['/login', '/signup', '/profile-setup'].includes(location.pathname);
  return (
    <>
      <KeepAlive />
      <DebugInfo />
      {!hideNavbar && <Navbar />}
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/signup" element={<Signup />} />
        {/* Protected routes */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/jobsearch" replace />} />
        <Route path="/chatbot" element={
          <ProtectedRoute>
            <Chatbot userId={localStorage.getItem('userId') || 'anonymous'} />
          </ProtectedRoute>
        } />
        <Route path="/interview" element={
          <ProtectedRoute>
            <Interview userId={localStorage.getItem('userId') || 'anonymous'} />
          </ProtectedRoute>
        } />
        <Route path="/career-coach" element={
          <ProtectedRoute>
            <CareerCoach />
          </ProtectedRoute>
        } />
        <Route path="/interview-assistant" element={
          <ProtectedRoute>
            <InterviewAssistant />
          </ProtectedRoute>
        } />
        <Route path="/jobsearch" element={
          <ProtectedRoute>
            <Chatbot userId={localStorage.getItem('userId') || 'anonymous'} />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppWithNavbar />
      </Router>
    </AuthProvider>
  );
}

export default App;
