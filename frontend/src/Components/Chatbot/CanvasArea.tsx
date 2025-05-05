import React from 'react';
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
  const message = selectedMessageId !== null ? messages[selectedMessageId] : null;
  
  const renderCanvas = () => {
    if (!message || message.canvasType === 'none') return null;
    
    switch (message.canvasType) {
      case 'job_search':
        return <JobSearchCanvas message={message} onClose={clearSelectedMessage} />;
      case 'roadmap':
        return <RoadmapCanvas message={message} onClose={clearSelectedMessage} />;
      case 'session_search':
        return <SessionCanvas message={message} onClose={clearSelectedMessage} />;
      default:
        return <div className="canvas-content">No content available</div>;
    }
  };
  
  return (
    <div className={`canvas-area ${isOpen ? 'open' : 'closed'}`}>
      <div className="canvas-header">
        <h2>Details</h2>
        <button 
          className="canvas-toggle-button" 
          onClick={toggleCanvas}
          aria-label={isOpen ? "Close panel" : "Open panel"}
        >
          <span className="toggle-icon">
            {isOpen ? '›' : '‹'}
          </span>
        </button>
      </div>
      {isOpen && (
        <div className="canvas-content">
          {renderCanvas()}
        </div>
      )}
    </div>
  );
};

export default CanvasArea;