'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  // Redirect to login page if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null; // Will redirect to login
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b">
        <Link href="/" className="text-3xl font-bold text-[#3A8DFF] mb-4 sm:mb-0">
          Sus! Anonymous Messaging
        </Link>

        <nav className="flex gap-4">
          <Link 
            href="/messages" 
            className="relative px-4 py-2 bg-[#3A8DFF] text-white rounded-md hover:bg-[#2A7DEF] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </Link>
          <button
            onClick={logout}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Logout
          </button>
        </nav>
      </header>

      <main className="flex flex-col gap-8">
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-700">Username</h2>
              <p className="text-gray-800">{user.username}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-700">User ID</h2>
              <p className="text-gray-800">{user.id}</p>
            </div>

            <div className="pt-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Your Anonymous Link</h2>
              <div className="bg-[#EBF4FF] p-3 rounded-md">
                <div className="flex items-center justify-between">
                  <p className="text-gray-800 break-all mr-2">
                    {`${window.location.origin}/?username=${user.username}`}
                  </p>
                  <button
                    onClick={() => {
                      const link = `${window.location.origin}/?username=${user.username}`;
                      navigator.clipboard.writeText(link);
                      // You could add a toast notification here
                      alert('Link copied to clipboard!');
                    }}
                    className="flex-shrink-0 p-2 bg-[#3A8DFF] text-white rounded-md hover:bg-[#2A7DEF] transition-colors"
                    title="Copy link to clipboard"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Share this link with others so they can send you anonymous messages.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Account Settings</h2>

          <div className="space-y-4">
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </section>
      </main>

      <footer className="mt-12 pt-6 border-t text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Sus! Anonymous Messaging. All rights reserved.</p>
      </footer>
    </div>
  );
}
