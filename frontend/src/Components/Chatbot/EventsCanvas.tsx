interface CanvasProps {
  message: {
    isLoading: boolean;
    error?: string;
    data?: any; // Replace with proper event data interface
  };
}

const EventsCanvas: React.FC<CanvasProps> = ({ message }) => {
  // Show loading state when there's no event data yet
  if (message.isLoading) {
    return (
      <div className="canvas-panel events-canvas">
        <div className="canvas-header">
          <h3>Event Hub</h3>
        </div>
        <div className="events-loading">
          <div className="events-loading-text">
            Discovering exciting events and workshops...
          </div>
          <div className="events-loading-indicator" aria-label="Loading">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  if (message.error) {
    return (
      <div className="canvas-panel events-canvas">
        <div className="canvas-header">
          <h3>Event Hub</h3>
        </div>
        <div className="events-error">
          <p>Sorry, we couldn't load the events. {message.error}</p>
        </div>
      </div>
    );
  }

  // Rest of the component remains the same...
};

export default EventsCanvas;