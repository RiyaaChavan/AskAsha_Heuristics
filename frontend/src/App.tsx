import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Chatbot from './Components/Chatbot';
import Interview from './Components/Interview';
import Header from './Components/Header';
import './App.css';
import './Components/Chatbot/styles/CanvasArea.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header userName="C" notificationCount={1} />
        <Routes>
          <Route path="/" element={<Navigate to="/jobsearch" replace />} />
          <Route path="/jobsearch" element={<Chatbot userId="User" />} />
          <Route path="/askasha" element={<Interview userId="User" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
