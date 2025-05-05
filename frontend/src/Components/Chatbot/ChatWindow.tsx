import React, { useEffect, useRef } from 'react';
import { ChatWindowProps } from './types';
import ChatMessage from './ChatMessage';

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, selectMessage, selectedMessageId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chat-window">
      {messages.map((msg, idx) => (
        <ChatMessage 
          key={idx} 
          message={msg} 
          index={idx}
          selectMessage={selectMessage}
          isSelected={selectedMessageId === idx}
          isUserMessage={msg.isUserMessage === true}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatWindow;