import React from 'react';
import { CanvasAreaProps } from './types';
import Canvas from './Canvas';

const CanvasArea: React.FC<CanvasAreaProps> = ({ messages, selectedMessageId }) => {
  return (
    <div className="canvas-area">
      {selectedMessageId !== null && messages[selectedMessageId]?.canvasType !== 'none' && (
        <Canvas message={messages[selectedMessageId]} />
      )}
    </div>
  );
};

export default CanvasArea;