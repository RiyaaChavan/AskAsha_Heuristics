import React, { useRef, useState } from 'react';
import { Send, Paperclip, Plus, Smile } from 'lucide-react';

const ChatArea = () => {
  const fileInputRef = useRef(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      content:
        "Hello! I'm your Career Assistant. I can help you with job searches, resume reviews, interview preparation, and career advice. What would you like to discuss today?",
    },
    {
      sender: 'user',
      content: "I'm looking for job opportunities in tech. I have experience in web development.",
    },
    {
      sender: 'bot',
      content: `Great! I'd be happy to help you find tech job opportunities that match your web development experience. Could you tell me a bit more about:`,
      list: [
        'Your specific skills (languages, frameworks, etc.)',
        'Years of experience',
        'Location preferences (remote, specific cities)',
        "Any particular companies or industries you're interested in",
      ],
    },
    {
      sender: 'user',
      content:
        "I have 3 years of experience with React, Node.js, and MongoDB. I'm looking for remote positions or jobs in Boston. I'm interested in fintech or healthtech companies.",
    },
    {
      sender: 'bot',
      content:
        "Thanks for sharing those details! Based on your experience with React, Node.js, and MongoDB, along with your interest in remote or Boston-based positions in fintech or healthtech, I've found several opportunities that might be a good fit. Check out the job suggestions panel on the right for positions I've curated for you.",
      time: '2:45 PM',
    },
  ]);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('File selected:', file);
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      setMessages((prev) => [...prev, { sender: 'user', content: message }]);
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-70px)] bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex mb-6 animate-fade-in ${
              msg.sender === 'user' ? 'justify-end' : ''
            }`}
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            {msg.sender !== 'user' && (
              <div className="w-10 h-10 rounded-full bg-[var(--primary-color)] flex items-center justify-center text-white mr-4 flex-shrink-0 shadow-sm">
                <span>CA</span>
              </div>
            )}
            <div className="max-w-[85%] md:max-w-[70%]">
              <div
                className={`p-4 rounded-2xl shadow-sm ${
                  msg.sender === 'user'
                    ? 'rounded-tr-none text-white'
                    : 'bg-white dark:bg-gray-800 rounded-tl-none text-gray-800 dark:text-gray-200'
                }`}
                style={
                  msg.sender === 'user'
                    ? {
                        backgroundColor: '#b86a8a',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
                      }
                    : {}
                }
              >
                <p>{msg.content}</p>
                {msg.list && (
                  <ol className="list-decimal pl-5 space-y-2 mt-2">
                    {msg.list.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ol>
                )}
              </div>
              {msg.time && (
                <div className="text-xs text-gray-500 mt-1 ml-1">{msg.time}</div>
              )}
            </div>
            {msg.sender === 'user' && (
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 ml-4 flex-shrink-0 shadow-sm">
                <span>R</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        <div className="flex bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <button className="p-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <Plus size={20} />
          </button>

          <input
            type="text"
            placeholder="Type your message here..."
            className="flex-1 py-3 px-2 bg-transparent border-none focus:ring-0 text-gray-800 dark:text-gray-200"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
          />

          <button
            onClick={handleFileClick}
            className="p-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <Paperclip size={20} />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />

          <button className="p-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <Smile size={20} />
          </button>

          <button
            onClick={handleSend}
            className="bg-[#8bc34a] text-white p-3 hover:bg-[#7daf43] transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
