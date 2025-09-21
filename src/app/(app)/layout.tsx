'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, bootstrapWorkspace, getUserWorkspace } from '@/lib/supabase';
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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      const workspaceId = await getUserWorkspace(session.user.id);
      
      if (!workspaceId) {
        const workspace = await bootstrapWorkspace(session.user.id);
        if (workspace) {
          setCurrentWorkspace(workspace.id);
        }
      } else {
        setCurrentWorkspace(workspaceId);
      }

      setIsLoading(false);
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
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
      <main className="pb-16">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
