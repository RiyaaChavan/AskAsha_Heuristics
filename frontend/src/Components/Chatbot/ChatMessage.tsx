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
  // Function to handle clicking on the message bubble
  const handleClick = () => {
    if (message.canvasType !== 'none') {
      selectMessage(index);
    }
  };

  return (
    <div 
      className={`message-bubble ${message.canvasType !== 'none' ? 'with-canvas clickable' : ''} ${isUserMessage ? 'user-message' : ''} ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
    >
      <p>{message.text}</p>
      {isSelected && message.canvasType !== 'none' && (
        <button 
          className="minimize-button"
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the parent div's onClick
            selectMessage(index);
          }}
        >
          <span role="img" aria-label="minimize">▼</span>
        </button>
      )}
    </div>
  );
};

export default ChatMessage;