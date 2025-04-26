import React from 'react';
import { Message } from './types';

interface ChatMessageProps {
  message: Message;
  index: number;
  selectMessage: (index: number) => void;
  isSelected: boolean;
  isUserMessage?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  index, 
  selectMessage, 
  isSelected,
  isUserMessage = false 
}) => {
  return (
    <div className={`message-bubble ${message.canvasType !== 'none' ? 'with-canvas' : ''} ${isUserMessage ? 'user-message' : ''}`}>
      <p>{message.text}</p>
      {message.canvasType !== 'none' && (
        <button 
          className={`view-canvas-button ${isSelected ? 'active' : ''}`} 
          onClick={() => selectMessage(index)}
        >
          {isSelected ? '👁️' : '👁️ View'} 
        </button>
      )}
    </div>
  );
};

export default ChatMessage;