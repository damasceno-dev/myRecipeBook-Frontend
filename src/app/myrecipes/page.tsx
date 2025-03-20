'use client';

import { useState, useEffect } from 'react';
import { useGetRecipeGetbyuserNumberOfRecipes, usePostRecipeFilter } from '@/api/generated/myRecipeBookAPI';
import { ResponseShortRecipeJson, CookingTime, Difficulty, DishType } from '@/api/generated/myRecipeBookAPI.schemas';
import { MagnifyingGlassIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import ProtectedRoute from '@/components/ProtectedRoute';
import MainNav from '@/components/MainNav';
import { useRouter } from 'next/navigation';

interface FilterOptions {
  search: string;
  showAdvanced: boolean;
  cookingTimes: CookingTime[];
  difficulties: Difficulty[];
  dishTypes: DishType[];
}

export default function MyRecipesPage() {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: '',
    showAdvanced: false,
    cookingTimes: [],
    difficulties: [],
    dishTypes: [],
  });
  const [filteredRecipes, setFilteredRecipes] = useState<ResponseShortRecipeJson[]>([]);
  const router = useRouter();

  const { data: recipes, isLoading, error } = useGetRecipeGetbyuserNumberOfRecipes(99);

  const filterRecipes = usePostRecipeFilter({
    mutation: {
      onSuccess: (data) => {
        setFilteredRecipes(data || []);
      },
      onError: (error) => {
        console.error('Filter error:', error);
        setFilteredRecipes([]);
      },
    },
  });

  useEffect(() => {
    if (!recipes) return;

    // Only apply local search filtering if advanced filters are not active
    if (!filterOptions.showAdvanced) {
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

      // Sort alphabetically by title
      filtered.sort((a, b) => {
        return (a.title || '').localeCompare(b.title || '');
      });

      setFilteredRecipes(filtered);
    }
  }, [recipes, filterOptions.search, filterOptions.showAdvanced]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterOptions((prev) => ({ ...prev, search: e.target.value }));
    // If advanced filters are active, trigger the filter API call
    if (filterOptions.showAdvanced) {
      handleAdvancedFilter();
    }
  };

  const handleAdvancedFilter = () => {
    filterRecipes.mutate({
      data: {
        titleIngredient: filterOptions.search || undefined,
        cookingTimes: filterOptions.cookingTimes.length > 0 ? filterOptions.cookingTimes : undefined,
        difficulties: filterOptions.difficulties.length > 0 ? filterOptions.difficulties : undefined,
        dishTypes: filterOptions.dishTypes.length > 0 ? filterOptions.dishTypes : undefined,
      },
    });
  };

  const toggleAdvancedFilter = () => {
    setFilterOptions(prev => ({ ...prev, showAdvanced: !prev.showAdvanced }));
  };

  const handleCookingTimeChange = (time: CookingTime) => {
    setFilterOptions(prev => ({
      ...prev,
      cookingTimes: prev.cookingTimes.includes(time)
        ? prev.cookingTimes.filter(t => t !== time)
        : [...prev.cookingTimes, time]
    }));
  };

  const handleDifficultyChange = (difficulty: Difficulty) => {
    setFilterOptions(prev => ({
      ...prev,
      difficulties: prev.difficulties.includes(difficulty)
        ? prev.difficulties.filter(d => d !== difficulty)
        : [...prev.difficulties, difficulty]
    }));
  };

  const handleDishTypeChange = (type: DishType) => {
    setFilterOptions(prev => ({
      ...prev,
      dishTypes: prev.dishTypes.includes(type)
        ? prev.dishTypes.filter(t => t !== type)
        : [...prev.dishTypes, type]
    }));
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <MainNav />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <MainNav />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 dark:bg-red-900 p-4 rounded-md">
              <p className="text-red-700 dark:text-red-200">
                Error loading recipes. Please try refreshing the page.
              </p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Handle the response which might be nested under data property
  const recipesArray = Array.isArray(recipes) ? recipes : (recipes as any)?.data || [];

  return (
    <ProtectedRoute>
      <MainNav />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 space-y-4">
            <div className="flex items-center gap-2 justify-between">
              <div className="relative w-full">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search recipes..."
                  value={filterOptions.search}
                  onChange={handleSearchChange}
                  className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 text-sm text-black"
                />
              </div>
              <button
                onClick={() => router.push('/myrecipes/recipes/new')}
                className="w-56 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors py-2"
              >
                Create Recipe
              </button>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={toggleAdvancedFilter}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                {filterOptions.showAdvanced ? (
                  <>
                    <ChevronUpIcon className="h-4 w-4" />
                    Hide Advanced Filters
                  </>
                ) : (
                  <>
                    <ChevronDownIcon className="h-4 w-4" />
                    Show Advanced Filters
                  </>
                )}
              </button>
              <div className="w-32 h-10">
                {filterOptions.showAdvanced && (
                  <button
                    onClick={handleAdvancedFilter}
                    disabled={filterRecipes.isLoading}
                    className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {filterRecipes.isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Searching...
                      </>
                    ) : (
                      'Apply Filters'
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${filterOptions.showAdvanced ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cooking Time</h3>
                  <div className="space-y-2">
                    {Object.values(CookingTime).map((time) => (
                      <label key={time} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filterOptions.cookingTimes.includes(time)}
                          onChange={() => handleCookingTimeChange(time)}
                          className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {time === CookingTime.NUMBER_0 ? 'Less than 10 minutes' :
                           time === CookingTime.NUMBER_1 ? 'Between 10 and 30 minutes' :
                           time === CookingTime.NUMBER_2 ? 'Between 30 and 60 minutes' :
                           'Greater than 60 minutes'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulty</h3>
                  <div className="space-y-2">
                    {Object.values(Difficulty).map((difficulty) => (
                      <label key={difficulty} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filterOptions.difficulties.includes(difficulty)}
                          onChange={() => handleDifficultyChange(difficulty)}
                          className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {difficulty === Difficulty.NUMBER_0 ? 'Low' :
                           difficulty === Difficulty.NUMBER_1 ? 'Medium' :
                           'High'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dish Type</h3>
                  <div className="space-y-2">
                    {Object.values(DishType).map((type) => (
                      <label key={type} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filterOptions.dishTypes.includes(type)}
                          onChange={() => handleDishTypeChange(type)}
                          className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {type === DishType.NUMBER_0 ? 'Appetizers' :
                           type === DishType.NUMBER_1 ? 'Breakfast' :
                           type === DishType.NUMBER_2 ? 'Dessert' :
                           type === DishType.NUMBER_3 ? 'Dinner' :
                           type === DishType.NUMBER_4 ? 'Drinks' :
                           type === DishType.NUMBER_5 ? 'Lunch' :
                           'Snacks'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {(!filteredRecipes || filteredRecipes.length === 0) ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {(!recipes || recipesArray.length === 0) ? (
                  'Welcome to MyRecipeBook!'
                ) : (
                  'No recipes found'
                )}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {(!recipes || recipesArray.length === 0) ? (
                  'You don\'t have any recipes yet. Get started by creating your first recipe!'
                ) : (
                  'Try adjusting your filters to see more recipes.'
                )}
              </p>
              {(!recipes || recipesArray.length === 0) && (
                <button
                  onClick={() => router.push('/myrecipes/recipes/new')}
                  className="btn-primary"
                >
                  Create Your First Recipe
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800 dark:border-gray-700 cursor-pointer"
                  onClick={() => router.push(`/myrecipes/recipes/${recipe.id}`)}
                >
                  <img
                    src={recipe.imageUrl || '/placeholder-recipe.svg'}
                    alt={recipe.title || 'Recipe'}
                    className="h-48 w-full object-contain"
                  />
                  <div className="p-4">
                    <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{recipe.title || 'Untitled Recipe'}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {recipe.quantityIngredients ? `${recipe.quantityIngredients} ingredients` : 'No ingredients listed'}
                    </p>
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