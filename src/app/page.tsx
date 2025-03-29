'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

const LoginContent = dynamic(() => import('@/components/LoginContent'), {
  ssr: false,
});

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
} 