import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Chatbot from './Components/Chatbot';
import Interview from './Components/Interview';
import Header from './Components/Header';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header userName="C" notificationCount={1} />
        <Routes>
          <Route path="/" element={<Navigate to="/jobsearch" replace />} />
          <Route path="/jobsearch" element={<Chatbot />} />
          <Route path="/askasha" element={<Interview />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
