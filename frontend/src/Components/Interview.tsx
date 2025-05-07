import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, ArrowLeft, Search } from 'lucide-react';
import './Chatbot/styles/Interview.css';
import './Chatbot/styles/ChatInput.css';
import createSpeechRecognition from '../utils/speechRecognition';

// Use environment variable API_URL
const API_URL = `${import.meta.env.VITE_API_URL}/api`;

interface InterviewProps {
  userId?: string;
}

interface Message {
  id: number;
  text: string;
  sender: string;
}

interface SpeechRecognition {
  isSupported: boolean;
  start: (onResult: (transcript: string) => void, onError: (error: string) => void) => void;
  stop: () => void;
}

const Interview: React.FC<InterviewProps> = ({ userId: propUserId }) => {
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>(propUserId || 'user_' + Math.random().toString(36).substr(2, 9)); // Generate a default random user ID
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Initialize speech recognition
  useEffect(() => {
    speechRecognitionRef.current = createSpeechRecognition();
    return () => {
      // Cleanup speech recognition if active when component unmounts
      if (speechRecognitionRef.current && typeof speechRecognitionRef.current.stop === 'function') {
        speechRecognitionRef.current.stop();
      }
      
      // Cleanup any ongoing speech synthesis
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  
  // Handle voice input
  const handleVoiceInput = () => {
    if (!speechRecognitionRef.current?.isSupported) {
      alert("Speech recognition is not supported in your browser. Please try Chrome, Edge, or Safari.");
      return;
    }
    
    setIsListening(true);
    
    speechRecognitionRef.current.start(
      // onResult callback
      (transcript) => {
        setInputText(transcript);
        setIsListening(false);
      },
      // onError callback
      (error) => {
        console.error("Speech recognition error:", error);
        setIsListening(false);
        if (error === 'no-speech') {
          alert("No speech was detected. Please try again.");
        }
      }
    );
  };
  
  // Handle text to speech for bot messages
  const speakText = (text: string) => {
    // First, stop any ongoing speech
    window.speechSynthesis.cancel();
    
    // Clean text from HTML tags
    const cleanText = text.replace(/<[^>]*>?/gm, '');
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Set preferred voice (optional)
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Female') || 
      voice.name.includes('Samantha') || 
      voice.name.includes('Google UK English Female')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    // Set properties
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    // Set event handlers
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setIsSpeaking(false);
    };
    
    // Store reference
    speechSynthesisRef.current = utterance;
    
    // Speak
    window.speechSynthesis.speak(utterance);
  };
  
  // Stop speaking
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };
  
  const chatOptions = [
    { id: 'career', title: 'Career Coach', description: 'Get guidance on career paths and growth opportunities' },
    { id: 'interview', title: 'Job Interview Prep', description: 'Practice interview questions and get feedback' },
  ];

  const startChatSession = async (chatType: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/start-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatType,
          userId,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSessionId(data.sessionId);
        setCurrentChat(chatType);

        const initialMessages = data.messageHistory || [];
        let welcomeMessage;
        
        if (chatType === 'interview') {
          welcomeMessage = "Hi there! I'm your interview preparation assistant. I can help you practice interview questions, provide feedback on your answers, and share tips for impressing recruiters. What type of interview would you like to prepare for today?";
        } else if (chatType === 'career') {
          welcomeMessage = "Welcome! I'm your career coach. I can help you navigate your career journey, explore growth opportunities, or discuss salary negotiations. What career topic would you like to discuss today?";
        } else {
          welcomeMessage = "Hello! How can I assist you today?";
        }
        
        const messagesToDisplay = initialMessages.length > 0 
          ? [
              {
                id: Date.now(),
                text: welcomeMessage,
                sender: 'bot',
              },
              ...initialMessages,
            ]
          : [
              {
                id: Date.now(),
                text: welcomeMessage,
                sender: 'bot',
              },
            ];

        setMessages(messagesToDisplay);
      } else {
        console.error('Failed to start session:', data.error);
      }
    } catch (error) {
      console.error('Error starting session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !sessionId) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message: inputText,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Check if the message contains search notification
        if (data.didSearch) {
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            text: '🔍 Searching for information...',
            sender: 'system',
          }]);
        }
        
        // Add bot's response after a short delay if search was performed
        setTimeout(() => {
          const botMessage = {
            id: Date.now() + 2,
            text: data.message,
            sender: 'bot',
          };
          
          setMessages(prev => [...prev.filter(msg => msg.sender !== 'system'), botMessage]);
          
          // Optional: Speak the response
          // speakText(data.message);
        }, data.didSearch ? 1000 : 0);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: 'Sorry, there was an error processing your request.',
        sender: 'system',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container-interview">
      <div className="chat-options-interview">
        <div className="header-interview">
          <h1>Ask Asha</h1>
          <p>Women's Career and Interview Assistant</p>
        </div>
        
        {!currentChat && (
          <div className="chat-cards-interview">
            {chatOptions.map(option => (
              <div 
                key={option.id}
                className="chat-card-interview" 
                onClick={() => startChatSession(option.id)}
              >
                <h3>{option.title}</h3>
                <p>{option.description}</p>
                <MessageSquare className="icon" />
              </div>
            ))}
          </div>
        )}
        
        {currentChat && (
          <div className="chat-window-interview">
            <div className="chat-header-interview">
              <button className="back-button" onClick={() => {
                setCurrentChat(null);
                setSessionId(null);
                setMessages([]);
              }}>
                <ArrowLeft />
                Back
              </button>
              <h2>
                {currentChat === 'career' ? 'Career Coach' : 'Interview Prep'}
              </h2>
            </div>
            
            <div className="messages-interview">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`message ${message.sender === 'user' ? 'user' : 'bot'}`}
                >
                  <div 
                    className="message-content"
                    dangerouslySetInnerHTML={{ __html: message.text }}
                  />
                  
                  {message.sender === 'bot' && (
                    <div className="message-actions">
                      {isSpeaking ? (
                        <button onClick={stopSpeaking} className="speak-button">
                          Stop Speaking
                        </button>
                      ) : (
                        <button onClick={() => speakText(message.text)} className="speak-button">
                          Speak
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="message bot">
                  <div className="message-content loading">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                </div>
              )}
            </div>
            
            <form onSubmit={handleSendMessage} className="input-form-interview">
              <div className="input-container-interview">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isLoading}
                />
                
                <button 
                  type="button" 
                  onClick={handleVoiceInput}
                  disabled={isLoading || isListening}
                  className={`voice-button ${isListening ? 'listening' : ''}`}
                >
                  {isListening ? 'Listening...' : 'Voice'}
                </button>
                
                <button 
                  type="submit" 
                  disabled={isLoading || !inputText.trim()}
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Interview;