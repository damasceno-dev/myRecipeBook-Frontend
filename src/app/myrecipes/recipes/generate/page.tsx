'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import MainNav from '@/components/MainNav';
import {  usePostRecipeGeneratewithai, usePutUpdateImageRecipeId, usePostRecipeRegister } from '@/api/generated/myRecipeBookAPI';
import { RequestRecipeJson } from '@/api/generated/myRecipeBookAPI.schemas';
import { ImageUpload } from '@/components/ImageUpload';
import { Plus, Trash2 } from 'lucide-react';

export default function GenerateRecipePage() {
  const router = useRouter();
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [generatedRecipe, setGeneratedRecipe] = useState<RequestRecipeJson | null>(null);
  const [, setRecipeId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const createRecipeWithAi = usePostRecipeGeneratewithai({
    mutation: {
      onSuccess: (data) => {
        if (data.id) {
          setRecipeId(data.id);
        }
        setGeneratedRecipe(data);
        setIsLoading(false);
      },
      onError: (error) => {
        setError(error.errorMessages?.[0] || 'Failed to create recipe');
        setIsLoading(false);
      },
    },
  });

  const createRecipe = usePostRecipeRegister({
    mutation: {
      onSuccess: (data) => {
        if (data.id && imageFile) {
          updateImage.mutateAsync({
            recipeId: data.id,
            data: { file: imageFile }
          });
        } else {
          router.push('/myrecipes');
        }
        setIsSaving(false);
      },
      onError: (error) => {
        setError(error.errorMessages?.[0] || 'Failed to save recipe');
        setIsSaving(false);
      },
    },
  });

  const updateImage = usePutUpdateImageRecipeId({
    mutation: {
      onSuccess: () => {
        router.push('/myrecipes');
      },
      onError: (error) => {
        setError(error.errorMessages?.[0] || 'Failed to update image');
      },
    },
  });

  const handleAddIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const handleImageChange = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const nonEmptyIngredients = ingredients.filter(ing => ing.trim() !== '');

      // Get AI suggestion
      const recipeIngredients = { ingredients: nonEmptyIngredients };
      const aiResponse = await createRecipeWithAi.mutateAsync({ data: recipeIngredients });
      
      // Show the generated recipe in editable format
      setGeneratedRecipe(aiResponse);
    } catch (err: any) {
      setError(err.errorMessages?.join('. ') || 'Failed to generate recipe');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!generatedRecipe) return;
    
    setIsSaving(true);
    try {
      const recipeData = {
        Title: generatedRecipe.title || '',
        CookingTime: generatedRecipe.cookingTime,
        Difficulty: generatedRecipe.difficulty,
        Ingredients: generatedRecipe.ingredients || [],
        Instructions: generatedRecipe.instructions?.map(inst => ({
          Step: inst.step,
          Text: inst.text || undefined
        })) || [],
        DishTypes: generatedRecipe.dishTypes || [],
        ImageFile: imageFile || undefined
      };

      await createRecipe.mutateAsync({ data: recipeData });
    } catch (err: any) {
      setError(err.errorMessages.join('. ') + "." || 'Failed to save recipe');
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <MainNav />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Generate Recipe with AI
          </h1>

          {error && (
            <div className="bg-red-50 dark:bg-red-900 p-4 rounded-md mb-6">
              <p className="text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ingredients
              </label>
              <div className="space-y-2">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={ingredient}
                      onChange={(e) => handleIngredientChange(index, e.target.value)}
                      className="input-field flex-1"
                      placeholder="Enter an ingredient"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(index)}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-5 w-5" />
                  Add Ingredient
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'Generate Recipe'}
            </button>
          </form>

          {generatedRecipe && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Generated Recipe
                </h2>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={generatedRecipe.title || ''}
                      readOnly
                      className="input-field w-full"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Cooking Time
                      </label>
                      <input
                        type="text"
                        value={
                          generatedRecipe.cookingTime === 0 ? 'Less than 10 minutes' :
                          generatedRecipe.cookingTime === 1 ? 'Between 10 and 30 minutes' :
                          generatedRecipe.cookingTime === 2 ? 'Between 30 and 60 minutes' :
                          generatedRecipe.cookingTime === 3 ? 'Greater than 60 minutes' : ''
                        }
                        readOnly
                        className="input-field w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Difficulty
                      </label>
                      <input
                        type="text"
                        value={
                          generatedRecipe.difficulty === 0 ? 'Low' :
                          generatedRecipe.difficulty === 1 ? 'Medium' :
                          generatedRecipe.difficulty === 2 ? 'High' : ''
                        }
                        readOnly
                        className="input-field w-full"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Dish Types
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {generatedRecipe.dishTypes?.map((type, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                        >
                          {type === 1 ? 'Breakfast' :
                           type === 2 ? 'Lunch' :
                           type === 3 ? 'Dinner' :
                           type === 4 ? 'Dessert' :
                           type === 5 ? 'Snack' :
                           type === 6 ? 'Appetizer' : 'Other'}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ingredients
                    </label>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                      {generatedRecipe.ingredients?.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Instructions
                    </label>
                    <ol className="list-decimal list-inside text-gray-600 dark:text-gray-300">
                      {generatedRecipe.instructions?.map((instruction, index) => (
                        <li key={index} className="mb-2">{instruction.text}</li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Add a Photo
                    </label>
                    <ImageUpload
                      onImageChange={handleImageChange}
                      currentImageUrl={imagePreview}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveRecipe}
                      className="btn-primary"
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : 'Save Recipe'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 