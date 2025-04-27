import { useContext } from 'react'
import './App.css'
import Chatbot from './Components/Chatbot'
import Auth from './Components/Auth/Auth'
import { AuthProvider, AuthContext } from './context/AuthContext'

// Create an inner component that uses the AuthContext
const AppContent = () => {
  const { isAuthenticated, user, loading, logout } = useContext(AuthContext);
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return (
    <div className="app-container">
      {isAuthenticated && user ? (
        <div className="authenticated-container">
          <div className="user-header">
            <span>Welcome, {user.username}</span>
            <button className="logout-button" onClick={logout}>Logout</button>
          </div>
          <Chatbot userId={user._id} />
        </div>
      ) : (
        <Auth />
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App
