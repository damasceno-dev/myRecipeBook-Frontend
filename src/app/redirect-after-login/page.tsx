'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';

export default function RedirectAfterLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  useEffect(() => {
    const handleRedirect = async () => {
      const error = searchParams.get('error');
      const token = searchParams.get('token');
      const email = searchParams.get('email');

      if (error) {
        // If there's an error, redirect to login page with the error message
        router.push(`/?error=${encodeURIComponent(error)}`);
        return;
      }

      if (token && email) {
        // If we have a token from the backend, establish a session
        const result = await signIn('credentials', {
          username: email,
          password: token,
          redirect: false,
        });

        if (result?.ok) {
          router.push('/myrecipes');
        } else {
          router.push('/?error=Failed to establish session');
        }
      } else if (session?.user) {
        // If we already have a valid session, redirect to myrecipes
        router.push('/myrecipes');
      } else {
        // If no session or token, redirect to home
        router.push('/');
      }
    };

    handleRedirect();
  }, [router, searchParams, session]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
} 