// Components/VoiceAssistant.tsx
import React, { useState, useRef, useEffect } from 'react';
import createSpeechRecognition, { SimpleSpeechRecognition } from '../utils/speechRecognition';
import './Chatbot/styles/VoiceAssistant.css';


const VoiceAssistant: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const recognitionRef = useRef<SimpleSpeechRecognition | null>(null);

  useEffect(() => {
    // Initialize speech recognition on component mount
    const recognition = createSpeechRecognition(
      (transcript: string) => {
        setText(transcript);
        setIsListening(false);
        speakText(`You said: ${transcript}`);
      },
      (error: string) => {
        console.error('Speech recognition error:', error);
        setIsListening(false);
        
        // Handle specific error types
        switch (error) {
          case 'no-speech':
            setText('No speech detected. Please try again.');
            break;
          case 'audio-capture':
            setText('Microphone not accessible. Please check permissions.');
            break;
          case 'not-allowed':
            setText('Microphone permission denied.');
            break;
          default:
            setText(`Error: ${error}`);
        }
      }
    );

    if (recognition) {
      recognitionRef.current = recognition;
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }    // Cleanup function
    return () => {
      if (recognitionRef.current && recognitionRef.current.abort) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      console.warn('Speech Recognition not available');
      return;
    }

    if (isListening) {
      // Stop listening
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      // Start listening
      setText('Listening...');
      setIsListening(true);
      
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start recognition:', error);
        setIsListening(false);
        setText('Failed to start speech recognition');
      }
    }
  };

  const speakText = (message: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      
      // Optional: Handle speech synthesis events
      utterance.onstart = () => console.log('Speech synthesis started');
      utterance.onend = () => console.log('Speech synthesis ended');
      utterance.onerror = (event) => console.error('Speech synthesis error:', event);
      
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Speech synthesis not supported');
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div style={{ 
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
      padding: '8px',
      borderRadius: '8px',
      backgroundColor: isListening ? 'rgba(255, 68, 68, 0.1)' : 'transparent'
    }}>
      <div style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
        {isListening ? 'Listening...' : ''}
      </div>
    </div>
  );
};

export default VoiceAssistant;