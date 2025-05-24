import React, { useEffect, useState, useRef } from 'react';
import JobSearchCanvas from './JobSearchCanvas';
import RoadmapCanvas from './RoadmapCanvas';
import SessionCanvas from './SessionCanvas';

interface CanvasAreaProps {
  selectedMessageId: number | null;
  messages: any[];
  isOpen: boolean;
  toggleCanvas: () => void;
  clearSelectedMessage: () => void;
}

const CanvasArea: React.FC<CanvasAreaProps> = ({ 
  selectedMessageId, 
  messages, 
  isOpen,
  toggleCanvas,
  clearSelectedMessage 
}) => {
  const [activeMessage, setActiveMessage] = useState<any>(null);
  const [renderKey, setRenderKey] = useState<number>(0);
  const [canvasLoaded, setCanvasLoaded] = useState<boolean>(false);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Update the active message whenever selectedMessageId changes
  useEffect(() => {
    // Clear any existing timeout
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    
    // Reset loaded state
    setCanvasLoaded(false);
    
    if (selectedMessageId !== null && messages[selectedMessageId]) {
      // Generate a new render key to force complete remount
      setRenderKey(prev => prev + 1);
      
      // Set the active message
      setActiveMessage(messages[selectedMessageId]);
      
      // Mark as loaded after a delay to ensure rendering
      loadTimeoutRef.current = setTimeout(() => {
        setCanvasLoaded(true);
      }, 100);
    } else {
      setActiveMessage(null);
    }
    
    // Cleanup function
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [selectedMessageId, messages]);
  
  // Force re-render when isOpen changes
  useEffect(() => {
    if (isOpen) {
      setRenderKey(prev => prev + 1);
      
      // Mark as loaded after a delay
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      
      loadTimeoutRef.current = setTimeout(() => {
        setCanvasLoaded(true);
      }, 100);
    } else {
      setCanvasLoaded(false);
    }
  }, [isOpen]);
  
  const renderCanvas = () => {
    if (!activeMessage || activeMessage.canvasType === 'none') return null;
    
    // Only render if canvas should be loaded
    if (!canvasLoaded) {
      return <div className="canvas-loading">Loading canvas content...</div>;
    }
    
    // Force a unique key based on multiple factors to ensure re-rendering
    const canvasKey = `canvas-${renderKey}-${selectedMessageId}-${activeMessage.canvasType}`;
    
    switch (activeMessage.canvasType) {
      case 'job_search':
        return <JobSearchCanvas key={canvasKey} message={activeMessage} onClose={clearSelectedMessage} />;
      case 'roadmap':
        return <RoadmapCanvas key={canvasKey} message={activeMessage} onClose={clearSelectedMessage} />;
      case 'sessions':
      case 'session_search': // Handle both session types
        return <SessionCanvas key={canvasKey} message={activeMessage} onClose={clearSelectedMessage} />;
      default:
        return <div key={canvasKey} className="canvas-content">No content available for type: {activeMessage.canvasType}</div>;
    }
  };
  
  return (
    <div className={`canvas-area ${isOpen ? 'open' : 'closed'}`}>
      <div className="canvas-header">
        <button 
          className="canvas-toggle-button" 
          onClick={toggleCanvas}
          aria-label={isOpen ? "Close canvas" : "Open canvas"}
        >
          {isOpen ? '❮' : '❯'}
        </button>
      </div>
      <div className="canvas-content" key={`canvas-wrapper-${renderKey}`}>
        {isOpen && renderCanvas()}
      </div>
    </div>
  );
};

export default CanvasArea;