/**
 * Speech Recognition Utility for AskAsha
 * This utility provides speech-to-text functionality using the Web Speech API
 */

// Check if browser supports speech recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;

/**
 * Creates and configures a speech recognition instance
 * @returns {object} Speech recognition controller
 */
export const createSpeechRecognition = () => {
  // If browser doesn't support speech recognition
  if (!SpeechRecognition) {
    return {
      isSupported: false,
      start: () => alert("Sorry, your browser doesn't support speech recognition."),
      stop: () => {},
      isListening: false
    };
  }

  // Create speech recognition instance
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  // Status tracking
  let isListening = false;
  let onResultCallback = null;
  let onErrorCallback = null;

  // Configure event handlers
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (onResultCallback) {
      onResultCallback(transcript);
    }
    stop();
  };

  recognition.onerror = (event) => {
    if (onErrorCallback) {
      onErrorCallback(event.error);
    }
    stop();
  };

  recognition.onend = () => {
    isListening = false;
  };

  // Start recognition
  const start = (onResult, onError) => {
    onResultCallback = onResult;
    onErrorCallback = onError;
    
    try {
      recognition.start();
      isListening = true;
    } catch (error) {
      console.error("Speech recognition error:", error);
      isListening = false;
    }
  };

  // Stop recognition
  const stop = () => {
    try {
      recognition.stop();
    } catch (error) {
      console.error("Error stopping speech recognition:", error);
    } finally {
      isListening = false;
    }
  };

  return {
    isSupported: true,
    start,
    stop,
    isListening: () => isListening
  };
};

export default createSpeechRecognition;