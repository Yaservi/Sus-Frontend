'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthForm from '../../components/AuthForm';
import { useAuth } from '../../context/AuthContext';
import { RegisterCredentials } from '../../types';

export default function RegisterPage() {
  const { register, isAuthenticated, loading, error } = useAuth();
  const router = useRouter();

  // Redirect to messages page if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/messages');
    }
  }, [isAuthenticated, router]);

  const handleRegister = async (credentials: RegisterCredentials) => {
    await register(credentials);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col items-center justify-center py-8">
        <h1 className="text-2xl font-bold mb-8 text-primary">Create an Account</h1>

        <AuthForm 
          type="register" 
          onSubmit={handleRegister} 
          loading={loading} 
        />

        <p className="mt-6 text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:text-primary-light hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
