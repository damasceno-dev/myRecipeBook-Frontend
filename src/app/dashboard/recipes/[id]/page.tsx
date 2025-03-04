'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardNav from '@/components/DashboardNav';
import { trpc } from '@/utils/trpc';
import type { RouterOutputs } from '@/utils/trpc';

type Recipe = RouterOutputs['recipe']['getById'];

export default function RecipeDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [error, setError] = useState('');

  const { data: recipe, isLoading } = trpc.recipe.getById.useQuery(params.id);

  const deleteRecipe = trpc.recipe.delete.useMutation({
    onSuccess: () => {
      router.push('/dashboard');
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;
    await deleteRecipe.mutateAsync(params.id);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardNav />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900 p-4 rounded-md">
              <p className="text-red-700 dark:text-red-200">{error}</p>
            </div>
          ) : recipe ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              {recipe.imageUrl && (
                <div className="relative h-96">
                  <Image
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {recipe.title}
                  </h1>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => router.push(`/dashboard/recipes/${recipe.id}/edit`)}
                      className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  {recipe.description}
                </p>

                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Ingredients
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Instructions
                  </h2>
                  <ol className="list-decimal list-inside space-y-4 text-gray-600 dark:text-gray-300">
                    {recipe.instructions.map((instruction, index) => (
                      <li key={index} className="ml-2">{instruction}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </ProtectedRoute>
  );
} 