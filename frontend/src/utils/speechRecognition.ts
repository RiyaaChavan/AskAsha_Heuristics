// utils/speechRecognition.ts
export type SpeechRecognitionCallback = (transcript: string) => void;
export type ErrorCallback = (error: string) => void;

export default function createSpeechRecognition(
  onResultCallback: SpeechRecognitionCallback,
  onErrorCallback: ErrorCallback
): SpeechRecognition | null {
  // Check for SpeechRecognition support
  const SpeechRecognitionConstructor = 
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognitionConstructor) {
    console.warn('Speech Recognition API not supported in this browser.');
    return null;
  }

  const recognition = new SpeechRecognitionConstructor();
  
  // Configure recognition settings
  recognition.continuous = false;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  // Handle successful recognition
  recognition.onresult = (event: SpeechRecognitionEvent) => {
    if (event.results.length > 0) {
      const transcript = event.results[0][0].transcript;
      onResultCallback(transcript);
    }
  };

  // Handle recognition errors
  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    onErrorCallback(event.error);
  };

  // Optional: Handle other events
  recognition.onstart = () => {
    console.log('Speech recognition started');
  };

  recognition.onend = () => {
    console.log('Speech recognition ended');
  };

  return recognition;
}