import { useState, useEffect, useRef } from 'react';
import { MessageSquare, ArrowLeft, Search } from 'lucide-react';
import './Chatbot/styles/Interview.css'; // Import the CSS file
import './Chatbot/styles/ChatInput.css'; // Import the ChatInput styles
import createSpeechRecognition from '../utils/speechRecognition';

const API_URL = import.meta.env.VITE_API_URL;

export default function Interview() {
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState('user_' + Math.random().toString(36).substr(2, 9)); // Generate a default random user ID
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechRecognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  
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
  const speakText = (text) => {
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

const startChatSession = async (chatType) => {
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


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !sessionId) return;    // Store input text before clearing
    const messageToSend = inputText;
    
    const userMessage = {
      id: Date.now(),
      text: messageToSend,
      sender: 'user',
    };

    // Clear input immediately when the user sends a message
    setInputText('');
    
    setMessages([...messages, userMessage]);
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
      
      const data = await response.json();
      if (response.ok) {
        if (data.didSearch) {
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            text: '🔍 I\'m finding some great resources for you! Just a moment while I gather some helpful information...',
            sender: 'system',
            isSearchNotification: true
          }]);
        }

        setTimeout(() => {
          // Enhanced message handling for events/workshops queries
          let enhancedMessage = data.message;
          
          // More human-like and varied responses for session-related queries
          if (inputText.toLowerCase().includes('event') || 
              inputText.toLowerCase().includes('workshop') || 
              inputText.toLowerCase().includes('webinar') || 
              inputText.toLowerCase().includes('session')) {
                
            // Create varied responses based on the specific query
            const responses = [
              "I've found some exciting events just for you! ",
              "Great news! Here are some upcoming events that match your interests: ",
              "Perfect timing! I've discovered these relevant events for you: ",
              "You might be interested in these upcoming opportunities: ",
              "I've curated these exciting events especially for you: "
            ];
            
            const randomIndex = Math.floor(Math.random() * responses.length);
            enhancedMessage = responses[randomIndex] + enhancedMessage;
          }
          
          const botMessage = {
            id: Date.now() + 2,
            text: formatBotResponse(enhancedMessage),
            sender: 'bot',
          };
          
          setMessages(prev => [...prev.filter(m => !m.isSearchNotification), botMessage]);
          
          // Speak the text if needed (using text-to-speech)
          if (window.speechSynthesis) {
            speakText(enhancedMessage);
          }
        }, data.didSearch ? 1000 : 0);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now() + 2,
          text: `Error: ${data.error}`,
          sender: 'system',
        }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 2,
        text: `Error: Could not connect to server`,
        sender: 'system',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBotResponse = (response) => {
    // Handle Markdown-like bold, italics, bullet points, and links
    let formattedResponse = response;
  
    // Bold text: '**bold**'
    formattedResponse = formattedResponse.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
    // Italics text: '*italics*'
    formattedResponse = formattedResponse.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
    // Bullet points (assuming each point starts with a number or bullet-like pattern)
    formattedResponse = formattedResponse.replace(/^\s*(\d+\.|-\s)(.*)$/gm, (match, p1, p2) => {
      if (p1.includes('.')) {
        return `<li style="margin-left: 20px; list-style-type: decimal;">${p2}</li>`; // Indent for subpoints (numbered)
      }
      return `<li style="margin-left: 20px; list-style-type: disc;">${p2}</li>`; // Regular bullet points
    });
  
    // Wrap bullet points inside <ul> if any were found
    if (formattedResponse.includes('<li>')) {
      formattedResponse = `<ul style="list-style-position: inside; padding-left: 0;">${formattedResponse}</ul>`;
    }
  
    // Link detection and formatting: '[text](url)'
    formattedResponse = formattedResponse.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, (match, text, url) => {
      return `<a href="${url}" target="_blank" style="color: #6b46c1; text-decoration: none;">${text}</a>`;
    });
  
    return formattedResponse;
  };
  
  

  const handleBackToMain = async () => {
    // Stop any ongoing speech
    if (window.speechSynthesis) {
      stopSpeaking();
    }
    
    if (sessionId) {
      try {
        await fetch(`${API_URL}/end-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
          }),
        });
      } catch (error) {
        console.error('Error ending session:', error);
      }
    }
    
    setCurrentChat(null);
    setSessionId(null);
    setMessages([]);
  };

  const getCurrentChatTitle = (chatId = currentChat) => {
    const option = chatOptions.find(opt => opt.id === chatId);
    return option ? option.title : '';
  };

  useEffect(() => {
    const interviewType = localStorage.getItem('interviewType');
    if (interviewType === 'coach') {
      startChatSession('career');
    } else if (interviewType === 'assistant') {
      startChatSession('interview');
    }
  }, []);

  return (
    <div className="chat-container-interview asha-theme">
      <div className="chat-box-interview">
        {currentChat && (
          <div className="header-main-interview">
            <button onClick={handleBackToMain} className="back-button">
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
            <h2 className="chat-title">{getCurrentChatTitle()}</h2>
            {isSpeaking ? (
              <button 
                className="speaking-indicator" 
                onClick={stopSpeaking}
                title="Click to stop speaking"
              >
                <span className="wave">●</span>
                <span className="wave">●</span>
                <span className="wave">●</span>
              </button>
            ) : null}
          </div>
        )}

        {!currentChat && (
          <div className="header-main-interview">
            <h2>Choose Your Assistant</h2>
          </div>
        )}

        <div className="message-container-interview">
          {messages.map((message) => (
            <div className={message.sender === 'user' ? 'user-message-interview' : 'bot-message-interview'} key={message.id}>
              <div className="message-box-interview" dangerouslySetInnerHTML={{ __html: message.text }} />
              {message.sender === 'bot' && window.speechSynthesis && (
                <button 
                  className="speak-button" 
                  onClick={() => speakText(message.text)}
                  title="Listen"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="currentColor"/>
                  </svg>
                </button>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="bot-message-interview">
              <div className="message-box-interview">⏳ Typing...</div>
            </div>
          )}
        </div>

        {!currentChat && (
          <div className="chat-options-container">
            {chatOptions.map(option => (
              <button key={option.id} onClick={() => startChatSession(option.id)} className="button-interview">
                {option.title}
              </button>
            ))}
          </div>
        )}

        {currentChat && (
          <form onSubmit={handleSendMessage} className="input-area">
            <div className="input-container">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                className="chat-input"
              />
              <div className="input-buttons">
                <button
                  className="voice-button"
                  type="button"
                  onClick={handleVoiceInput}
                  aria-label="Voice input"
                  disabled={isListening}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z" fill="currentColor"/>
                    <path d="M17 12c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V22h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" fill="currentColor"/>
                  </svg>
                  {isListening && <span className="listening-indicator"></span>}
                </button>
              </div>
            </div>
            <button 
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="send-button"
            >
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  );
}