export interface Conversation {
  id: string;
  title: string;
  preview: string;
  time: string;
  icon: string;
  active?: boolean;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

export interface JobPost {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  tags: string[];
}