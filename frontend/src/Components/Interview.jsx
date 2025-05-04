import { useState, useEffect } from 'react';
import { MessageSquare, ArrowLeft, Send } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Chatbot/styles/Interview.css';

export default function Interview() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [showUserIdPrompt, setShowUserIdPrompt] = useState(false);
  const [charCount, setCharCount] = useState(0);
  
  const API_URL = 'https://askasha.onrender.com/api';
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine chat type from URL path
  const chatType = location.pathname.includes('interview') ? 'interview' : 'career';
  
  // Start session immediately when component mounts
  useEffect(() => {
    if (!userId) {
      setShowUserIdPrompt(true);
    } else {
      startChatSession();
    }
  }, [userId]);

  const startChatSession = async () => {
    if (!userId) {
      setShowUserIdPrompt(true);
      return;
    }

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

        const initialMessages = data.messageHistory || [];
        const messagesToDisplay = initialMessages.length > 0 
          ? [
              {
                id: Date.now(),
                text: `Hello ${userId}, how are you today?`,
                sender: 'bot',
              },
              ...initialMessages,
            ]
          : [
              {
                id: Date.now(),
                text: `Hello ${userId}, how are you today?`,
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
    if (!inputText.trim() || !sessionId) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
    };

    setMessages([...messages, userMessage]);
    setInputText('');
    setCharCount(0);
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
            text: '🔍 Searching for information...',
            sender: 'system',
            isSearchNotification: true
          }]);
        }

        setTimeout(() => {
          setMessages(prev => [...prev.filter(m => !m.isSearchNotification), {
            id: Date.now() + 2,
            text: formatBotResponse(data.message),
            sender: 'bot',
          }]);
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

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    setCharCount(e.target.value.length);
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
    
    // Navigate back to home
    navigate('/');
  };

  const handleUserIdSubmit = (e) => {
    e.preventDefault();
    setShowUserIdPrompt(false);
    startChatSession();
  };

  const getChatTitle = () => {
    return chatType === 'interview' ? 'Job Interview Prep' : 'Career Coach';
  };

  const UserIdPrompt = () => (
    <div className="user-id-prompt-interview">
      <div className="modal-content">
        <h3>What's your name?</h3>
        <form onSubmit={handleUserIdSubmit}>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter your name"
            className="name-input"
            required
            autoFocus
          />
          <button
            type="submit"
            className="continue-button"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="chat-container-interview asha-theme">
      {showUserIdPrompt && <UserIdPrompt />}
      <div className="chat-box-interview">
        <div className="header-main-interview">
          <button onClick={handleBackToMain} className="back-button">
            <ArrowLeft size={20} />
          </button>
          <h2>{getChatTitle()}</h2>
        </div>

        <div className="message-container-interview">
          {messages.map((message) => (
            <div className={message.sender === 'user' ? 'user-message-interview' : 'bot-message-interview'} key={message.id}>
              <div className="message-box-interview" dangerouslySetInnerHTML={{ __html: message.text }} />
            </div>
          ))}
          {isLoading && (
            <div className="bot-message-interview">
              <div className="message-box-interview typing-indicator">⏳ Typing...</div>
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="message-input-container">
          <div className="input-wrapper">
            <input
              type="text"
              placeholder="Ask a question..."
              value={inputText}
              onChange={handleInputChange}
              className="message-input"
              disabled={isLoading || !sessionId}
            />
            <div className="char-count">{charCount} / 1200</div>
          </div>
          <button
            type="submit"
            disabled={isLoading || !inputText.trim() || !sessionId}
            className="send-button"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}