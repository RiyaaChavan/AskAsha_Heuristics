import React from 'react';
import { CanvasProps, Message } from './types';
import JobSearchCanvas from './JobSearchCanvas';
import RoadmapCanvas from './RoadmapCanvas';
import EventsCanvas from './EventsCanvas';

interface ExtendedCanvasProps extends CanvasProps {
  onCalendarRequest?: (items: any[]) => void;
}

const Canvas: React.FC<ExtendedCanvasProps> = ({ message, onCalendarRequest }) => {
  if (!message.canvasType || message.canvasType === 'none') {
    return null;
  }

  switch (message.canvasType) {
    case 'job_search':
      return <JobSearchCanvas message={message} />;
    case 'roadmap':
      return <RoadmapCanvas message={message} onCalendarRequest={onCalendarRequest} />;
    case 'events':
      return <EventsCanvas message={message} />;
    default:
      return null;
  }
};

export default Canvas;