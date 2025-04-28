import { useState, useEffect } from 'react';
import { MessageSquare, ArrowLeft, Search } from 'lucide-react';
// import './interview.css'; // Import the CSS file

export default function Interview() {
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [showUserIdPrompt, setShowUserIdPrompt] = useState(false);
  
  const API_URL = 'https://askasha.onrender.com/api';

  // Removed skill development option as requested
  const chatOptions = [
    { id: 'career', title: 'Career Coach', description: 'Get guidance on career paths and growth opportunities' },
    { id: 'interview', title: 'Job Interview Prep', description: 'Practice interview questions and get feedback' },
  ];
  useEffect(() => {
    const messageContainer = document.querySelector('.message-container-interview');
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }, [messages]);

  // This function is called when a chat option button is clicked
  const startChatSession = async (chatType) => {
    // Always show the name prompt first
    setShowUserIdPrompt(true);
    setCurrentChat(chatType);
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
    
    setCurrentChat(null);
    setSessionId(null);
    setMessages([]);
  };

  // This function is called when the name form is submitted
  const handleUserIdSubmit = (e) => {
    e.preventDefault();
    
    if (userId.trim()) {
      setShowUserIdPrompt(false);
      // Now initiate the actual chat with the provided name
      initiateChat(currentChat);
    }
  };

  // This function starts the actual chat session after getting the user's name
  const initiateChat = async (chatType) => {
    if (!chatType || !userId) return;
    
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

        // Override the first message
        const initialMessages = data.messageHistory || [];
        const messagesToDisplay = initialMessages.length > 0 
          ? [
              {
                id: Date.now(),
                text: chatType === 'Interview' 
                ? `Hello ${userId}, how are you today? Enter the role you want to prepare for.` 
                : `Hello ${userId}, how are you today?`,
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

  const getCurrentChatTitle = (chatId = currentChat) => {
    const option = chatOptions.find(opt => opt.id === chatId);
    return option ? option.title : '';
  };

  return (
    <div className="chat-container-interview">
      {/* This is the name prompt overlay that appears when showUserIdPrompt is true */}
      {showUserIdPrompt && (
        <div className="user-id-prompt-interview">
          <div className="modal-content">
            <h3>What's your name?</h3>
            <form onSubmit={handleUserIdSubmit}>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter your name"
                required
                autoFocus
              />
              <button type="submit">
                Continue
              </button>
            </form>
          </div>
        </div>
      )}
      
      <div className="chat-box-interview">
        <div className="header-main-interview">
          {currentChat ? (
            <>
              <button onClick={handleBackToMain}>
                <ArrowLeft size={20} />
              </button>
              <h2>{getCurrentChatTitle()}</h2>
            </>
          ) : (
            <h2>Choose Your Assistant</h2>
          )}
        </div>

        <div className="message-container-interview">
          {messages.map((message) => (
            <div className={message.sender === 'user' ? 'user-message-interview' : 'bot-message-interview'} key={message.id}>
              <div className="message-box-interview" dangerouslySetInnerHTML={{ __html: message.text }} />
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
          <form onSubmit={handleSendMessage} className="input-container-interview">
            <input
              type="text"
              placeholder="Ask a question..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="input-interview"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="send-button-interview"
            >
              <MessageSquare size={18} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}