import { useEffect } from 'react';

const DebugInfo = () => {
  useEffect(() => {
    console.log('Debug info:');
    console.log('API URL:', import.meta.env.VITE_API_URL);
    console.log('User ID in localStorage:', localStorage.getItem('userId'));
    console.log('Profile created flag:', localStorage.getItem('profileCreated'));
  }, []);

  return null;
};

export default DebugInfo;