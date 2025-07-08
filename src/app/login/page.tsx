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
      <div className="flex flex-col items-center justify-center py-8">
        <h1 className="text-2xl font-bold mb-8 text-primary">Login to Your Account</h1>

        <AuthForm 
          type="login" 
          onSubmit={handleLogin} 
          loading={loading} 
        />

        <p className="mt-6 text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="text-primary hover:text-primary-light hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
