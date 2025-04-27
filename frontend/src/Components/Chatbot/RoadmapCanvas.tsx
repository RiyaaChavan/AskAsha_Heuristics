// filepath: d:\Code\herkey\frontend\src\Components\Chatbot\RoadmapCanvas.tsx
import React from 'react';
import { CanvasProps, RoadmapItem } from './types';

const RoadmapCanvas: React.FC<CanvasProps> = ({ message }) => {
  // Early return if no roadmap data is available
  if (!message.canvasUtils?.roadmap || !Array.isArray(message.canvasUtils.roadmap)) {
    return (
      <div className="canvas-panel roadmap-canvas">
        <h3>Career Roadmap</h3>
        <p>No roadmap data available.</p>
      </div>
    );
  }

  const roadmapItems: RoadmapItem[] = message.canvasUtils.roadmap;

  return (
    <div className="canvas-panel roadmap-canvas">
      <h3>Career Roadmap</h3>
      
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
            {/* <div className="roadmap-circle"></div>
            {index < roadmapItems.length - 1 && (
              <div className="roadmap-connector"></div>
            )}
            <div className="roadmap-arrow"></div> */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoadmapCanvas;