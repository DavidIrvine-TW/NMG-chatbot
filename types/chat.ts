export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'error';
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export interface ChatResponse {
  id: string;
  role: 'assistant';
  content: string;
  conversationId: string;
  timestamp: string;
}

export interface ErrorResponse {
  error: string;
  code?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  conversationId?: string;
}

export type SendMessageResult =
  | { success: true; data: ChatResponse }
  | { success: false; error: string };
