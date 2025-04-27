import React from 'react';
import { ChatWindowProps } from './types';
import ChatMessage from './ChatMessage';

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, selectMessage, selectedMessageId }) => {
  return (
    <div className="chat-window">
      {messages.map((msg, idx) => {
        // Determine if it's a user message (even-indexed) or bot message (odd-indexed)
        // This assumes the pattern starts with a user message followed by a bot response
        const isUserMessage = idx % 2 === 0;
        
        return (
          <ChatMessage 
            key={idx} 
            message={msg} 
            index={idx}
            selectMessage={selectMessage}
            isSelected={selectedMessageId === idx}
            isUserMessage={isUserMessage}
          />
        );
      })}
    </div>
  );
};

export default ChatWindow;