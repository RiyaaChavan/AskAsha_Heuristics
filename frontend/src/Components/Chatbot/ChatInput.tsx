import React, { useState, useRef, useEffect } from 'react';
import { ChatInputProps } from './types';
import createSpeechRecognition from '../../utils/speechRecognition';
import { SimpleSpeechRecognition } from '../../utils/speechRecognition';

const ChatInput: React.FC<ChatInputProps> = ({ input, setInput, sendMessage }) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<SimpleSpeechRecognition | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    const recognition = createSpeechRecognition(
      (transcript: string) => {
        const newInput = input + ' ' + transcript;
        setInput(newInput.trim());
        setIsListening(false);
      },
      (error: string) => {
        console.error('Speech recognition error:', error);
        setIsListening(false);
      }
    );

    recognitionRef.current = recognition;    return () => {
      if (recognitionRef.current && recognitionRef.current.abort) {
        recognitionRef.current.abort();
      }
    };
  }, [setInput, input]);

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      console.warn('Speech Recognition not supported');
      return;
    }

    if (isListening) {
      // Stop listening
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      // Start listening
      setIsListening(true);
      
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start recognition:', error);
        setIsListening(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="input-area">
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening..." : "Type your message..."}
          className="chat-input"
        />
        
        <button 
          className={`voice-button ${isListening ? 'listening' : ''}`}
          onClick={handleVoiceInput}
          aria-label="Voice input"
          title={isListening ? "Listening... Click to stop" : "Click to speak"}
          type="button"
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {isListening ? (
              // Stop icon when listening
              <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>
            ) : (
              // Microphone icon when not listening
              <>
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" fill="currentColor"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" fill="currentColor"/>
              </>
            )}
          </svg>
        </button>
      </div>
      
      <button 
        className="send-button" 
        onClick={sendMessage}
        type="button"
      >
        Send
      </button>
    </div>
  );
};

export default ChatInput;