'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import Image from 'next/image';
import ProtectedRoute from '@/components/ProtectedRoute';
import {useDeleteRecipeDeletebyidRecipeId, useGetRecipeGetbyidRecipeId} from '@/api/generated/myRecipeBookAPI';
import {ResponseErrorJson} from '@/api/generated/myRecipeBookAPI.schemas';
import MainNav from '@/components/MainNav';

export default function RecipeDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: recipe, isLoading } = useGetRecipeGetbyidRecipeId(params.id);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [isImgLoading, setIsImgLoading] = useState<boolean>(true);

  const deleteRecipe = useDeleteRecipeDeletebyidRecipeId({
    mutation: {
      onSuccess: () => {
        router.push('/myrecipes');
      },
      onError: (error: ResponseErrorJson) => {
        setError(error.errorMessages?.[0] || 'Failed to delete recipe');
      },
    },
  });

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    await deleteRecipe.mutateAsync({ recipeId: params.id });
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  useEffect(() => {
    if (recipe && recipe.imageUrl) {
      setImgSrc(recipe.imageUrl);
      setIsImgLoading(true);
    }
  }, [recipe]);



  return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <MainNav />
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
                  {imgSrc && (
                      <div className="relative h-96">
                        {isImgLoading && (
                            <div className="absolute inset-0 flex justify-center items-center bg-gray-100 dark:bg-gray-700">
                              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        )}
                        <Image
                            src={imgSrc}
                            alt={recipe.title || 'Recipe'}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            onLoad={() => setIsImgLoading(false)}
                            onError={() => {
                              // Remove fallback logic.
                              // When an error occurs, we deliberately keep the spinner visible until the image is
                              // loaded.
                              console.error('Error loading image from S3.');
                            }}
                        />
                      </div>
                  )}



                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {recipe.title || 'Untitled Recipe'}
                      </h1>
                      <div className="flex space-x-4">
                        <button
                            onClick={() => router.push(`/myrecipes/recipes/${recipe.id}/edit`)}
                            className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Edit
                        </button>
                        <button
                            onClick={handleDeleteClick}
                            className="text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {recipe.cookingTime && (
                        <div className="mb-4">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Cooking Time: {recipe.cookingTime}
                    </span>
                        </div>
                    )}

                    {recipe.difficulty && (
                        <div className="mb-4">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Difficulty: {recipe.difficulty}
                    </span>
                        </div>
                    )}

                    {recipe.dishTypes && recipe.dishTypes.length > 0 && (
                        <div className="mb-4">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Dish Types: {recipe.dishTypes.join(', ')}
                    </span>
                        </div>
                    )}

                    <div className="mb-8">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Ingredients
                      </h2>
                      <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                        {recipe.ingredients?.map((ingredient, index) => (
                            <li key={index}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Instructions
                      </h2>
                      <ol className="list-decimal list-inside space-y-4 text-gray-600 dark:text-gray-300">
                        {recipe.instructions?.map((instruction, index) => (
                            <li key={index} className="ml-2">{instruction.text}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>

            ) : null}
            <button
                onClick={() => router.push('/myrecipes')}
                className="mt-4 text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              &larr; Back to My Recipes
            </button>
          </div>

          {/* Modal Implementation */}
          {showDeleteModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm w-full">
                  <p className="mb-4 text-gray-900 dark:text-white">
                    Are you sure you want to delete this recipe?
                  </p>
                  <div className="flex justify-end space-x-4">
                    <button
                        onClick={cancelDelete}
                        className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
                    >
                      No
                    </button>
                    <button
                        onClick={confirmDelete}
                        className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
                    >
                      Yes
                    </button>
                  </div>
                </div>
              </div>
          )}
        </div>
      </ProtectedRoute>
  );
}