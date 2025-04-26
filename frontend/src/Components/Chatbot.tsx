// Chatbot.tsx
import React, { useState, useEffect } from 'react';
import './Chatbot.css';
import ChatWindow from './Chatbot/ChatWindow';
import CanvasArea from './Chatbot/CanvasArea';
import ChatInput from './Chatbot/ChatInput';
import { Message, Payload } from './Chatbot/types';

// Main Chatbot Component
const Chatbot: React.FC<{ userId: string }> = ({ userId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);

  // Handle selecting a message to display its canvas
  const selectMessage = (index: number) => {
    setSelectedMessageId(index);
  };

  // Auto-select new messages with canvases
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.canvasType !== 'none') {
        setSelectedMessageId(messages.length - 1);
      }
    }
  }, [messages.length]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { text: input, canvasType: 'none' };
    setMessages(prev => [...prev, userMessage]);

    const payload: Payload = { message: input, userId };
    try {
      const res = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data: Message = await res.json();
      setMessages(prev => [...prev, data]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { text: 'Error contacting server.', canvasType: 'none' }]);
    }
    setInput('');
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-main">
        <div className="chat-container">
          <ChatWindow 
            messages={messages} 
            selectMessage={selectMessage} 
            selectedMessageId={selectedMessageId} 
          />
          <ChatInput input={input} setInput={setInput} sendMessage={sendMessage} />
        </div>
        <CanvasArea 
          messages={messages} 
          selectedMessageId={selectedMessageId} 
        />
      </div>
    </div>
  );
};

export default Chatbot;
