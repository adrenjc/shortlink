export interface Message {
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string;
}

export interface Chat {
  _id: string;
  title: string;
}

export interface StreamingState {
  content: string;
  reasoning: string;
  isStreaming: boolean;
}
