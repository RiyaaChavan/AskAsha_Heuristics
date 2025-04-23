import React, { useState, useRef, useEffect } from 'react';
import { messages as initialMessages } from '../data';
import { Paperclip, Search, SendIcon } from 'lucide-react';
import PropTypes from 'prop-types';


const ChatArea = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    
    const userMessage = {
      id: `user-${Date.now()}`,
      text: newMessage,
      sender: 'user',
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);
    
    // Simulate bot typing and response
    setTimeout(() => {
      const botMessage = {
        id: `bot-${Date.now()}`,
        text: "Thank you for your message. I'm processing your request and will get back to you shortly with more information.",
        sender: 'bot',
        timestamp: Date.now()
      };
      
      setIsTyping(false);
      setMessages(prev => [...prev, botMessage]);
    }, 3000);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-70px)] relative transition-all duration-300">
      <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-5">
        {messages.map(message => (
          <Message key={message.id} message={message} />
        ))}
        
        {isTyping && (
          <div className="flex self-start bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl rounded-bl-sm gap-1">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-[typingAnimation_1.4s_infinite_ease-in-out]"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-[typingAnimation_1.4s_infinite_ease-in-out_0.2s]"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-[typingAnimation_1.4s_infinite_ease-in-out_0.4s]"></div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-black/10 dark:border-white/10 flex items-center gap-3 bg-white dark:bg-[#252525]">
        <div className="flex gap-3">
          <button className="bg-transparent border-none text-lg text-gray-600 dark:text-gray-400 cursor-pointer transition-all hover:bg-black/5 dark:hover:bg-white/10 w-9 h-9 rounded-full flex items-center justify-center">
            <Paperclip size={18} />
          </button>
          <button className="bg-transparent border-none text-lg text-gray-600 dark:text-gray-400 cursor-pointer transition-all hover:bg-black/5 dark:hover:bg-white/10 w-9 h-9 rounded-full flex items-center justify-center">
            <Search size={18} />
          </button>
        </div>
        
        <input
          type="text"
          className="flex-1 py-3 px-4 rounded-3xl border border-gray-300 dark:border-gray-700 outline-none text-sm bg-gray-50 dark:bg-gray-800 transition-all focus:border-[var(--primary-color)] dark:focus:border-[var(--primary-light)] dark:text-white"
          placeholder="Type your message here..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        
        <button 
          className="bg-[var(--primary-color)] text-white border-none w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all hover:bg-[var(--primary-dark)]"
          onClick={handleSendMessage}
        >
          <SendIcon size={18} />
        </button>
      </div>
    </div>
  );
};

const Message = ({ message }) => {
  const { text, sender } = message;
  
  return (
    <div 
      className={`max-w-[80%] p-3 rounded-2xl relative animate-[fadeIn_0.3s_ease] backdrop-blur-md border border-white/20 backdrop-filter
        ${sender === 'user' 
          ? 'self-end bg-[var(--primary-color)] text-white rounded-br-sm' 
          : 'self-start bg-gray-100 dark:bg-gray-800 text-[var(--text-dark)] dark:text-[var(--text-light)] rounded-bl-sm'}`}
    >
      {text.split('\n').map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i < text.split('\n').length - 1 && <br />}
        </React.Fragment>
      ))}
    </div>
  );
};

Message.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    sender: PropTypes.oneOf(['user', 'bot']).isRequired,
    timestamp: PropTypes.number.isRequired,
  }).isRequired,
};

export default ChatArea;