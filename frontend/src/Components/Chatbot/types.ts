// Types definitions for Chatbot components

export type Message = {
  id?: number;
  text: string;
  isUser?: boolean;
  canvasType: 'none' | 'job_search' | 'roadmap' | 'session_search';
  canvasUtils?: Record<string, any>;
  isUserMessage?: boolean; // Indicates if the message is from the user
  isHistory?: boolean; // Existing property for history messages
  isLoading?: boolean; // Indicates if this is a loading state message
};

export type Payload = {
  message: string;
  userId: string;
};

export interface CanvasProps {
  message: Message;
  onClose?: () => void;
}

export interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  sendMessage: () => void;
}

export interface ChatWindowProps {
  messages: Message[];
  selectMessage: (index: number) => void;
  selectedMessageId: number | null;
}

export interface CanvasAreaProps {
  messages: Message[];
  selectedMessageId: number | null;
  isOpen?: boolean; // Whether the canvas is open or minimized
  toggleCanvas?: () => void; // Function to toggle the canvas state
}

export interface RoadmapItem {
  title: string;
  description: string;
  link: string;
  calendar_event?: string;
}

export interface ChatMessageProps {
  message: Message;
  index: number;
  selectMessage: (index: number) => void;
  isSelected: boolean;
  isUserMessage?: boolean;
}