/**
 * Type definitions for speechRecognition.js
 */

interface SpeechRecognitionAPI {
  isSupported: boolean;
  start: (onResult: (transcript: string) => void, onError: (error: string) => void) => void;
  stop: () => void;
  isListening: () => boolean;
}

declare function createSpeechRecognition(): SpeechRecognitionAPI;

export default createSpeechRecognition;