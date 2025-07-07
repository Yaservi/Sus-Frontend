'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import SendMessageForm from '../components/SendMessageForm';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { unreadCount } = useWebSocket();
  const [recipientUsername, setRecipientUsername] = useState('');
  const [showSendForm, setShowSendForm] = useState(false);
  const searchParams = useSearchParams();

  // Check for username in URL parameters
  useEffect(() => {
    const username = searchParams.get('username');
    if (username) {
      setRecipientUsername(username);
      setShowSendForm(true);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (recipientUsername.trim()) {
      setShowSendForm(true);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b">
        <h1 className="text-3xl font-bold text-blue-600 mb-4 sm:mb-0">Sus! Anonymous Messaging</h1>

        <nav className="flex gap-4">
          {isAuthenticated ? (
            <>
              <Link 
                href="/messages" 
                className="relative px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                My Messages
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <Link 
                href="/profile" 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Profile
              </Link>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="flex flex-col gap-8">
        <section className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Send Anonymous Messages</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Send anonymous messages to anyone. No account required to send messages, but you'll need to register to receive and read your messages.
          </p>

          {!showSendForm ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={recipientUsername}
                  onChange={(e) => setRecipientUsername(e.target.value)}
                  placeholder="Enter recipient's username"
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            </form>
          ) : (
            <div className="max-w-md mx-auto">
              <SendMessageForm 
                recipientUsername={recipientUsername} 
                onMessageSent={() => setShowSendForm(false)}
              />
              <button
                onClick={() => setShowSendForm(false)}
                className="mt-4 px-4 py-2 text-blue-600 hover:underline"
              >
                ← Back
              </button>
            </div>
          )}
        </section>

        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mb-3">1</div>
              <h3 className="font-semibold mb-2">Send Messages</h3>
              <p className="text-gray-600">Send anonymous messages to any user by entering their username.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mb-3">2</div>
              <h3 className="font-semibold mb-2">Create Account</h3>
              <p className="text-gray-600">Register to receive and read messages sent to you.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mb-3">3</div>
              <h3 className="font-semibold mb-2">Real-time Notifications</h3>
              <p className="text-gray-600">Get instant notifications when you receive new messages.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-12 pt-6 border-t text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Sus! Anonymous Messaging. All rights reserved.</p>
      </footer>
    </div>
  );
}
