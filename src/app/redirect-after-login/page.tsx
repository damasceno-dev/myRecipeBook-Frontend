'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Suspense } from 'react';

function RedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleRedirect = async () => {
      console.log('Redirect page - Session status:', status);
      console.log('Redirect page - Current session:', session);

      const error = searchParams.get('error');
      const token = searchParams.get('token');
      const email = searchParams.get('email');
      const name = searchParams.get('name');
      const refreshToken = searchParams.get('refreshToken');

      const redirectParams = {
        error,
        token,
        email,
        name,
        refreshToken,
      };

      console.log('Redirect params:', redirectParams);

      if (error) {
        console.error('Error during redirect:', error);
        router.push('/');
        return;
      }

      if (token && email && name) {
        console.log('Attempting to establish session with token');
        try {
          // First attempt to sign in
          const result = await signIn('credentials', {
            username: email,
            password: token,
            redirect: false,
            callbackUrl: '/myrecipes',
          });

          console.log('SignIn result:', result);

          if (result?.error) {
            console.error('SignIn error:', result.error);
            router.push('/');
            return;
          }

          // If we get a CSRF URL, we need to handle it
          if (result?.url?.includes('csrf=true')) {
            console.log('CSRF token required, retrying sign in...');
            // Wait a bit for CSRF token to be set
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Retry sign in
            const retryResult = await signIn('credentials', {
              username: email,
              password: token,
              redirect: false,
              callbackUrl: '/myrecipes',
            });

            console.log('Retry SignIn result:', retryResult);

            if (retryResult?.error) {
              console.error('Retry SignIn error:', retryResult.error);
              router.push('/');
              return;
            }

            if (retryResult?.ok) {
              console.log('Session established after CSRF retry');
              router.push('/myrecipes');
              return;
            }
          }

          if (result?.ok) {
            console.log('Session established successfully');
            router.push('/myrecipes');
          }
        } catch (error) {
          console.error('Error during signIn:', error);
          router.push('/');
        }
      } else if (session?.user) {
        console.log('User already authenticated, redirecting to myrecipes');
        router.push('/myrecipes');
      } else {
        console.log('No valid session or credentials, redirecting to home');
        router.push('/');
      }
    };

    handleRedirect();
  }, [router, searchParams, session, status]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner />
    </div>
  );
}

export default function RedirectPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    }>
      <RedirectContent />
    </Suspense>
  );
} 