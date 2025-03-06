'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardNav from '@/components/DashboardNav';
import { useGetRecipeGetbyidRecipeId, usePutRecipeUpdateRecipeId } from '@/api/generated/myRecipeBookAPI';
import { CookingTime, Difficulty, DishType, ResponseRecipeJson, ResponseErrorJson, RequestRecipeJson } from '@/api/generated/myRecipeBookAPI.schemas';

interface RecipeFormData {
  title: string;
  ingredients: string[];
  instructions: string[];
  image?: File;
  cookingTime?: CookingTime;
  difficulty?: Difficulty;
  dishTypes?: DishType[];
}

export default function EditRecipePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<RecipeFormData>({
    title: '',
    ingredients: [''],
    instructions: [''],
  });

  const { data: recipe } = useGetRecipeGetbyidRecipeId(params.id);

  const updateRecipe = usePutRecipeUpdateRecipeId({
    mutation: {
      onSuccess: () => {
        router.push(`/dashboard/recipes/${params.id}`);
      },
      onError: (error: ResponseErrorJson) => {
        setError(error.errorMessages?.[0] || 'Failed to update recipe');
      },
    },
  });

  useEffect(() => {
    if (recipe) {
      setFormData({
        title: recipe.title || '',
        ingredients: recipe.ingredients || [''],
        instructions: recipe.instructions?.map(inst => inst.text || '') || [''],
        cookingTime: recipe.cookingTime,
        difficulty: recipe.difficulty,
        dishTypes: recipe.dishTypes || undefined,
      });
    }
  }, [recipe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const recipeData: RequestRecipeJson = {
        title: formData.title,
        ingredients: formData.ingredients.filter(i => i.trim()),
        instructions: formData.instructions
          .filter(i => i.trim())
          .map((text, index) => ({
            step: index + 1,
            text
          })),
        cookingTime: formData.cookingTime,
        difficulty: formData.difficulty,
        dishTypes: formData.dishTypes
      };

      await updateRecipe.mutateAsync({
        recipeId: params.id,
        data: recipeData
      });
    } catch (err) {
      setError('Failed to update recipe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }));
  };

  const handleAddInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData(prev => ({ ...prev, instructions: newInstructions }));
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardNav />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Edit Recipe
          </h1>

          {error && (
            <div className="bg-red-50 dark:bg-red-900 p-4 rounded-md mb-6">
              <p className="text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title
              </label>
              <input
                type="text"
                id="title"
                required
                className="input-field mt-1"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ingredients
              </label>
              {formData.ingredients.map((ingredient, index) => (
                <input
                  key={index}
                  type="text"
                  className="input-field mb-2"
                  value={ingredient}
                  onChange={(e) => handleIngredientChange(index, e.target.value)}
                  placeholder={`Ingredient ${index + 1}`}
                />
              ))}
              <button
                type="button"
                onClick={handleAddIngredient}
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                + Add Ingredient
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Instructions
              </label>
              {formData.instructions.map((instruction, index) => (
                <textarea
                  key={index}
                  className="input-field mb-2"
                  rows={2}
                  value={instruction}
                  onChange={(e) => handleInstructionChange(index, e.target.value)}
                  placeholder={`Step ${index + 1}`}
                />
              ))}
              <button
                type="button"
                onClick={handleAddInstruction}
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                + Add Step
              </button>
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Recipe Image (leave empty to keep current image)
              </label>
              <input
                type="file"
                id="image"
                accept="image/*"
                className="mt-1"
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.files?.[0] }))}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Recipe'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
} 