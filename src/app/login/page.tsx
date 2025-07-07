'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthForm from '../../components/AuthForm';
import { useAuth } from '../../context/AuthContext';
import { LoginCredentials } from '../../types';

export default function LoginPage() {
  const { login, isAuthenticated, loading, error } = useAuth();
  const router = useRouter();

  // Redirect to messages page if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/messages');
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (credentials: LoginCredentials) => {
    await login(credentials);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="flex justify-between items-center mb-8 pb-4 border-b">
        <Link href="/" className="text-3xl font-bold text-blue-600">
          Sus! Anonymous Messaging
        </Link>
      </header>

      <main className="flex flex-col items-center justify-center py-8">
        <h1 className="text-2xl font-bold mb-8">Login to Your Account</h1>
        
        <AuthForm 
          type="login" 
          onSubmit={handleLogin} 
          loading={loading} 
        />
        
        <p className="mt-6 text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:underline">
            Register here
          </Link>
        </p>
      </main>

      <footer className="mt-12 pt-6 border-t text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Sus! Anonymous Messaging. All rights reserved.</p>
      </footer>
    </div>
  );
}