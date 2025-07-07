// Types for the anonymous messaging platform

// User types
export interface User {
  id: number;
  username: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

// Message types
export interface Message {
  id: number;
  receiver_username: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export interface SendMessageRequest {
  content: string;
}

export interface MarkAsReadRequest {
  message_ids: number[];
}

export interface UnreadCountResponse {
  count: number;
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'new_message' | 'unread_count';
  data: Message | UnreadCountResponse;
}