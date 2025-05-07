import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import './Chatbot/styles/Interview.css';
import './Chatbot/styles/ChatInput.css';

// Define types here since they're not imported
interface Message {
  id: number;
  text: string;
  sender: string;
  isSearchNotification?: boolean;
}

interface SessionResponse {
  sessionId: string;
  messageHistory?: Message[];
}

interface MessageResponse {
  message: string;
  didSearch?: boolean;
}

// Use environment variable API_URL
const API_URL = `${import.meta.env.VITE_API_URL}/api`;

// Key for localStorage
const INTERVIEW_SESSION_KEY = 'interview_session_data';

export default function InterviewAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>('anonymous_user'); // Default user ID

  // Load saved session data on component mount
  useEffect(() => {
    const savedSessionData = localStorage.getItem(INTERVIEW_SESSION_KEY);
    if (savedSessionData) {
      try {
        const { messages: savedMessages, sessionId: savedSessionId } = JSON.parse(savedSessionData);
        if (savedMessages && savedSessionId) {
          setMessages(savedMessages);
          setSessionId(savedSessionId);
        }
      } catch (error) {
        console.error('Error parsing saved session data:', error);
        // If there's an error parsing, clear the saved data
        localStorage.removeItem(INTERVIEW_SESSION_KEY);
      }
    }
  }, []);

  // Save session data whenever it changes
  useEffect(() => {
    if (sessionId && messages.length > 0) {
      const sessionData = {
        sessionId,
        messages,
      };
      localStorage.setItem(INTERVIEW_SESSION_KEY, JSON.stringify(sessionData));
    }
  }, [sessionId, messages]);

  const startInterviewSession = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/start-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatType: 'interview',
          userId,
        }),
      });

      const data: SessionResponse = await response.json();
      if (response.ok) {
        setSessionId(data.sessionId);
        setMessages([{
          id: Date.now(),
          text: 'Hello! I\'ll be conducting your mock interview today. What role would you like to practice for?',
          sender: 'bot',
        }]);
      }
    } catch (error) {
      console.error('Error starting session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: FormEvent): Promise<void> => {
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
      
      const data: MessageResponse = await response.json();
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
          setMessages(prev => [
            ...prev.filter(m => !m.isSearchNotification),
            {
              id: Date.now() + 2,
              text: formatBotResponse(data.message),
              sender: 'bot',
            }
          ]);
        }, data.didSearch ? 1000 : 0);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBotResponse = (response: string): string => {
    let formattedResponse = response;
    formattedResponse = formattedResponse.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedResponse = formattedResponse.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formattedResponse = formattedResponse.replace(/^\s*(\d+\.|-\s)(.*)$/gm, (match, p1, p2) => {
      if (p1.includes('.')) {
        return `<li style="margin-left: 20px; list-style-type: decimal;">${p2}</li>`;
      }
      return `<li style="margin-left: 20px; list-style-type: disc;">${p2}</li>`;
    });

    if (formattedResponse.includes('<li>')) {
      formattedResponse = `<ul style="list-style-position: inside; padding-left: 0;">${formattedResponse}</ul>`;
    }

    formattedResponse = formattedResponse.replace(
      /$$([^$$]+)\]$$(https?:\/\/[^$$]+)\)/g,
      '<a href="$2" target="_blank" style="color: #6b46c1; text-decoration: none;">$1</a>'
    );

    return formattedResponse;
  };

  // Add method to clear session history
  const clearSessionHistory = () => {
    localStorage.removeItem(INTERVIEW_SESSION_KEY);
    setSessionId(null);
    setMessages([]);
  };

  return (
    <div className="chat-container-interview asha-theme">
      <div className="chat-box-interview">
        <div className="header-main-interview">
          <h2>Interview Assistant</h2>
          {sessionId && (
            <button 
              onClick={clearSessionHistory}
              className="clear-history-button"
              title="Start a new interview session"
            >
              New Session
            </button>
          )}
        </div>

        <div className="message-container-interview">
          {messages.map((message) => (
            <div 
              className={message.sender === 'user' ? 'user-message-interview' : 'bot-message-interview'} 
              key={message.id}
            >
              <div 
                className="message-box-interview" 
                dangerouslySetInnerHTML={{ __html: message.text }} 
              />
            </div>
          ))}
          {isLoading && (
            <div className="bot-message-interview">
              <div className="message-box-interview">⏳ Typing...</div>
            </div>
          )}
        </div>

        {!sessionId && (
          <button 
            onClick={startInterviewSession} 
            className="button-interview"
          >
            Start Mock Interview
          </button>
        )}

        {sessionId && (
          <form onSubmit={handleSendMessage} className="chat-input-form">
            <div className="input-container">
              <input
                type="text"
                placeholder="Type your response..."
                value={inputText}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setInputText(e.target.value)}
                className="input-interview"
              />
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="send-button"
              >
                Send
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}