import { useEffect } from 'react';

const KeepAlive = () => {
  useEffect(() => {
    const pingServer = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        await fetch(`${API_URL}/api/health`);
        console.log("Backend pinged successfully");
      } catch (error) {
        console.log("Failed to ping backend");
      }
    };
    
    // Ping immediately when component mounts
    pingServer();
    
    // Then ping every 5 minutes
    const interval = setInterval(pingServer, 300000);
    
    return () => clearInterval(interval);
  }, []);
  
  return null;
};

export default KeepAlive;