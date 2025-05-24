import React, { useEffect, useRef } from 'react';
import { ChatWindowProps } from './types';
import ChatMessage from './ChatMessage';

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, selectMessage, selectedMessageId }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  
  // Scroll to the bottom when messages change
  useEffect(() => {
    if (endOfMessagesRef.current && messages.length > 0) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);
  
  return (
    <div className="chat-window">
      {messages.map((msg, idx) => {
        return (
          <ChatMessage 
            key={idx} 
            message={msg} 
            index={idx}
            selectMessage={selectMessage}
            isSelected={selectedMessageId === idx}
            isUserMessage={msg.isUserMessage === true}
          />
        );
      })}
      <div ref={endOfMessagesRef} style={{ float: "left", clear: "both" }}></div>
    </div>
  );
};

export default ChatWindow;