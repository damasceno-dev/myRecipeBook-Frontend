'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function RedirectAfterLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleRedirect = async () => {
      const token = searchParams.get('token');
      const name = searchParams.get('name');
      const email = searchParams.get('email');
      console.log(token);

      if (token && name && email) {
        // For external login, we pass the token as the password
        // The NextAuth configuration will recognize it as an external login
        // and create a session without password verification
        const result = await signIn('credentials', {
          username: email,
          password: token, // This is not actually used as a password
          redirect: false,
        });

        if (result?.error) {
          console.error('Failed to establish session:', result.error);
          router.push('/');
        } else {
          router.push('/myrecipes');
        }
      } else {
        console.error('Missing required parameters');
        router.push('/');
      }
    };

    handleRedirect();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
} 