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
        <Link href="/" className="text-3xl font-bold text-blue-600 mb-4 sm:mb-0">
          Sus! Anonymous Messaging
        </Link>
        
        <nav className="flex gap-4">
          <Link 
            href="/messages" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            My Messages
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
              <div className="bg-gray-100 p-3 rounded-md">
                <p className="text-gray-800 break-all">
                  {`${window.location.origin}/?username=${user.username}`}
                </p>
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