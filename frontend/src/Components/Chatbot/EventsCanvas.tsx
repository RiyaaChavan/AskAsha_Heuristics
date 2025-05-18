// Inside the EventsCanvas component
const EventsCanvas: React.FC<CanvasProps> = ({ message }) => {
  // ... existing code ...

  // Show loading state when there's no event data yet
  if (message.isLoading) {
    return (
      <div className="canvas-panel events-canvas">
        <div className="canvas-header">
          <h3>Event Hub</h3>
        </div>
        <div className="events-loading">
          <div className="events-loading-text">Discovering exciting events and workshops...</div>
          <div className="events-loading-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }
  
  // Rest of the component remains the same...