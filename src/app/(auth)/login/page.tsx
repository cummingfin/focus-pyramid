'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    console.log(`Attempting ${isSigningUp ? 'sign up' : 'sign in'} for: ${email}`);

    try {
      let authResponse;
      if (isSigningUp) {
        authResponse = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
      } else {
        authResponse = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      }

      const { data, error } = authResponse;

      if (error) {
        console.error('Auth error:', error);
        setMessage(error.message);
      } else if (isSigningUp) {
        setMessage('Check your email for a confirmation link!');
        setEmail('');
        setPassword('');
      } else if (data.user) {
        console.log('Sign in successful:', data.user);
        setMessage('Sign in successful! Redirecting...');
        router.push('/pyramid');
      } else {
        setMessage('An unexpected error occurred.');
      }
    } catch (err: any) {
      console.error('Unexpected auth error:', err);
      setMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isSigningUp ? 'Sign up for Focus Pyramid' : 'Sign in to Focus Pyramid'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link href="/reset-password" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? 'Loading...' : (isSigningUp ? 'Sign Up' : 'Sign In')}
            </button>
          </div>
        </form>

        <div className="text-center text-sm">
          <button
            onClick={() => setIsSigningUp(!isSigningUp)}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            {isSigningUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </div>

        {message && (
          <p className="mt-2 text-center text-sm text-gray-600">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
