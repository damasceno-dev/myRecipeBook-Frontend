'use client';

import React, {useState} from 'react';
import {signIn} from 'next-auth/react';
import {useRouter} from 'next/navigation';
import {ThemeToggle} from '@/components/ThemeToggle';
import Image from 'next/image';
import {usePostUserLogin, usePostUserRegister} from '@/api/generated/myRecipeBookAPI';


export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();

  const loginMutation = usePostUserLogin();
  const registerMutation = usePostUserRegister();

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
        // Login flow
        await loginMutation.mutateAsync({
          data: {
            email: email.trim().toLowerCase(),
            password: password.trim(),
          },
        });

        const signInResult = await signIn('credentials', {
          username: email.trim().toLowerCase(),
          password: password.trim(),
          redirect: false,
          callbackUrl: '/myrecipes',
        });

        if (signInResult?.ok) {
          router.replace('/myrecipes');
        } else {
          setError('Failed to establish session. Please try again.');
        }
      } else {
        // Registration flow
        if (password !== confirmPassword) {
          setError('Passwords do not match');
        }

        // Register the user
        await registerMutation.mutateAsync({
          data: {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: password.trim(),
          },
        });

        // Automatically log in after successful registration
        await loginMutation.mutateAsync({
          data: {
            email: email.trim().toLowerCase(),
            password: password.trim(),
          },
        });

        const signInResult = await signIn('credentials', {
          username: email.trim().toLowerCase(),
          password: password.trim(),
          redirect: false,
          callbackUrl: '/myrecipes',
        });

        if (signInResult?.ok) {
          router.replace('/myrecipes');
        } else {
          setError('Registration successful but unable to log in automatically.');
        }
      }
    } catch (err: any) {
      console.error('Authentication error:', err);

      // Extract error messages from API response
      if (err?.errorMessages) {
        setError(`${err.errorMessages.join('. ')}.`);
      }  else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleGoogleSignIn = () => {
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
        <form className="mt-8 space-y-6" onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(e);
        }}
              method="post"
              action="#"
              noValidate
        >
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
                autoComplete="email"
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
                autoComplete={isLogin ? "current-password" : "new-password"}

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
                autoComplete="new-password"
              />
            </div>
          </div>

          <div>
            <button
                type="button"
                className="btn-primary"
                disabled={isLoading || isAnimating}
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(e);
                }}
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