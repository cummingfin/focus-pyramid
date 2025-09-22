'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';
import MobileNav from '@/components/MobileNav';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { setLoading, setCurrentWorkspace } = useAppStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }

        console.log('User authenticated:', session.user.email);
        
        // For now, just set a dummy workspace ID to make the app work
        setCurrentWorkspace('demo-workspace');
        
        setIsLoading(false);
        setLoading(false);
        
        // Redirect to pyramid page if user lands on any other app route
        const currentPath = window.location.pathname;
        if (currentPath === '/' || currentPath === '/today') {
          router.push('/pyramid');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        router.push('/login');
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in, setting demo workspace');
          setCurrentWorkspace('demo-workspace');
          
          // Redirect to pyramid page after successful sign in
          const currentPath = window.location.pathname;
          if (currentPath === '/' || currentPath === '/today') {
            router.push('/pyramid');
          }
        } else if (event === 'SIGNED_OUT' || !session) {
          console.log('User signed out, redirecting to login');
          setCurrentWorkspace(null);
          router.push('/login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router, setLoading, setCurrentWorkspace]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pb-24">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
