import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Onboarding from './pages/Onboarding/Onboarding';
import ChatbotPage from './pages/ChatbotPage';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/" element={<Navigate to="/onboarding" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;