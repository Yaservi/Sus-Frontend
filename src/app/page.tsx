'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import SendMessageForm from '../components/SendMessageForm';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { unreadCount } = useWebSocket();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b">
        <h1 className="text-3xl font-bold text-[#3A8DFF] mb-4 sm:mb-0">Sus! Anonymous Messaging</h1>

        <nav className="flex gap-4">
          {isAuthenticated ? (
            <>
              <Link 
                href="/messages" 
                className="relative px-4 py-2 bg-[#3A8DFF] text-white rounded-md hover:bg-[#2A7DEF] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
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
                className="px-4 py-2 bg-[#3A8DFF] text-white rounded-md hover:bg-[#2A7DEF] transition-colors"
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
          <h2 className="text-2xl font-bold mb-4">Welcome to Sus! Anonymous Messaging</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Send anonymous messages to anyone. No account required to send messages, but you'll need to register to receive and read your messages.
          </p>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Register now to get your personal link that others can use to send you anonymous messages!
          </p>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#EBF4FF] text-[#3A8DFF] rounded-full flex items-center justify-center text-xl font-bold mb-3">1</div>
              <h3 className="font-semibold mb-2">Send Messages</h3>
              <p className="text-gray-600">Send anonymous messages to any user by entering their username.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#EBF4FF] text-[#3A8DFF] rounded-full flex items-center justify-center text-xl font-bold mb-3">2</div>
              <h3 className="font-semibold mb-2">Create Account</h3>
              <p className="text-gray-600">Register to receive and read messages sent to you.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#EBF4FF] text-[#3A8DFF] rounded-full flex items-center justify-center text-xl font-bold mb-3">3</div>
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
