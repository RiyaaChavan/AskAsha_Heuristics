// Chatbot.tsx
import React, { useState, useEffect } from 'react';
// Import centralized CSS file
import './Chatbot/styles/index.css';
import ChatWindow from './Chatbot/ChatWindow';
import CanvasArea from './Chatbot/CanvasArea';
import ChatInput from './Chatbot/ChatInput';
import { Message, Payload } from './Chatbot/types';

// Main Chatbot Component
const Chatbot: React.FC<{ userId: string }> = ({ userId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isCanvasOpen, setIsCanvasOpen] = useState(true);

  // Load past conversations when component mounts or userId changes
  useEffect(() => {
    if (userId) {
      loadConversationHistory();
    }
  }, [userId]);

  // Handle selecting a message to display its canvas
  const selectMessage = (index: number) => {
    if (messages[index].canvasType !== 'none') {
      setSelectedMessageId(index);
      setIsCanvasOpen(true); // Open canvas when selecting a message
    }
  };

  // Toggle canvas open/closed state
  const toggleCanvas = () => {
    setIsCanvasOpen(prev => !prev);
    // If canvas is being closed, deselect message
    if (isCanvasOpen) {
      setSelectedMessageId(null);
    }
  };
  
  // Function to clear the selected message (close the canvas)
  const clearSelectedMessage = () => {
    setSelectedMessageId(null);
  };

  // Auto-select new messages with canvases
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.canvasType !== 'none') {
        setSelectedMessageId(messages.length - 1);
        setIsCanvasOpen(true); // Make sure canvas is open for new messages with canvas
      }
    }
  }, [messages.length]);

  // Load conversation history from the server
  const loadConversationHistory = async () => {
    if (!userId) return;
    
    setIsLoadingHistory(true);
    try {
      const res = await fetch('https://askasha.onrender.com/api/conversations', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && data.conversations) {
          // Transform conversations into messages format
          const historyMessages: Message[] = [];
          
          data.conversations.forEach((convo: any) => {
            if (convo.response) {
              historyMessages.push({
                text: convo.response.text,
                canvasType: convo.response.canvasType,
                canvasUtils: convo.response.canvasUtils,
                isHistory: true,
                isUserMessage: false
              });
            }

            historyMessages.push({ 
              text: convo.message, 
              canvasType: 'none',
              isHistory: true,
              isUserMessage: true
            });
          });
          
          // Sort messages chronologically (oldest first)
          historyMessages.reverse();
          
          setMessages(historyMessages);
        }
      }
    } catch (error) {
      console.error("Error loading conversation history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    // Create user message object with all necessary properties
    const userMessage: Message = { 
      id: messages.length, 
      text: input, 
      isUser: true,
      isUserMessage: true,
      canvasType: 'none' 
    };
    
    setMessages(prev => [...prev, userMessage]);

    const payload: Payload = { message: input, userId };
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      
      // Add bot response with all necessary properties
      const botMessage: Message = {
        ...data,
        id: messages.length + 1,
        isUser: false,
        isUserMessage: false
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      
      // Add error message with all necessary properties
      setMessages(prev => [...prev, { 
        id: messages.length + 1, 
        text: 'Error contacting server.', 
        isUser: false, 
        isUserMessage: false,
        canvasType: 'none' 
      }]);
    }
    
    setInput('');
  };

  return (
    <div className="chatbot-container">
      {isLoadingHistory && <div className="history-loading">Loading conversation history...</div>}
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
          isOpen={isCanvasOpen}
          toggleCanvas={toggleCanvas}
          clearSelectedMessage={clearSelectedMessage}
        />
      </div>
    </div>
  );
};

export default Chatbot;
