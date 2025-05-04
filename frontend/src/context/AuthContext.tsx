import { createContext, useState, useEffect, ReactNode } from 'react';

interface User {
  _id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Create the context with a default value
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => false,
  signup: async () => false,
  logout: () => {},
});

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await fetch('https://askasha.onrender.com/api/user', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Important for cookies/session
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'success') {
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error('Authentication check failed', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('https://askasha.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      if (data.status === 'success') {
        // Fetch user data
        const userRes = await fetch('https://askasha.onrender.com/api/user', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        
        const userData = await userRes.json();
        if (userData.status === 'success') {
          setUser(userData.user);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Login failed', error);
      return false;
    }
  };

  // Signup function
  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('https://askasha.onrender.com/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, email, password }),
      });
      
      const data = await res.json();
      if (data.status === 'success') {
        // Fetch user data
        const userRes = await fetch('https://askasha.onrender.com/api/user', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        
        const userData = await userRes.json();
        if (userData.status === 'success') {
          setUser(userData.user);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Signup failed', error);
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch('https://askasha.onrender.com/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      
      setUser(null);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};