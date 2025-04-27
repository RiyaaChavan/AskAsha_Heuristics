// Types definitions for Chatbot components

export type Message = {
  text: string;
  canvasType: 'none' | 'job_search' | 'roadmap';
  canvasUtils?: Record<string, any>;
};

export type Payload = {
  message: string;
  userId: string;
};

export interface CanvasProps {
  message: Message;
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
}

export interface RoadmapItem {
  title: string;
  description: string;
  link: string;
}