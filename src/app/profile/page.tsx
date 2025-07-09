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
    <div className="container mx-auto px-4 py-8 max-w-4xl bg-secondary">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4">
        <Link href="/" className="text-3xl font-bold text-primary mb-4 sm:mb-0">
        </Link>
      </header>

      <main className="flex flex-col gap-8">
        <section className="card">
          <h1 className="text-2xl font-bold mb-6 text-primary">Your Profile</h1>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-primary-light">Username</h2>
              <p className="text-foreground">{user.username}</p>
            </div>

            <div className="pt-4">
              <h2 className="text-lg font-semibold text-primary-light mb-2">Your Anonymous Link</h2>
              <div className="bg-gray-light p-3 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="bg-white border border-gray rounded-md px-3 py-2 flex-1 mr-2">
                    <p className="text-foreground break-all">
                      {`${window.location.origin}/?username=${user.username}`}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const link = `${window.location.origin}/?username=${user.username}`;
                      navigator.clipboard.writeText(link);
                      // You could add a toast notification here
                      alert('Link copied to clipboard!');
                    }}
                    className="flex-shrink-0 p-2 btn-primary rounded-md"
                    title="Copy link to clipboard"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-dark mt-2">
                  Share this link with others so they can send you anonymous messages.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="text-xl font-bold mb-4 text-primary">Account Settings</h2>

          <div className="space-y-4">
            <button
              onClick={logout}
              className="px-4 py-2 btn-primary rounded-md"
            >
              Logout
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
