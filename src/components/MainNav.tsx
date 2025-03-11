'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {signOut, useSession} from 'next-auth/react';

export default function MainNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (path: string) => pathname === path;
  //
  // const handleSignOut = async () => {
  //   console.log('Signing out...');
  //   try {
  //     // Call the backend's user logout endpoint
  //     await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/logout`, {
  //       method: 'POST',
  //       headers: {
  //         'Authorization': `Bearer ${session?.user?.token}`,
  //       },
  //     });
  //   } catch (error) {
  //     console.error('Error during logout:', error);
  //   } finally {
  //     // Always sign out from NextAuth, even if backend logout fails
  //     signOut({ callbackUrl: '/' });
  //   }
  // };

  async function handleSignOut() {
    try {
      const response = await fetch('https://localhost:7219/user/logout', {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) {
        const text = await response.text();
        console.error("Logout failed with status", response.status, text);
      } else {
        console.log("Logout successful");
        // Proceed with any further steps, e.g., redirect to login page
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
    finally {
      const { url } = await signOut({ callbackUrl: '/', redirect: false });
      window.location.href = url || '/';
    }
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/myrecipes" className="text-xl font-bold text-gray-900 dark:text-white">
                MyRecipeBook
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/myrecipes"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/myrecipes')
                    ? 'border-blue-500 text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                My Recipes
              </Link>
              <Link
                href="/myrecipes/recipes/new"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/myrecipes/recipes/new')
                    ? 'border-blue-500 text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Create Recipe
              </Link>
              <Link
                href="/myrecipes/profile"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/myrecipes/profile')
                    ? 'border-blue-500 text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Profile
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleSignOut}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 