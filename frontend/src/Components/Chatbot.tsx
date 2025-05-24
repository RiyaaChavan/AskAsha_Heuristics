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
  const [currentViewType, setCurrentViewType] = useState<string | null>(null);

  // Monitor localStorage for viewType changes
  useEffect(() => {
    const handleStorageChange = () => {
      const viewType = localStorage.getItem('viewType');
      
      // If viewType changed, update the UI
      if (viewType !== currentViewType) {
        setCurrentViewType(viewType);
        loadViewContent(viewType);
      }
    };

    // Check for view type on mount
    const viewType = localStorage.getItem('viewType');
    setCurrentViewType(viewType);
    loadViewContent(viewType);

    // Listen for localStorage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Set up an interval to check for localStorage changes
    // This is needed because the storage event doesn't fire in the same window that made the change
    const interval = setInterval(() => {
      const viewType = localStorage.getItem('viewType');
      if (viewType !== currentViewType) {
        setCurrentViewType(viewType);
        loadViewContent(viewType);
      }
    }, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [currentViewType]);

  // Load content based on the view type
  const loadViewContent = (viewType: string | null) => {
    if (viewType === 'events') {
      // Create a conversational response for events
      const eventsMessage: Message = {
        id: 0,
        text: 'How can I help you find relevant events or workshops? I can suggest upcoming sessions based on your interests.',
        isUser: false,
        isUserMessage: false,
        canvasType: 'session_search', // Changed from 'sessions' to 'session_search' to match type definition
        canvasUtils: {
          session_link: 'https://api-prod.herkey.com/api/v1/discussions/filter/top?page_number=1&page_size=20',
        }
      };
      
      setMessages([eventsMessage]);
      setSelectedMessageId(0);
      // Keep canvas closed initially for Event Hub
      setIsCanvasOpen(false);
    } 
    else if (viewType === 'roadmap') {
      // Create a conversational response for roadmap
      const roadmapMessage: Message = {
        id: 0,
        text: 'What kind of career roadmap assistance do you need? I can help with planning your professional growth journey.',
        isUser: false,
        isUserMessage: false,
        canvasType: 'roadmap',
        canvasUtils: {
          roadmap: [
            {
              title: 'Build Your Foundation',
              description: 'Focus on core skills and fundamentals of your field.',
              link: 'https://www.herkey.com/learn/foundation-skills'
            },
            {
              title: 'Gain Practical Experience',
              description: 'Apply your skills through internships or projects.',
              link: 'https://www.herkey.com/jobs/internships'
            },
            {
              title: 'Expand Your Network',
              description: 'Connect with professionals in your industry.',
              link: 'https://www.herkey.com/network'
            },
            {
              title: 'Develop Specialized Skills',
              description: 'Focus on niche areas that interest you.',
              link: 'https://www.herkey.com/learn/specialized-skills'
            }
          ]
        }
      };
      
      setMessages([roadmapMessage]);
      setSelectedMessageId(0);
      setIsCanvasOpen(true);
    }
    else {
      // Default to job search if no view type or jobs view type
      loadConversationHistory();
    }
  };

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

  // Auto-select new messages with canvases, but respect the events hub exception
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.canvasType !== 'none') {
        setSelectedMessageId(messages.length - 1);
        
        // Don't auto-open canvas for events view
        const viewType = localStorage.getItem('viewType');
        if (viewType !== 'events') {
          setIsCanvasOpen(true);
        }
      }
    }
  }, [messages.length]);

  // Load conversation history from the server
  const loadConversationHistory = async () => {
    if (!userId) return;
    
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/conversations?user_id=${userId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      
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
    
    // Create user message object 
    const userMessage: Message = { 
      id: messages.length, 
      text: input, 
      isUser: true,
      isUserMessage: true,
      canvasType: 'none' 
    };
      // Store the input message before clearing
    const messageText = input;
    
    // Clear the input immediately
    setInput('');
    
    // Add user message and typing indicator
    setMessages(prev => [
      ...prev, 
      userMessage,
      {
        id: messages.length + 1,
        text: "",
        isLoading: true,
        isUser: false,
        isUserMessage: false,
        canvasType: 'none'
      }
    ]);

    const payload: Payload = { message: messageText, userId };
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      
      // Remove loading message and add bot response
      const botMessage: Message = {
        ...data,
        id: messages.length + 2,
        isUser: false,
        isUserMessage: false
      };
      
      setMessages(prev => [...prev.filter(m => !m.isLoading), botMessage]);
    } catch (err) {
      console.error(err);
      
      // Remove loading message and add error message
      setMessages(prev => [...prev.filter(m => !m.isLoading), { 
        id: messages.length + 2, 
        text: 'Error contacting server.', 
        isUser: false, 
        isUserMessage: false,
        canvasType: 'none' 
      }]);
    }
  };

  return (
    <div className="chatbot-container">
      {isLoadingHistory && <div className="history-loading">...</div>}
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
