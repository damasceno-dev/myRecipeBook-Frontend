'use client';

import {useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import NextImage from 'next/image';
import ProtectedRoute from '@/components/ProtectedRoute';
import {useDeleteRecipeDeletebyidRecipeId, useGetRecipeGetbyidRecipeId} from '@/api/generated/myRecipeBookAPI';
import {ResponseErrorJson} from '@/api/generated/myRecipeBookAPI.schemas';
import MainNav from '@/components/MainNav';
import {useQueryClient} from "@tanstack/react-query";

export default function RecipeDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const queryClient = useQueryClient();
  const [imageKey, setImageKey] = useState(Date.now());
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [isImgLoading, setIsImgLoading] = useState<boolean>(true);
  const [isImageUpdating, setIsImageUpdating] = useState<boolean>(false);

  // Use a ref to track if we've already handled an image URL
  const processedImageUrlRef = useRef<string | null>(null);

  // Use query without excessive options
  const { data: recipe, isLoading, refetch } = useGetRecipeGetbyidRecipeId(params.id, {
    query: {
      refetchOnMount: true,
      staleTime: 0, // Always fetch fresh data
      cacheTime: 0, // Don't cache the data
    }
  });

  // Effect to handle image URL changes
  useEffect(() => {
    if (recipe?.imageUrl) {
      // Only update if the image URL has actually changed
      if (processedImageUrlRef.current !== recipe.imageUrl) {
        // Use Next.js revalidation for the image
        const imageUrlBase = recipe.imageUrl.split('?')[0];
        const newImageUrl = `${imageUrlBase}?v=${Date.now()}`;

        // Always update the image URL and key to force a refresh
        console.log('Updating image URL:', newImageUrl);
        setIsImageUpdating(true);
        setIsImgLoading(true);
        
        // Set the new image URL and key
        setImgSrc(newImageUrl);
        setImageKey(Date.now());
        processedImageUrlRef.current = recipe.imageUrl;

        // Prefetch the image
        const img = new Image();
        img.src = newImageUrl;
        img.onload = () => {
          console.log('Image prefetched successfully');
          setIsImgLoading(false);
          setIsImageUpdating(false);
        };
        img.onerror = () => {
          console.error('Failed to load image');
          setIsImgLoading(false);
          setIsImageUpdating(false);
        };
      }
    }
  }, [recipe?.imageUrl]);

  // Handle image update and refreshing
  const handleManualRefresh = () => {
    console.log('Manually refreshing...');
    // Force invalidate the query cache
    queryClient.invalidateQueries({
      queryKey: ['getRecipeGetbyidRecipeId', params.id]
    });
    refetch();
    // Force a new image key
    setImageKey(Date.now());
  };

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
                  {/* Image with refresh button */}
                  {imgSrc && (
                      <div className="relative h-96 mb-6">
                        {isImgLoading && (
                            <div className="absolute inset-0 flex justify-center items-center bg-gray-100">
                              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        )}
                        <NextImage
                            key={imageKey}
                            src={imgSrc}
                            alt={recipe.title || 'Recipe image'}
                            fill
                            className="object-cover rounded-lg"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            onLoad={() => setIsImgLoading(false)}
                            unoptimized={true}
                            priority={true}
                        />

                        {/* Refresh button */}
                        <button
                            onClick={handleManualRefresh}
                            className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 p-2 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-700"
                            aria-label="Refresh image"
                            disabled={isImageUpdating}
                        >
                          {isImageUpdating ? '🔄' : '🔄'}
                        </button>
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

                    <div className="mb-8 space-y-2 text-gray-700 dark:text-gray-300">
                      {/* Cooking Time */}
                      {recipe.cookingTime !== undefined && (
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">Cooking Time: </span>
                            <span className="ml-1">
        {recipe.cookingTime === 0 ? 'Less than 10 minutes' :
            recipe.cookingTime === 1 ? 'Between 10 and 30 minutes' :
                recipe.cookingTime === 2 ? 'Between 30 and 60 minutes' :
                    recipe.cookingTime === 3 ? 'Greater than 60 minutes' : 'Not specified'}
      </span>
                          </div>
                      )}

                      {/* Difficulty */}
                      {recipe.difficulty !== undefined && (
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">Difficulty: </span>
                            <span className="ml-1">
        {recipe.difficulty === 0 ? 'Low' :
            recipe.difficulty === 1 ? 'Medium' :
                recipe.difficulty === 2 ? 'High' : 'Not specified'}
      </span>
                          </div>
                      )}

                      {/* Dish Types */}
                      {recipe.dishTypes && recipe.dishTypes.length > 0 && (
                          <div className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                            <div className="flex gap-3">
                              <span className="font-medium">Dish Types: </span>
                              <div className="ml-1 flex flex-wrap gap-1 mt-1">
                                {recipe.dishTypes.map((type) => (
                                    <span key={type} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                                      {type === 0 ? 'Appetizers' :
                                          type === 1 ? 'Breakfast' :
                                              type === 2 ? 'Dessert' :
                                                  type === 3 ? 'Dinner' :
                                                      type === 4 ? 'Drinks' :
                                                          type === 5 ? 'Lunch' :
                                                              type === 6 ? 'Snacks' : `Type ${type}`}
                                    </span>
                                ))}
                              </div>
                            </div>
                          </div>
                      )}
                    </div>

                    <div className="mb-8">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Ingredients
                      </h2>
                      <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 marker:text-blue-500">
                        {recipe.ingredients?.map((ingredient, index) => (
                            <li key={index}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold mb-2">Instructions</h2>
                      <ol className="list-decimal pl-5">
                        {recipe?.instructions
                            ?.slice() // Create a copy to avoid mutating the original array
                            .sort((a, b) => (a.step ?? 0) - (b.step ?? 0)) // Sort by step number
                            .map((instruction) => (
                                <li key={`instruction-${instruction.step}`} className="mb-2">
                                  {instruction.text}
                                </li>
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