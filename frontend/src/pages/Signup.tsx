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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        localStorage.setItem('userId', data.user_id || '');
        localStorage.setItem('profileCreated', 'true');
        
        if (data.token) {
          localStorage.setItem('jwt', data.token);
          localStorage.setItem('userId', data.user_id || '');
        }
        navigate('/profile-setup');
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err: any) {
      setError(err.message || 'Signup failed');
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
