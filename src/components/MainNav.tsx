'use client';

import Link from 'next/link';
import Image from 'next/image';
import {usePathname} from 'next/navigation';
import {signOut} from 'next-auth/react';
import {Plus, Sparkles, Menu, X, User} from 'lucide-react';
import React, {useState} from "react";

export default function MainNav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

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
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
    finally {
      const { url } = await signOut({ callbackUrl: '/', redirect: false });
      window.location.href = url || '/';
    }
  }

  const NavLinks = () => (
    <>
      <Link
        href="/myrecipes"
        className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
          isActive('/myrecipes')
            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-100'
            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
         <span className="flex items-center">
          <Image 
            src={isActive('/myrecipes') ? "/chef-hat-blue.svg" : "/chef-hat.svg"}
            alt="My Recipes" 
            width={24} 
            height={24} 
            className="h-5 w-5 mr-2"
          />
          My Recipes
          </span>
      </Link>
      <Link
        href="/myrecipes/recipes/new"
        className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
          isActive('/myrecipes/recipes/new')
            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-100'
            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        <span className="flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Create Recipe
        </span>
      </Link>
      <Link
        href="/myrecipes/recipes/generate"
        className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
          isActive('/myrecipes/recipes/generate')
            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-100'
            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        <span className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2" />
          Generate with AI
        </span>
      </Link>
      <Link
        href="/myrecipes/profile"
        className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
          isActive('/myrecipes/profile')
            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-100'
            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        <span className="flex items-center">
          <User className="h-5 w-5 mr-2" />
          Profile
        </span>
      </Link>
    </>
  );

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <div className="sm:hidden mr-4">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors duration-200"
              >
                {isMenuOpen ? (
                  <X className="block h-6 w-6 transition-transform duration-200" />
                ) : (
                  <Menu className="block h-6 w-6 transition-transform duration-200" />
                )}
              </button>
            </div>
            <Link href="/myrecipes" className="text-xl font-bold text-gray-900 dark:text-white">
              MyRecipeBook
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavLinks />
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleSignOut}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div 
        className={`sm:hidden transition-all duration-300 ease-in-out transform ${
          isMenuOpen 
            ? 'opacity-100 translate-y-0 max-h-screen' 
            : 'opacity-0 -translate-y-4 max-h-0 overflow-hidden pointer-events-none'
        }`}
      >
        <div className="pt-2 pb-3 space-y-1 bg-white dark:bg-gray-800 shadow-lg">
          <NavLinks />
        </div>
      </div>
    </nav>
  );
} 