import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/signup`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, email, password })
      });
      
      if (!response.ok) {
        if (response.status === 0) {
          // Network error - could be CORS or connectivity issue
          if (retryCount < MAX_RETRIES) {
            setRetryCount(prev => prev + 1);
            setError(`Connection issue. Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
            setLoading(false);
            
            // Wait a moment before retrying
            setTimeout(() => {
              handleSignup(e);
            }, 1500);
            return;
          } else {
            throw new Error('Network error: Unable to connect to the server. This might be due to a temporary server issue or a CORS configuration problem. Please try again later.');
          }
        }
        
        // Try to parse error response
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        
        throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.status === 'success') {
        localStorage.setItem('userId', data.user_id || '');
        localStorage.setItem('email', email);
        localStorage.setItem('profileCreated', 'true');
        
        if (data.token) {
          localStorage.setItem('jwt', data.token);
        }
        
        // Success - redirect to profile setup
        navigate('/profile-setup');
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Network error: Failed to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="right-section">
          <h2 className="welcome-text">Sign Up</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSignup}>
            <input
              type="text"
              placeholder="Name"
              className="input-field"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="input-field"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="input-field"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button className="signin-button" type="submit" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
          <p className="signup-text">
            Already have an account?{' '}
            <a href="/login" className="signup-link" onClick={e => { e.preventDefault(); navigate('/login'); }}>
              Log In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
