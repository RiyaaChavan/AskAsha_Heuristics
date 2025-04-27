import React from 'react';
import { CanvasProps } from './types';
import JobSearchCanvas from './JobSearchCanvas';
import RoadmapCanvas from './RoadmapCanvas';

const Canvas: React.FC<CanvasProps> = ({ message }) => {
  // This is a factory component that renders the appropriate canvas based on the type
  switch (message.canvasType) {
    case 'job_search':
      return <JobSearchCanvas message={message} />;
    case 'roadmap':
      return <RoadmapCanvas message={message} />;
    default:
      return null;
  }
};

export default Canvas;