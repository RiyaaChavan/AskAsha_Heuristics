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

  // Format message text to highlight @resume tags
  const formatMessageText = (text: string) => {
    if (!text) return '';
    
    // Check if the text contains @resume
    if (text.includes('@resume')) {
      // Split by @resume and wrap it in highlighted span
      const parts = text.split('@resume');
      return (
        <>
          {parts.map((part, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="resume-tag">@resume</span>}
              {part}
            </React.Fragment>
          ))}
        </>
      );
    }
    
    return text;
  };  // For typing indicator, return a different component
  if (message.isLoading) {
    return (
      <div className="typing-indicator">
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
      </div>
    );
  }

  return (
    <div 
      className={`message-bubble ${message.canvasType !== 'none' ? 'with-canvas clickable' : ''} ${isUserMessage ? 'user-message' : ''} ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
    >
      <p>{formatMessageText(message.text)}</p>
      
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