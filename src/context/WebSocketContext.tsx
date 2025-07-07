'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Message, UnreadCountResponse, WebSocketMessage } from '../types';

interface WebSocketContextType {
  messages: Message[];
  unreadCount: number;
  connected: boolean;
  error: string | null;
  reconnect: () => void; // Add function to manually reconnect
  reconnecting: boolean; // Add flag to indicate reconnection in progress
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { user, token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [reconnecting, setReconnecting] = useState(false);

  // Function to manually reconnect the WebSocket
  const reconnect = () => {
    if (!isAuthenticated || !user || !token) {
      return;
    }

    // Reset error state
    setError(null);

    // Reset reconnect attempts if we're manually reconnecting
    setReconnectAttempts(0);

    // Set reconnecting flag
    setReconnecting(true);

    // Close existing socket if it exists
    if (socket) {
      socket.close();
      setSocket(null);
    }

    // The useEffect will detect the socket being null and create a new one
    console.log('Manual reconnection initiated');
  };

  // Establish WebSocket connection when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user || !token) {
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
      }
      setReconnecting(false);
      return;
    }

    // Create WebSocket connection
    // Note: WebSockets cannot be proxied through Next.js like HTTP requests
    // The backend server must be configured to accept WebSocket connections from different origins
    const wsUrl = `ws://localhost:8080/ws?username=${user.username}&token=${token}`;
    const newSocket = new WebSocket(wsUrl);

    console.log('Attempting to connect to WebSocket:', wsUrl);

    // WebSocket event handlers
    newSocket.onopen = () => {
      setConnected(true);
      setError(null);
      console.log('WebSocket connection established');
    };

    newSocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;

        if (message.type === 'new_message') {
          const newMessage = message.data as Message;
          setMessages(prevMessages => [...prevMessages, newMessage]);
          setUnreadCount(prevCount => prevCount + 1);
        } else if (message.type === 'unread_count') {
          const countData = message.data as UnreadCountResponse;
          setUnreadCount(countData.count);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    newSocket.onerror = (event) => {
      setError('WebSocket error occurred - this might be due to CORS restrictions');
      console.error('WebSocket error:', event);
      console.error('If this is a CORS issue, ensure the backend server allows WebSocket connections from', window.location.origin);
    };

    const MAX_RECONNECT_ATTEMPTS = 10;

    newSocket.onclose = () => {
      setConnected(false);
      console.log('WebSocket connection closed');

      // Attempt to reconnect with exponential backoff
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        setReconnecting(true);
        // Calculate delay with exponential backoff (1s, 2s, 4s, 8s, etc.)
        const delay = Math.min(Math.pow(2, reconnectAttempts) * 1000, 30000); // Max 30 seconds
        console.log(`Attempting to reconnect WebSocket in ${delay/1000} seconds (attempt ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})...`);

        setTimeout(() => {
          if (isAuthenticated && user && token) {
            setReconnectAttempts(prev => prev + 1);
            console.log('Attempting to reconnect WebSocket...');
            // The effect will run again and attempt to reconnect
          } else {
            setReconnecting(false);
          }
        }, delay);
      } else {
        setReconnecting(false);
        console.log(`Maximum reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Please refresh the page to try again.`);
        setError(`Unable to connect to the notification service after ${MAX_RECONNECT_ATTEMPTS} attempts. Please refresh the page to try again.`);
      }
    };

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, [isAuthenticated, user, token]);

  const value = {
    messages,
    unreadCount,
    connected,
    error,
    reconnect,
    reconnecting
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
