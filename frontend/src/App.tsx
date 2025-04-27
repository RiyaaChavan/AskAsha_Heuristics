import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Chatbot from './Components/Chatbot';
import Interview from './Components/Interview';

function App() {
  return (
    <div className="app-container">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/jobsearch" replace />} />
          <Route path="/jobsearch" element={<Chatbot />} />
          <Route path="/askasha" element={<Interview />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
