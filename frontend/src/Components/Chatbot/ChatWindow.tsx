import React, { useEffect, useRef, useCallback } from 'react';
import { ChatWindowProps } from './types';
import ChatMessage from './ChatMessage';

const ChatWindow: React.FC<ChatWindowProps> = React.memo(({ messages, selectMessage, selectedMessageId }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  
  // Scroll to the bottom when messages change
  useEffect(() => {
    if (endOfMessagesRef.current && messages.length > 0) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  // Memoize the selectMessage callback to prevent ChatMessage re-renders
  const memoizedSelectMessage = useCallback((index: number) => {
    selectMessage(index);
  }, [selectMessage]);
  
  return (
    <div className="chat-window">
      {messages.map((msg, idx) => {
        return (
          <ChatMessage 
            key={`${idx}-${msg.id || idx}`} // Better key for React reconciliation
            message={msg} 
            index={idx}
            selectMessage={memoizedSelectMessage}
            isSelected={selectedMessageId === idx}
            isUserMessage={msg.isUserMessage === true}
          />
        );
      })}
      <div ref={endOfMessagesRef} style={{ float: "left", clear: "both" }}></div>
    </div>
  );
});

// Add display name for debugging
ChatWindow.displayName = 'ChatWindow';

export default ChatWindow;