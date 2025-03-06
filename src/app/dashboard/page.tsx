'use client';

import { useState, useEffect } from 'react';
import { useGetRecipeGetbyuserNumberOfRecipes } from '@/api/generated/myRecipeBookAPI';
import { ResponseShortRecipeJson } from '@/api/generated/myRecipeBookAPI.schemas';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';

interface FilterOptions {
  search: string;
  sortBy: 'title';
}

interface ApiResponse {
  data: ResponseShortRecipeJson[];
}

export default function DashboardPage() {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: '',
    sortBy: 'title',
  });
  const [filteredRecipes, setFilteredRecipes] = useState<ResponseShortRecipeJson[]>([]);
  const router = useRouter();

  const { data: recipes, isLoading, error } = useGetRecipeGetbyuserNumberOfRecipes(10);

  useEffect(() => {
    if (!recipes) return;

    // Handle the response which might be nested under data property
    const recipesArray = Array.isArray(recipes) ? recipes : (recipes as any)?.data || [];
    let filtered = [...recipesArray];

    // Apply search filter
    if (filterOptions.search) {
      const searchLower = filterOptions.search.toLowerCase();
      filtered = filtered.filter(
        (recipe) =>
          (recipe.title?.toLowerCase() || '').includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      return (a.title || '').localeCompare(b.title || '');
    });

    setFilteredRecipes(filtered);
  }, [recipes, filterOptions]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterOptions((prev) => ({ ...prev, search: e.target.value }));
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterOptions((prev) => ({ ...prev, sortBy: e.target.value as FilterOptions['sortBy'] }));
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900 p-4 rounded-md">
            <p className="text-red-700 dark:text-red-200">
              Error loading recipes. Please try refreshing the page.
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Handle the response which might be nested under data property
  const recipesArray = Array.isArray(recipes) ? recipes : (recipes as any)?.data || [];

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={filterOptions.search}
              onChange={handleSearchChange}
              className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <select
            value={filterOptions.sortBy}
            onChange={handleSortChange}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="title">Title (A-Z)</option>
          </select>
        </div>

        {(!recipesArray || recipesArray.length === 0) ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Welcome to MyRecipeBook!
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              You don't have any recipes yet. Get started by creating your first recipe!
            </p>
            <button
              onClick={() => router.push('/dashboard/recipes/new')}
              className="btn-primary"
            >
              Create Your First Recipe
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <img
                  src={recipe.imageUrl || '/placeholder-recipe.jpg'}
                  alt={recipe.title || 'Recipe'}
                  className="h-48 w-full object-cover"
                />
                <div className="p-4">
                  <h3 className="mb-2 text-lg font-semibold">{recipe.title || 'Untitled Recipe'}</h3>
                  <p className="text-sm text-gray-600">
                    {recipe.quantityIngredients ? `${recipe.quantityIngredients} ingredients` : 'No ingredients listed'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}