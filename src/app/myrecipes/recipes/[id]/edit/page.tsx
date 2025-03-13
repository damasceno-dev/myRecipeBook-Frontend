'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  useGetRecipeGetbyidRecipeId,
  usePutRecipeUpdateRecipeId,
  usePutUpdateImageRecipeId
} from '@/api/generated/myRecipeBookAPI';
import {
  CookingTime,
  Difficulty,
  DishType,
  RequestRecipeJson,
  ResponseErrorJson
} from '@/api/generated/myRecipeBookAPI.schemas';
import MainNav from "@/components/MainNav";

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<RecipeFormData>({
    title: '',
    ingredients: [''],
    instructions: [''],
  });

  const [preview, setPreview] = useState<string | null>(null);
  const { data: recipe } = useGetRecipeGetbyidRecipeId(params.id);

  const updateRecipe = usePutRecipeUpdateRecipeId({
    mutation: {
      onSuccess: () => {
        router.push(`/myrecipes/recipes/${params.id}`);
      },
      onError: (error: ResponseErrorJson) => {
        setError(error.errorMessages?.[0] || 'Failed to update recipe');
      },
    },
  });
  const updateImage = usePutUpdateImageRecipeId({
    mutation: {
      onSuccess: () => {
        router.push(`/myrecipes/recipes/${params.id}`);
      },
      onError: (error: ResponseErrorJson) => {
        setError(error.errorMessages?.[0] || 'Failed to update recipe image');
      },
    },
  });

  useEffect(() => {
    if (recipe) {
      setFormData((prev) => ({
        ...prev,
        title: recipe.title || '',
        ingredients: recipe.ingredients || [''],
        instructions: recipe.instructions?.map(inst => inst.text || '') || [''],
        cookingTime: recipe.cookingTime,
        difficulty: recipe.difficulty,
        dishTypes: recipe.dishTypes || undefined,
      }));
    }
  }, [recipe]);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  useEffect(() => {
    console.log('Updated formData:', formData);
  }, [formData]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('entrei aqui')
      const recipeData: RequestRecipeJson = {
        title: formData.title,
        ingredients: formData.ingredients.filter(i => i.trim()),
        instructions: formData.instructions
            .filter(i => i.trim())
            .map((text, index) => ({
              step: index + 1,
              text,
            })),
        cookingTime: formData.cookingTime,
        difficulty: formData.difficulty,
        dishTypes: formData.dishTypes
      };

      // Update recipe details
      await updateRecipe.mutateAsync({
        recipeId: params.id,
        data: recipeData
      });
console.log(formData.image)
// In your handleSubmit function
      if (formData.image) {
        console.log('Selected file:', formData.image);
        await updateImage.mutateAsync({
          recipeId: params.id,
          data: { file: formData.image },
        });
      } else {
        router.push(`/myrecipes/recipes/${params.id}`);
      }


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
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : undefined;
    setFormData(prev => ({ ...prev, image: file }));
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };


  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <MainNav />
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
                  onChange={handleFileChange}
              />
              {preview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Image Preview:</p>
                    <img src={preview} alt="Image preview" className="mt-2 max-w-xs border rounded" />
                  </div>
              )}

            </div>
            <div className="flex items-start mt-4 gap-4">
              <button
                  type="submit"
                  className="w-3/4 px-10 py-2 bg-blue-600 text-white rounded hover:bg-blue-400 transition duration-300"
                  disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Recipe'}
              </button>
              <button
                  type="button"
                  className="w-1/4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-400 transition duration-300"
                  onClick={() => router.back()}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
} 