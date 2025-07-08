'use client';

import { useEffect, useState } from 'react';
import { Message } from '../types';
import { useAuth } from '../context/AuthContext';
import { getMessages, markMessagesAsRead } from '../lib/api';

interface MessageListProps {
  messages: Message[];
  onMarkAsRead: (messageIds: number[]) => Promise<void>;
}

export default function MessageList({ messages = [], onMarkAsRead }: MessageListProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedMessageIds, setFailedMessageIds] = useState<number[]>([]);
  const [expandedMessageIds, setExpandedMessageIds] = useState<number[]>([]);

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Mark messages as read when they are viewed
  useEffect(() => {
    // Ensure messages is an array before using filter
    if (!Array.isArray(messages)) return;

    const unreadMessages = messages.filter(message => !message.is_read);
    if (unreadMessages.length > 0) {
      const messageIds = unreadMessages.map(message => message.id);

      // Clear any previous errors
      setError(null);
      setFailedMessageIds([]);

      // Try to mark messages as read
      onMarkAsRead(messageIds)
        .then(() => {
          // Success - clear any error state
          setError(null);
          setFailedMessageIds([]);
        })
        .catch(err => {
          // Error - store the failed message IDs and show error
          setError(err instanceof Error ? err.message : 'Failed to mark messages as read');
          setFailedMessageIds(messageIds);
        });
    }
  }, [messages, onMarkAsRead]);

  if (loading) {
    return <div className="text-center py-4">Loading messages...</div>;
  }

  if (error) {
    // Check if the error message indicates a circuit breaker issue
    const isCircuitBreakerError = error.includes('Circuit breaker open');

    return (
      <div className="text-center py-4">
        <div className="text-red-600 mb-3">
          {error}
          {isCircuitBreakerError && (
            <div className="mt-2 text-amber-600 text-sm">
              You can still view messages, but they won't be marked as read until the server is available again.
            </div>
          )}
        </div>
        {failedMessageIds.length > 0 && !isCircuitBreakerError && (
          <button 
            onClick={() => {
              setError(null);
              // Retry marking messages as read
              onMarkAsRead(failedMessageIds)
                .then(() => {
                  setFailedMessageIds([]);
                })
                .catch(err => {
                  setError(err instanceof Error ? err.message : 'Failed to mark messages as read');
                });
            }}
            className="btn-primary px-4 py-2 rounded-md"
          >
            Retry Marking as Read
          </button>
        )}
        {isCircuitBreakerError && (
          <button 
            onClick={() => {
              // Just dismiss the error and continue viewing messages
              setError(null);
            }}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Continue Viewing Messages
          </button>
        )}
      </div>
    );
  }

  // Ensure messages is an array before checking length
  if (!Array.isArray(messages) || messages.length === 0) {
    return <div className="text-center py-4">No messages yet.</div>;
  }

  // Toggle message expansion
  const toggleMessageExpansion = (messageId: number) => {
    setExpandedMessageIds(prevIds => 
      prevIds.includes(messageId)
        ? prevIds.filter(id => id !== messageId)
        : [...prevIds, messageId]
    );
  };

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isExpanded = expandedMessageIds.includes(message.id);
        const messageContent = message.content;
        const previewContent = messageContent.length > 100 
          ? `${messageContent.substring(0, 100)}...` 
          : messageContent;

        return (
          <div 
            key={message.id} 
            className={`p-4 rounded-lg cursor-pointer transition-all ${
              message.is_read 
                ? 'bg-gray-100 hover:bg-gray-200' 
                : 'bg-secondary border-l-4 border-primary hover:bg-[#f8d0e0]'
            }`}
            onClick={() => toggleMessageExpansion(message.id)}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-gray-500">
                {formatDate(message.created_at)}
              </span>
              <div className="flex items-center">
                {!message.is_read && (
                  <span className="inline-block px-2 py-1 text-xs bg-secondary text-primary rounded-full mr-2">
                    New
                  </span>
                )}
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div className="text-gray-800">
              {isExpanded ? messageContent : previewContent}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Container component that fetches messages and handles marking them as read
export function MessageListContainer() {
  const { user, token } = useAuth();
  // Initialize messages as an empty array to prevent null/undefined issues
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // State to track if we're showing cached data
  const [isShowingCachedData, setIsShowingCachedData] = useState(false);

  // Fetch messages on component mount
  useEffect(() => {
    if (!user || !token) return;

    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedMessages = await getMessages(user.username, token);
        // Ensure we're setting a valid array even if fetchedMessages is somehow null
        setMessages(fetchedMessages || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch messages');
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user, token]);

  // Handle marking messages as read
  const handleMarkAsRead = async (messageIds: number[]): Promise<void> => {
    if (!user || !token || messageIds.length === 0) {
      return Promise.resolve();
    }

    try {
      await markMessagesAsRead(user.username, messageIds, token);

      // Update local state to mark messages as read
      setMessages(prevMessages => 
        prevMessages.map(message => 
          messageIds.includes(message.id) 
            ? { ...message, is_read: true } 
            : message
        )
      );

      return Promise.resolve();
    } catch (err) {
      console.error('Error marking messages as read:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark messages as read');

      // Don't update the UI to show messages as read since the API call failed
      // This way, the user can try again later

      return Promise.reject(err);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading messages...</div>;
  }

  if (error) {
    // Check if the error message indicates we're using cached data
    const isCircuitBreakerError = error.includes('Circuit breaker open');

    return (
      <div className="text-center py-4">
        <div className="text-red-600 mb-3">
          {error}
          {isShowingCachedData && (
            <div className="mt-2 text-amber-600 text-sm">
              Showing cached messages. Some information may be outdated.
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button 
            onClick={() => {
              setError(null);
              setIsShowingCachedData(false);
              // Retry fetching messages
              if (user && token) {
                getMessages(user.username, token)
                  .then(fetchedMessages => {
                    // Ensure we're setting a valid array even if fetchedMessages is somehow null
                    setMessages(fetchedMessages || []);
                    // Check if we got cached data
                    setIsShowingCachedData(false);
                  })
                  .catch(err => {
                    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch messages';
                    setError(errorMsg);
                    // If we got an error but still have messages, we might be showing cached data
                    if (messages.length > 0) {
                      setIsShowingCachedData(true);
                    }
                  });
              }
            }}
            className="btn-primary px-4 py-2 rounded-md"
          >
            Retry
          </button>
          {isCircuitBreakerError && (
            <button
              onClick={() => {
                // Just dismiss the error and show any cached messages we might have
                setError(null);
                setIsShowingCachedData(true);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Show Cached Messages
            </button>
          )}
        </div>
      </div>
    );
  }

  // Ensure we're passing a valid array to MessageList
  return <MessageList messages={messages || []} onMarkAsRead={handleMarkAsRead} />;
}
