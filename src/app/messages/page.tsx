'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebSocketContext';
import { MessageListContainer } from '../../components/MessageList';
import { getMessages, markMessagesAsRead } from '../../lib/api';
import { Message } from '../../types';

export default function MessagesPage() {
  const { user, token, isAuthenticated, logout } = useAuth();
  const { connected: wsConnected, unreadCount, reconnecting, reconnect } = useWebSocket();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login page if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

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
  const handleMarkAsRead = async (messageIds: number[]) => {
    if (!user || !token || messageIds.length === 0) return;

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
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b">
        <Link href="/" className="text-3xl font-bold text-blue-600 mb-4 sm:mb-0">
          Sus! Anonymous Messaging
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <span className={`w-3 h-3 rounded-full mr-2 ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm text-gray-600">
                {wsConnected ? 'Connected' : 'Disconnected'}
                {!wsConnected && reconnecting && ' (Reconnecting...)'}
              </span>
            </div>
            {!wsConnected && !reconnecting && (
              <button
                onClick={reconnect}
                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                title="Try to reconnect to the notification service"
              >
                Reconnect
              </button>
            )}
          </div>

          <button
            onClick={logout}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex flex-col gap-8">
        <section>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">My Messages</h1>
            {unreadCount > 0 && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {unreadCount} unread
              </span>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8">Loading messages...</div>
          ) : error ? (
            <div className="text-center py-4">
              <div className="text-red-600 mb-3">
                {error}
                {messages.length > 0 && error.includes('Circuit breaker open') && (
                  <div className="mt-2 text-amber-600 text-sm">
                    Showing cached messages. Some information may be outdated.
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button 
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    // Retry fetching messages
                    if (user && token) {
                      getMessages(user.username, token)
                        .then(fetchedMessages => {
                          // Ensure we're setting a valid array even if fetchedMessages is somehow null
                          setMessages(fetchedMessages || []);
                          setLoading(false);
                        })
                        .catch(err => {
                          const errorMsg = err instanceof Error ? err.message : 'Failed to fetch messages';
                          setError(errorMsg);
                          setLoading(false);
                          console.error('Error retrying fetch messages:', err);
                        });
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
                {error.includes('Circuit breaker open') && (
                  <button
                    onClick={() => {
                      // Just dismiss the error and show the MessageListContainer
                      // which will use cached data if available
                      setError(null);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Show Cached Messages
                  </button>
                )}
              </div>
            </div>
          ) : (
            <MessageListContainer />
          )}
        </section>
      </main>

      <footer className="mt-12 pt-6 border-t text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Sus! Anonymous Messaging. All rights reserved.</p>
      </footer>
    </div>
  );
}
