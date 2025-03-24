'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import {usePostRecipeRegister} from '@/api/generated/myRecipeBookAPI';
import {
  CookingTime,
  Difficulty,
  DishType,
  ResponseErrorJson,
  ResponseRecipeJson
} from '@/api/generated/myRecipeBookAPI.schemas';
import MainNav from "@/components/MainNav";
import {ImageUpload} from "@/components/ImageUpload";

interface RecipeFormData {
  title: string;
  ingredients: string[];
  instructions: string[];
  image?: File;
  cookingTime?: CookingTime;
  difficulty?: Difficulty;
  dishTypes?: DishType[];
}

export default function NewRecipePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<RecipeFormData>({
    title: '',
    ingredients: [''],
    instructions: [''],
  });
  const [preview, setPreview] = useState<string | null>(null);

  const createRecipe = usePostRecipeRegister({
    mutation: {
      onSuccess: (data: ResponseRecipeJson) => {
        if (data?.id) {
          router.push(`/myrecipes/recipes/${data.id}`);
        } else {
          setError('Failed to create recipe: No recipe ID received');
        }
      },
      onError: (error: ResponseErrorJson) => {
        setError(error.errorMessages?.join(". ") + "." || 'Unknown error from usePostRecipeRegister');
      },
    },
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const recipeData = {
        Title: formData.title,
        Ingredients: formData.ingredients.filter(i => i.trim()),
        Instructions: formData.instructions
          .filter(i => i.trim())
          .map((instruction, index) => ({
            Step: index + 1,
            Text: instruction
          })),
        ImageFile: formData.image,
        CookingTime: formData.cookingTime,
        Difficulty: formData.difficulty,
        DishTypes: formData.dishTypes
      };
      await createRecipe.mutateAsync({
        data: recipeData
      });
    } catch (err: any) {
      if (err?.errorMessages) {
        setError(err.errorMessages.join(". ") + ".");
      } else {
        // Fallback for other types of errors
        setError('Failed to create recipe. Please try again.');
      }

    } finally {
      setIsLoading(false);
    }
  };
  const handleImageChange = (file: File) => {
    setFormData(prev => ({ ...prev, image: file }));
    setPreview(URL.createObjectURL(file));
  };


  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <MainNav />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Create New Recipe
          </h1>

          {error && (
            <div className="bg-red-50 dark:bg-red-900 p-4 rounded-md mb-6">
              <p className="text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
            <div className="flex w-full gap-3 text-black">
              {/* Cooking Time Dropdown */}
              <div className="mb-4 flex-1">
                <label htmlFor="cookingTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cooking Time
                </label>
                <select
                    id="cookingTime"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    value={formData.cookingTime ?? ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, cookingTime: Number(e.target.value) as CookingTime }))}
                >
                  <option value="">Select cooking time</option>
                  <option value={CookingTime.NUMBER_0}>Less than 10 minutes</option>
                  <option value={CookingTime.NUMBER_1}>Between 10 and 30 minutes</option>
                  <option value={CookingTime.NUMBER_2}>Between 30 and 60 minutes</option>
                  <option value={CookingTime.NUMBER_3}>Greater than 60 minutes</option>
                </select>
              </div>
              {/* Difficulty Dropdown */}
              <div className="mb-4 flex-1">
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Difficulty
                </label>
                <select
                    id="difficulty"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    value={formData.difficulty ?? ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: Number(e.target.value) as Difficulty }))}
                >
                  <option value="">Select difficulty</option>
                  <option value={Difficulty.NUMBER_0}>Low</option>
                  <option value={Difficulty.NUMBER_1}>Medium</option>
                  <option value={Difficulty.NUMBER_2}>High</option>
                </select>
              </div>
            </div>

            {/* Dish Types Multi-select */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Dish Types (select all that apply)
              </label>
              <div className="space-y-2">
                {[
                  { value: DishType.NUMBER_0, label: "Appetizers" },
                  { value: DishType.NUMBER_1, label: "Breakfast" },
                  { value: DishType.NUMBER_2, label: "Dessert" },
                  { value: DishType.NUMBER_3, label: "Dinner" },
                  { value: DishType.NUMBER_4, label: "Drinks" },
                  { value: DishType.NUMBER_5, label: "Lunch" },
                  { value: DishType.NUMBER_6, label: "Snacks" }
                ].map((type) => (
                    <div key={type.value} className="flex items-center">
                      <input
                          id={`dishType-${type.value}`}
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={formData.dishTypes?.includes(type.value) || false}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFormData(prev => {
                              const currentDishTypes = prev.dishTypes || [];
                              if (checked) {
                                return { ...prev, dishTypes: [...currentDishTypes, type.value] };
                              } else {
                                return { ...prev, dishTypes: currentDishTypes.filter(t => t !== type.value) };
                              }
                            });
                          }}
                      />
                      <label htmlFor={`dishType-${type.value}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        {type.label}
                      </label>
                    </div>
                ))}
              </div>
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

            <div className="flex flex-col items-start gap-3">
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Recipe Image
              </label>
              <ImageUpload
                  onImageChange={handleImageChange}
                  currentImageUrl={preview}
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
                {isLoading ? 'Creating...' : 'Create Recipe'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
} 