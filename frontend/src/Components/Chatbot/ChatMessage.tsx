import React, { useEffect } from 'react';
import { Message } from './types';
import { marked } from 'marked';

// Configure marked options for security and rendering
marked.setOptions({
  breaks: true, // Convert line breaks to <br>
  gfm: true // Use GitHub Flavored Markdown
});

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
  };  // Format message text to highlight @resume tags and render markdown
  const formatMessageText = (text: string) => {
    if (!text) return '';
    
    // Don't process markdown for user messages
    if (isUserMessage) {
      return text;
    }
    
    // Check if the text contains @resume
    if (text.includes('@resume')) {
      // Split by @resume and wrap it in highlighted span
      const parts = text.split('@resume');
      return (
        <>
          {parts.map((part, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="resume-tag">@resume</span>}
              <span dangerouslySetInnerHTML={{ __html: marked(part) }} />
            </React.Fragment>
          ))}
        </>
      );
    }
    
    // For non-user messages (bot responses), process with markdown
    try {
      const renderedHtml = marked(text);
      return <span className="markdown-content" dangerouslySetInnerHTML={{ __html: renderedHtml }} />;
    } catch (error) {
      console.error('Error rendering markdown:', error);
      // Fallback to plain text if markdown parsing fails
      return <span>{text}</span>;
    }
  };

  // For typing indicator, return a different component
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
      <div className="message-content">
        {formatMessageText(message.text)}
      </div>
      
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