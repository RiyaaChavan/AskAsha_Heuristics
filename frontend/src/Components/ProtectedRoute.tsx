import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();
  const userId = localStorage.getItem('userId');

  // Show a loading state while auth is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if not authenticated via either Firebase or localStorage
  if (!currentUser && !userId) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};