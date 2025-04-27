import React from 'react';
import { ChatWindowProps } from './types';
import ChatMessage from './ChatMessage';

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, selectMessage, selectedMessageId }) => {
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
    </div>
  );
};

export default ChatWindow;