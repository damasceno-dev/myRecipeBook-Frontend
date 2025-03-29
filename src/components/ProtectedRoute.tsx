'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log('ProtectedRoute - Auth Status:', status);
    console.log('ProtectedRoute - Session Data:', session);
    
    if (status === 'unauthenticated') {
      console.log('ProtectedRoute - Redirecting to home due to unauthenticated status');
      router.push('/');
    }
  }, [status, router, session]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === 'authenticated') {
    console.log('ProtectedRoute - Rendering protected content');
    return <>{children}</>;
  }

  return null;
} 