'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import Image from 'next/image';
import { usePostUserRegister, usePostUserLogin } from '@/api/generated/myRecipeBookAPI';
console.log('Before LoginPage definition');

export default function LoginPage() {
  console.log('entrei no componente login')
  console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  console.log('NEXTAUTH_URL:', process.env.NEXT_PUBLIC_AUTH_URL);

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();

  const registerMutation = usePostUserRegister();
  const loginMutation = usePostUserLogin();

  const clearForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  const toggleAuthMode = () => {
    setIsAnimating(true);
    setIsLogin(!isLogin);
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        console.log('Attempting login with:', { email, password });
        const result = await loginMutation.mutateAsync({
          data: {
            email: email.trim().toLowerCase(),
            password: password.trim(),
          },
        });
        console.log('Login response:', result);

        // Check both possible response structures
        if (result?.responseToken || (result as any)?.data?.responseToken) {
          // Sign in with NextAuth to manage the session
          const signInResult = await signIn('credentials', {
            username: email.trim().toLowerCase(),
            password: password.trim(),
            redirect: false,
          });

          if (signInResult?.error) {
            setError('Failed to establish session. Please try again.');
            return;
          }

          // Use replace instead of push to prevent back navigation to login
          router.replace('/myrecipes');
        } else {
          setError('Invalid email or password. Please check your credentials and try again.');
        }
      } else {
        // Validate passwords match
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }

        // Handle registration
        console.log('Attempting registration with:', { name, email, password });
        const result = await registerMutation.mutateAsync({
          data: {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: password.trim(),
          },
        });
        console.log('Registration response:', result);

        // After successful registration, automatically log in
        console.log('Attempting auto-login after registration');
        const loginResult = await loginMutation.mutateAsync({
          data: {
            email: email.trim().toLowerCase(),
            password: password.trim(),
          },
        });
        console.log('Auto-login response:', loginResult);

        // Check both possible response structures
        if (loginResult?.responseToken || (loginResult as any)?.data?.responseToken) {
          // Sign in with NextAuth to manage the session
          const signInResult = await signIn('credentials', {
            username: email.trim().toLowerCase(),
            password: password.trim(),
            redirect: false,
          });

          if (signInResult?.error) {
            setError('Registration successful but failed to establish session. Please try logging in manually.');
            return;
          }

          // Use replace instead of push to prevent back navigation to login
          router.replace('/myrecipes');
        } else {
          setError('Registration successful but login failed. Please try logging in manually.');
        }
      }
    } catch (error) {
      console.error('Error details:', error);
      if (error instanceof Error) {
        const apiError = error as any;
        if (apiError.response?.data?.errorMessages) {
          setError(apiError.response.data.errorMessages.join(', '));
        } else if (apiError.response?.data?.message) {
          setError(apiError.response.data.message);
        } else {
          setError(error.message);
        }
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    console.log('login page:')
    console.log(`${process.env.NEXT_PUBLIC_API_URL}/user/login/google?returnUrl=${encodeURIComponent(`${process.env.NEXT_PUBLIC_AUTH_URL}/redirect-after-login`)}`)
    
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/user/login/google?returnUrl=${encodeURIComponent(`${process.env.NEXT_PUBLIC_AUTH_URL}/redirect-after-login`)}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-12">
      <ThemeToggle />
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            {isLogin ? 'Sign in to MyRecipeBook' : 'Create your account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              onClick={toggleAuthMode}
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              disabled={isAnimating}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-4">
            <div
              className={`transform transition-all duration-500 ease-in-out ${
                !isLogin
                  ? 'opacity-100 max-h-20 translate-y-0'
                  : 'opacity-0 max-h-0 -translate-y-4 pointer-events-none'
              }`}
            >
              <label htmlFor="name" className="sr-only">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required={!isLogin}
                className="input-field"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="transform transition-all duration-500 ease-in-out">
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="transform transition-all duration-500 ease-in-out">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-field"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div
              className={`transform transition-all duration-500 ease-in-out ${
                !isLogin
                  ? 'opacity-100 max-h-20 translate-y-0'
                  : 'opacity-0 max-h-0 -translate-y-4 pointer-events-none'
              }`}
            >
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required={!isLogin}
                className="input-field"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading || isAnimating}
            >
              {isLoading ? (isLogin ? 'Signing in...' : 'Creating account...') : (isLogin ? 'Sign in' : 'Create account')}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="p-2 bg-black dark:bg-black text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="btn-google"
              disabled={isAnimating}
            >
              <span className="flex items-center justify-center">
                <Image
                  src="/google.svg"
                  alt="Google logo"
                  width={20}
                  height={20}
                  className="mr-2"
                />
                {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 