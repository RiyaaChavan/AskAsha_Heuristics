// Chatbot.tsx
import React, { useState, useEffect, useRef } from 'react';
// Import centralized CSS file
import './Chatbot/styles/index.css';
import ChatWindow from './Chatbot/ChatWindow';
import CanvasArea from './Chatbot/CanvasArea';
import ChatInput from './Chatbot/ChatInput';
import { Message, Payload } from './Chatbot/types';
import { sanitizeObject, isSqlSafe } from '../utils/apiUtils';

// Main Chatbot Component
const Chatbot: React.FC<{ userId: string }> = ({ userId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isCanvasOpen, setIsCanvasOpen] = useState(true);
  const [currentViewType, setCurrentViewType] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Function to scroll to the latest message with forced timing
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      // Force scroll with timeout to ensure it works
      setTimeout(() => {
        // Use scrollIntoView with block: 'end' to ensure it scrolls to the bottom
        messagesEndRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
        
        // Multiple backup scrolling methods
        if (chatContainerRef.current) {
          // Method 1: Using scrollTop directly
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
          
          // Method 2: Using scroll method
          chatContainerRef.current.scroll({
            top: chatContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
          
          // Method 3: Using setTimeout for a delayed scroll as last resort
          setTimeout(() => {
            chatContainerRef.current!.scrollTop = chatContainerRef.current!.scrollHeight;
          }, 50);
        }
      }, 100);
    }
  };

  // Auto-scroll when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

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
        },
        isLoading: false
      };
      
      setMessages([eventsMessage]);
      setSelectedMessageId(0);
      // Keep canvas closed initially for Event Hub
      setIsCanvasOpen(false);
      
      // Force scroll after content loads
      setTimeout(scrollToBottom, 200);
    }    else if (viewType === 'roadmap') {
      // Create a conversational response for roadmap
      const roadmapMessage: Message = {
        id: 0,
        text: 'What kind of career roadmap assistance do you need? I can help with planning your professional growth journey. Please ask me about specific career areas like "data science", "leadership", "UX design", or "returning to work" to get personalized roadmaps.',
        isUser: false,
        isUserMessage: false,
        canvasType: 'roadmap',
        isLoading: false,
        canvasUtils: {
          roadmap: [
            {
              title: 'Self-Assessment & Career Direction',
              description: 'Begin by assessing your current skills, interests, and career objectives. Create a detailed document that outlines your strengths, areas for growth, and specific goals you want to achieve. Conduct assessments using tools like Myers-Briggs Type Indicator or CliftonStrengths to identify your key motivators and preferred work environments. Research industry trends and career paths that align with your interests. Set SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound) for your career development journey.',
              link: 'https://www.themuse.com/advice/how-to-figure-out-what-you-want-next-in-your-career',
              calendar_event: 'Self-Assessment & Goal Setting'
            },
            {
              title: 'Skill Enhancement Planning',
              description: 'Identify key skills needed for your target roles by analyzing job descriptions, industry reports, and speaking with professionals in your desired field. Create a skills inventory comparing your current abilities with those required for your target positions. Develop a prioritized list of skills to develop, focusing on both technical and soft skills that will provide the greatest career advancement. Research courses, workshops, and certifications that can help you acquire these skills efficiently. Create a realistic timeline for skill development.',
              link: 'https://www.linkedin.com/learning',
              calendar_event: 'Skills Development Planning'
            },
            {
              title: 'Strategic Networking',
              description: 'Develop a networking plan to connect with professionals in your field. Join relevant online communities, professional associations, and industry-specific groups. Attend conferences, webinars, and events to expand your network. Create a compelling elevator pitch that clearly communicates your value proposition. Schedule informational interviews with professionals in roles you aspire to. Optimize your LinkedIn profile with keywords relevant to your target roles. Engage regularly by commenting on industry posts and sharing relevant content to build your professional reputation.',
              link: 'https://www.linkedin.com/feed/',
              calendar_event: 'Networking Strategy Session'
            },
            {
              title: 'Professional Brand Development',
              description: 'Develop a consistent professional brand that communicates your unique value. Update your LinkedIn profile, professional website, and other online platforms to reflect your brand positioning. Create a compelling professional narrative highlighting your journey and strengths. Update your resume using ATS-friendly techniques to highlight relevant skills and accomplishments. Create customizable cover letter templates for different roles. Develop a portfolio showcasing your best work and achievements. Consider creating content that demonstrates your expertise through blog posts, videos, or presentations.',
              link: 'https://www.themuse.com/advice/the-31-best-linkedin-profile-tips-for-job-seekers',
              calendar_event: 'Personal Brand Workshop'
            },
            {
              title: 'Continuous Growth & Development',
              description: 'Establish a long-term plan for ongoing professional development. Set regular intervals to reassess your career goals and progress. Join professional associations relevant to your field to stay updated on industry trends. Subscribe to key publications and follow thought leaders in your industry. Plan to obtain advanced certifications or degrees that will enhance your expertise and marketability. Seek leadership opportunities or stretch assignments in your current role. Create a system for documenting your achievements for future performance reviews and promotions.',
              link: 'https://hbr.org/topic/career-planning',
              calendar_event: 'Career Growth Planning'
            }
          ]
        }
      };
      
      // Set messages and reset canvas state
      setMessages([roadmapMessage]);
      setIsCanvasOpen(false);
      setSelectedMessageId(null);
      
      // Then, after a short delay, select the message and open canvas
      setTimeout(() => {
        setSelectedMessageId(0);
        
        // Open canvas after selection has been processed
        setTimeout(() => {
          setIsCanvasOpen(true);
        }, 100);
      }, 20);
      
      // Force scroll after content loads
      setTimeout(scrollToBottom, 200);
    }
    else {
      // Default to job search if no view type or jobs view type
      loadConversationHistory();
    }
  };

  // Handle selecting a message to display its canvas with more reliable canvas opening
  const selectMessage = (index: number) => {
    if (messages[index]?.canvasType !== 'none') {
      // First close canvas to reset rendering
      setIsCanvasOpen(false);
      
      // Wait a bit to ensure closed state is processed
      setTimeout(() => {
        // Then select the message
        setSelectedMessageId(index);
        
        // Wait for selection to be processed before opening
        setTimeout(() => {
          // Finally open the canvas
          setIsCanvasOpen(true);
        }, 150);
      }, 50);
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

  // Dedicated effect for handling new messages and canvas updates
  useEffect(() => {
    if (messages.length > 0) {
      // Find the last non-loading message
      const nonLoadingMessages = messages.filter(msg => !msg.isLoading);
      
      if (nonLoadingMessages.length > 0) {
        const lastMessage = nonLoadingMessages[nonLoadingMessages.length - 1];
        
        // Auto-select and open canvas for bot messages with canvas content
        if (!lastMessage.isUser && lastMessage.canvasType !== 'none') {
          const lastIndex = messages.findIndex(msg => msg === lastMessage);
          
          if (lastIndex !== -1) {
            // Use the same reliable pattern: close, select, then open
            // First close canvas to reset rendering
            setIsCanvasOpen(false);
            
            // Wait to ensure closed state is processed
            setTimeout(() => {
              // Then select the message
              setSelectedMessageId(lastIndex);
              
              // Wait for selection to be processed before opening
              setTimeout(() => {
                // Auto-open canvas except for events view
                const viewType = localStorage.getItem('viewType');
                if (viewType !== 'events') {
                  setIsCanvasOpen(true);
                }
              }, 200);
            }, 100);
          }
        }
      }
    }
  }, [messages]);

  // Load conversation history from the server
  const loadConversationHistory = async () => {
    if (!userId) return;
    
    setIsLoadingHistory(true);
    try {
      // Validate userId to prevent injection
      if (!isSqlSafe(userId)) {
        console.error("Potentially unsafe user ID");
        setIsLoadingHistory(false);
        return;
      }
      
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
                isUserMessage: false,
                isLoading: false
              });
            }

            historyMessages.push({ 
              text: convo.message, 
              canvasType: 'none',
              isHistory: true,
              isUserMessage: true,
              isLoading: false
            });
          });
          
          // Sort messages chronologically (oldest first)
          historyMessages.reverse();
          
          setMessages(historyMessages);
          
          // Force scroll to bottom after history loads
          setTimeout(scrollToBottom, 200);
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
      // Validate input to prevent injection
    if (!isSqlSafe(input)) {
      // Show error message if input contains potential SQL injection
      setMessages(prev => [
        ...prev,
        {
          id: messages.length + 1,
          text: 'Your message contains potentially unsafe characters. Please revise and try again.',
          isUser: false,
          isUserMessage: false,
          canvasType: 'none',
          isLoading: false
        }
      ]);
      
      // Force scroll to the error message
      setTimeout(scrollToBottom, 100);
      return;
    }
      // Create user message object 
    const userMessage: Message = { 
      id: messages.length, 
      text: input, 
      isUser: true,
      isUserMessage: true,
      canvasType: 'none',
      isLoading: false
    };
    
    // Store the input message before clearing
    const messageText = input;
    
    // Clear the input immediately
    setInput('');
    
    // Add user message and typing indicator - keeping original text without sanitization for display
    setMessages(prev => [
      ...prev, 
      {
        ...userMessage,
        text: input // Use the original input directly for display
      },
      {
        id: messages.length + 1,
        text: "",
        isLoading: true,
        isUser: false,
        isUserMessage: false,
        canvasType: 'none'
      }
    ]);
    
    // Force immediate scroll to new messages with multiple attempts
    scrollToBottom();
    // Try scrolling again after a delay in case the DOM hasn't updated yet
    setTimeout(scrollToBottom, 50);
    setTimeout(scrollToBottom, 150);
    setTimeout(scrollToBottom, 300);

    // Sanitize user inputs before sending to API
    // We sanitize for the API but keep the original text for display
    const sanitizedMessage = sanitizeObject(messageText);
    const sanitizedUserId = sanitizeObject(userId);
    
    const payload: Payload = { 
      message: sanitizedMessage, 
      userId: sanitizedUserId 
    };
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      
      // Remove loading message and add bot response
      // Ensure we don't display sanitized text (HTML entities) to the user
      const botMessage: Message = {
        ...data,
        id: messages.length + 2,
        isUser: false,
        isUserMessage: false,
        // If the text contains HTML entities, preserve them as they are rather than sanitizing
        text: data.text || ''
      };
      
      setMessages(prev => [
        ...prev.filter(m => !m.isLoading),
        botMessage
      ]);
      
      // Force scroll to bottom after new message is added
      setTimeout(scrollToBottom, 200);
    } catch (error) {
      console.error("Error sending message:", error);
        // Remove loading message and add error message
      setMessages(prev => [...prev.filter(m => !m.isLoading), { 
        id: messages.length + 2, 
        text: 'Error contacting server. Please try again.', 
        isUser: false, 
        isUserMessage: false,
        canvasType: 'none',
        isLoading: false
      }]);
      
      // Force scroll to the error message
      setTimeout(scrollToBottom, 100);
    }
  };

  return (
    <div className="chatbot-container">
      {isLoadingHistory && <div className="history-loading">...</div>}
      <div className="chatbot-main">
        <div className="chat-container" ref={chatContainerRef} style={{ overflowY: 'auto', maxHeight: '100%', position: 'relative' }}>
          <ChatWindow 
            messages={messages} 
            selectMessage={selectMessage} 
            selectedMessageId={selectedMessageId} 
          />
          <div ref={messagesEndRef} style={{ height: "20px", width: "100%", position: "relative", float: "left", clear: "both" }} />
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