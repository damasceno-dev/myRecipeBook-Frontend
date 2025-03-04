'use client';

import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useState } from 'react';
import Image from 'next/image';
import DashboardNav from '@/components/DashboardNav';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  createdAt: string;
  ingredients: string[];
  instructions: string[];
}

interface FilterOptions {
  search: string;
  sortBy: 'newest' | 'oldest' | 'title';
}

const SearchIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    sortBy: 'newest',
  });

  const { data: recipes, isLoading, error } = useQuery({
    queryKey: ['recipes', filters],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recipe/getByUser/10?search=${filters.search}&sortBy=${filters.sortBy}`, {
        headers: {
          Authorization: `Bearer ${session?.user?.token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch recipes');
      return response.json();
    },
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, sortBy: e.target.value as FilterOptions['sortBy'] }));
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome, {session?.user?.name}
            </h1>
            <button
              onClick={() => router.push('/dashboard/recipes/new')}
              className="btn-primary"
            >
              Create New Recipe
            </button>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Search recipes..."
                className="input-field pl-10 w-full"
                value={filters.search}
                onChange={handleSearchChange}
              />
            </div>
            <select
              className="input-field w-full sm:w-48"
              value={filters.sortBy}
              onChange={handleSortChange}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900 p-4 rounded-md">
              <p className="text-red-700 dark:text-red-200">
                {error instanceof Error ? error.message : 'An error occurred'}
              </p>
            </div>
          ) : recipes?.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {filters.search ? 'No recipes found' : 'No recipes yet'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {filters.search
                  ? 'Try adjusting your search terms'
                  : 'Get started by creating your first recipe!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe: Recipe) => (
                <div
                  key={recipe.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
                >
                  {recipe.imageUrl && (
                    <div className="relative h-48">
                      <Image
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {recipe.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                      {recipe.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(recipe.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => router.push(`/dashboard/recipes/${recipe.id}`)}
                        className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View Recipe
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 