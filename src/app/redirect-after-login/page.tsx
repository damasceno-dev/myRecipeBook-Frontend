'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';

function RedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  useEffect(() => {
    const handleRedirect = async () => {
      const error = searchParams.get('error');
      const token = searchParams.get('token');
      const email = searchParams.get('email');
      const name = searchParams.get('name');
      console.log('Redirect params:', { error, token, email, name });

      if (error) {
        console.error('Error in redirect:', error);
        router.push(`/?error=${encodeURIComponent(error)}`);
        return;
      }

      if (token && email) {
        console.log('Attempting to establish session with token');
        try {
          // If we have a token from the backend, establish a session
          const result = await signIn('credentials', {
            username: email,
            password: token,
            redirect: false,
          });

          console.log('SignIn result:', result);

          if (result?.ok) {
            console.log('Session established successfully, redirecting to myrecipes');
            router.push('/myrecipes');
          } else {
            console.error('Failed to establish session:', result?.error);
            router.push('/?error=Failed to establish session');
          }
        } catch (error) {
          console.error('Error during signIn:', error);
          router.push('/?error=Failed to establish session');
        }
      } else if (session?.user) {
        console.log('Valid session found, redirecting to myrecipes');
        router.push('/myrecipes');
      } else {
        console.log('No session or token found, redirecting to home');
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

export default function RedirectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <RedirectContent />
    </Suspense>
  );
} 