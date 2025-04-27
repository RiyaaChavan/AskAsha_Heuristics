import React from 'react';
import { CanvasProps, RoadmapItem } from './types';

const RoadmapCanvas: React.FC<CanvasProps> = ({ message, onClose }) => {
  // Early return if no roadmap data is available
  if (!message.canvasUtils?.roadmap || !Array.isArray(message.canvasUtils.roadmap)) {
    return (
      <div className="canvas-panel roadmap-canvas">
        <div className="canvas-header">
          <h3>Career Roadmap</h3>
        </div>
        <p>No roadmap data available.</p>
      </div>
    );
  }

  const roadmapItems: RoadmapItem[] = message.canvasUtils.roadmap;

  return (
    <div className="canvas-panel roadmap-canvas">
      <div className="canvas-header">
        <h3>Career Roadmap</h3>
      </div>
      
      <div className="roadmap-container">
        {roadmapItems.map((item, index) => (
          <div key={index} className={`roadmap-item ${index % 2 === 0 ? 'roadmap-item-right' : 'roadmap-item-left'}`}>
            <div className="roadmap-item-content">
              <h4 className="roadmap-item-title">{item.title}</h4>
              <p className="roadmap-item-description">{item.description}</p>
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="roadmap-item-link"
              >
                LEARN MORE
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoadmapCanvas;