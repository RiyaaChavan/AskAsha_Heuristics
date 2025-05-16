import React, { useRef, useState, useEffect } from 'react';
import ChatWindow from './ChatWindow';
import CanvasArea from './CanvasArea';
import { Message as AppMessage } from './types';
import ChatInput from './ChatInput';

// Type declarations for Speech Recognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: () => void;
  onerror: (event: any) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onstart: () => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionAlternative {
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface ChatbotAreaProps {
  userId: string;
}

const ChatbotArea: React.FC<ChatbotAreaProps> = ({ userId }) => {
  const [messages, setMessages] = useState<AppMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const [isLoadingResume, setIsLoadingResume] = useState<boolean>(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [isCanvasOpen, setIsCanvasOpen] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/conversations`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && data.conversations) {
          // Transform conversations into messages format
          const historyMessages: AppMessage[] = [];
          
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

  useEffect(() => {
    if (userId) {
      loadConversationHistory();
    }
  }, [userId]);

  // Speech recognition functions
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech Recognition not supported in your browser!');
      return;
    }

    const SpeechRecognitionAPI = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognitionAPI() as SpeechRecognition;
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => console.error('Speech recognition error:', event.error);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + ' ' + transcript);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);

      // Wait for voices to load
      if (speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          const voices = window.speechSynthesis.getVoices();
          const selectedVoice = voices.find(voice => 
            voice.lang.startsWith('en') && (voice.name.includes('Female') || voice.name.includes('Samantha'))
          ) || voices[0];
          
          utterance.voice = selectedVoice;
          utterance.rate = 1.0;
          window.speechSynthesis.speak(utterance);
        };
      } else {
        const voices = window.speechSynthesis.getVoices();
        const selectedVoice = voices.find(voice => 
          voice.lang.startsWith('en') && (voice.name.includes('Female') || voice.name.includes('Samantha'))
        ) || voices[0];
        
        utterance.voice = selectedVoice;
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } else {
      console.warn('Text-to-Speech not supported in this browser');
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    // Create user message object with all necessary properties
    const userMessage: AppMessage = { 
      id: messages.length, 
      text: input, 
      isUser: true,
      isUserMessage: true,
      canvasType: 'none' 
    };
    
    setMessages(prev => [...prev, userMessage]);    // Check if the message contains @resume to fetch and include profile data
    const containsResumeTag = input.includes('@resume');
    let resumeData = {};
    
    if (containsResumeTag && userId) {
      try {
        // Set loading state when fetching resume data
        setIsLoadingResume(true);
        
        // Add a temporary system message to show loading state
        const loadingMessage: AppMessage = {
          id: messages.length + 1,
          text: "Loading your resume data to provide personalized recommendations...",
          isUser: false,
          isUserMessage: false,
          canvasType: 'none',
          isLoading: true
        };
        
        setMessages(prev => [...prev, loadingMessage]);
        
        // Fetch the user's profile data containing resume information
        const profileRes = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/${userId}`, {
          credentials: 'include'
        });
        
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          // Extract skills and work experience for the context
          resumeData = {
            skills: profileData.skills || [],
            workExperience: profileData.work_experience || [],
            education: profileData.education || [],
            // Include other relevant profile data
            categorized_skills: profileData.categorized_skills || {}
          };
          
          // If no skills found, show a warning
          if (!resumeData.skills || resumeData.skills.length === 0) {
            console.warn("No skills found in user profile");
          }
          
          console.log("Retrieved resume data:", resumeData);
          
          // Remove the loading message
          setMessages(prev => prev.filter(msg => !msg.isLoading));
        } else {
          // If profile fetch fails, replace the loading message with an error
          setMessages(prev => 
            prev.map(msg => 
              msg.isLoading 
              ? {
                  ...msg,
                  text: "⚠️ Could not load resume data. Please make sure your profile is complete with skills and work experience.",
                  isLoading: false
                }
              : msg
            )
          );
          setIsLoadingResume(false);
          return;
        }
        
        setIsLoadingResume(false);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        
        // Replace the loading message with an error
        setMessages(prev => 
          prev.map(msg => 
            msg.isLoading 
            ? {
                ...msg,
                text: "⚠️ There was an error loading your resume data. Please try again later.",
                isLoading: false
              }
            : msg
          )
        );
        setIsLoadingResume(false);
        return;
      }
    }    // Clean up resume data to remove empty fields
    if (containsResumeTag && Object.keys(resumeData).length > 0) {
      const cleanedResumeData: any = {};
      
      // Only include non-empty arrays in the resume data
      Object.entries(resumeData).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          cleanedResumeData[key] = value;
        } else if (typeof value === 'object' && value !== null && Object.keys(value).length > 0) {
          cleanedResumeData[key] = value;
        }
      });
      
      resumeData = cleanedResumeData;
    }
    
    const payload = { 
      message: input, 
      userId,
      ...(containsResumeTag && Object.keys(resumeData).length > 0 && { resumeData }) // Include resume data only if it has content
    };
    
    // Remove any loading messages before sending the actual request
    if (containsResumeTag) {
      setMessages(prev => prev.filter(msg => !msg.isLoading));
    }
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      
      // Add bot response with all necessary properties
      const botMessage: AppMessage = {
        ...data,
        id: messages.length + 1,
        isUser: false,
        isUserMessage: false
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Speak the bot's response if it's text
      if (botMessage.text && !botMessage.text.includes('http')) {
        speakText(botMessage.text);
      }
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
    <div className="chatbot-container" style={{height: '100vh', display: 'flex', flexDirection: 'column'}}>
      {/* If Navbar is present, it will be at the top */}
      <div style={{flex: 1, display: 'flex', minHeight: 0}}>
        {/* ...rest of chatbot-main and children... */}
        <div className="chatbot-main">
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
      </div>
    </div>
  );
};

export default ChatbotArea;
