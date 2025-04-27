import React, { useRef, useState, useEffect } from 'react';
import { Send, Paperclip, Plus, Smile, Mic, Volume2, Image, AtSign } from 'lucide-react';

const ChatArea = () => {
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      content:
        "Hello! I'm Asha, your career assistant. I can help you with job searches, resume reviews, interview preparation, and career advice. What would you like to discuss today?",
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech Recognition not supported!');
      return;
    }
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
  
    recognition.onstart = () => { setIsListening(true); };
    recognition.onend = () => { setIsListening(false); };
    recognition.onerror = (event) => { console.error('Speech recognition error:', event.error); };
  
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage((prev) => prev + ' ' + transcript);
    };
  
    recognition.start();
    recognitionRef.current = recognition;
  };
  
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };
  
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
  
      const voices = window.speechSynthesis.getVoices();
      
      let selectedVoice = voices.find(
        (voice) => 
          voice.name.includes('Heera') ||
          voice.name.includes('Google UK English Female') ||
          (voice.lang === 'en-IN' && voice.name.toLowerCase().includes('female'))
      );
  
      if (!selectedVoice) {
        console.warn('Preferred Indian female voice not found. Using default.');
        selectedVoice = voices.find((voice) => voice.lang.startsWith('en-IN')) || voices[0];
      }
  
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
      utterance.rate = 1.4;
  
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-Speech not supported!');
    }
  };
  
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
      
      // Simulate bot response after a short delay
      setTimeout(() => {
        setMessages(prev => [...prev, {
          sender: 'bot',
          content: "I'm processing your request. Let me find some relevant information for you.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white dark:bg-gray-900">
      {/* Messages area with subtle background pattern */}
      <div 
  ref={chatContainerRef}
  className="flex-1 overflow-y-auto p-4 md:p-6"
  style={{
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C4D6E' fill-opacity='0.03'%3E%3Cpath d='M15 25h10v10H15zM75 25h10v10H75z'/%3E%3Cpath d='M35 45h30v10H35z'/%3E%3Cpath d='M25 65a10 10 0 1120 0 10 10 0 01-20 0M55 65a10 10 0 1120 0 10 10 0 01-20 0'/%3E%3Cpath d='M40 15l5-5 5 5-5 5zM50 85l5-5 5 5-5 5zM70 40c0 5.523-4.477 10-10 10S50 45.523 50 40s4.477-10 10-10 10 4.477 10 10'/%3E%3Cpath d='M30 40l10-10M60 70l10-10M45 25h10M45 65h10'/%3E%3C/g%3E%3C/svg%3E")`,
    backgroundSize: '100px 100px',
    backgroundColor: '#F7F8F9',
    backgroundAttachment: 'fixed',
    backgroundBlendMode: 'soft-light',
    backdropFilter: 'blur(8px)'
  }}
>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex mb-6 animate-fade-in ${
              msg.sender === 'user' ? 'justify-end' : ''
            }`}
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            {msg.sender !== 'user' && (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9c4d6e] to-[#b86a8a] flex items-center justify-center text-white mr-3 flex-shrink-0 shadow-md">
                <span>A</span>
              </div>
            )}
            <div className="max-w-[85%] md:max-w-[70%]">
              <div
                className={`p-4 rounded-2xl shadow-md ${
                  msg.sender === 'user'
                    ? 'rounded-tr-none text-white'
                    : 'bg-white dark:bg-gray-800 rounded-tl-none text-gray-800 dark:text-gray-200'
                }`}
                style={
                  msg.sender === 'user'
                    ? {
                        background: 'linear-gradient(135deg, #d19eaf 0%, #b86a8a 100%)',
                        boxShadow: '0 4px 15px rgba(184, 106, 138, 0.3)',
                      }
                    : {
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }
                }
              >
                <div className="flex items-center justify-between">
                  <p className={msg.sender === 'user' ? 'text-white' : 'text-gray-800 dark:text-gray-200'}>
                    {msg.content}
                  </p>
                  {msg.sender === 'bot' && (
                    <button
                      onClick={() => speakText(msg.content)}
                      className="ml-3 text-gray-500 hover:text-[#9c4d6e] dark:hover:text-pink-300 transition-colors"
                    >
                      <Volume2 size={18} />
                    </button>
                  )}
                </div>
                {msg.list && (
                  <ol className="list-decimal pl-5 space-y-2 mt-3 text-gray-700 dark:text-gray-300">
                    {msg.list.map((item, i) => (
                      <li key={i} className="animate-fadeIn" style={{ animationDelay: `${i * 0.1 + 0.3}s` }}>
                        {item}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
              {msg.time && (
                <div className="text-xs text-gray-500 mt-1 ml-1">{msg.time}</div>
              )}
            </div>
            {msg.sender === 'user' && (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8bc34a] to-[#7daf43] flex items-center justify-center text-white ml-3 flex-shrink-0 shadow-md">
                <span>R</span>
              </div>
            )}
          </div>
        ))}
      </div>

      

      {/* Input area */}
      <div className="p-4 bg-white dark:bg-gray-900 shadow-inner">
        <div className="flex bg-white dark:bg-gray-800 rounded-xl border border-pink-100 dark:border-gray-700 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
          <button className="p-3 text-gray-400 hover:text-[#9c4d6e] dark:hover:text-pink-300 transition-colors">
            <Plus size={20} />
          </button>

          <input
            type="text"
            placeholder="Type your message here..."
            className="flex-1 py-3 px-2 bg-transparent border-none focus:ring-0 focus:outline-none text-gray-800 dark:text-gray-200"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
          />

          <button
            onClick={handleFileClick}
            className="p-3 text-gray-400 hover:text-[#9c4d6e] dark:hover:text-pink-300 transition-colors"
          >
            <Paperclip size={20} />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />

          <button className="p-3 text-gray-400 hover:text-[#9c4d6e] dark:hover:text-pink-300 transition-colors">
            <Image size={20} />
          </button>

          <button className="p-3 text-gray-400 hover:text-[#9c4d6e] dark:hover:text-pink-300 transition-colors">
            <Smile size={20} />
          </button>
          <div className="relative flex items-center justify-center">
  <button
    onClick={isListening ? stopListening : startListening}
    className={`p-3 transition-colors relative z-10 ${
      isListening 
        ? 'text-[#8bc34a]' 
        : 'text-gray-400 hover:text-[#9c4d6e] dark:hover:text-pink-300'
    }`}
  >
    <Mic size={20} />
  </button>
  
  {isListening && (
    <>
      {/* Pink bubble background */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#9c4d6e] to-[#b86a8a] opacity-20"></div>
      
      {/* Pulsing animation - pink only */}
      <div className="absolute inset-0 rounded-full bg-[#9c4d6e] opacity-10 animate-ping"></div>
    </>
  )}
</div>

<button
  onClick={handleSend}
  className="bg-gradient-to-r from-[#8bc34a] to-[#7daf43] text-white p-3 hover:opacity-90 transition-opacity"
>
  <Send size={20} />
</button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
