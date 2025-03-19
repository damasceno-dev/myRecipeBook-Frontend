'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { usePutUserUpdate, useDeleteUserDelete, useGetUserGetprofilewithtoken } from '@/api/generated/myRecipeBookAPI';
import { RequestUserUpdateJson, ResponseErrorJson, ResponseUserProfileJson } from '@/api/generated/myRecipeBookAPI.schemas';
import MainNav from "@/components/MainNav";
import { signOut } from 'next-auth/react';

interface UserProfile {
  name: string;
  email: string;
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updateType, setUpdateType] = useState<'name' | 'email'>('name');
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    email: '',
  });

  const getUserData = useGetUserGetprofilewithtoken({
    query: {
      onSuccess: (data: ResponseUserProfileJson) => {
        setFormData({
          name: data.name || '',
          email: data.email || '',
        });
      },
      onError: (error: ResponseErrorJson) => {
        setError(error.errorMessages?.[0] || 'Failed to fetch user data');
      },
    },
  });

  // Fetch user data on mount
  useEffect(() => {
    getUserData.refetch();
  }, []);

  const updateProfile = usePutUserUpdate({
    mutation: {
      onSuccess: async (data) => {
        await getUserData.refetch();
        
        await update({
          ...session,
          user: {
            ...session?.user,
            name: data.name || '',
            email: data.email || '',
          },
        });
        setSuccess('Profile updated successfully');
      },
      onError: (error: ResponseErrorJson) => {
        setError(error.errorMessages?.[0] || 'Failed to update profile');
      },
    },
  });

  const deleteAccount = useDeleteUserDelete({
    mutation: {
      onSuccess: async () => {
        await signOut({ callbackUrl: '/' });
      },
      onError: (error: ResponseErrorJson) => {
        setError(error.errorMessages?.[0] || 'Failed to delete account');
      },
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData: RequestUserUpdateJson = {
        ...(updateType === 'name' ? { name: formData.name } : { email: formData.email }),
      };

      await updateProfile.mutateAsync({ data: updateData });
    } catch (err: any) {
      console.error('Update profile error:', err);
      setError(err.errorMessages?.join('. ') || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount.mutateAsync();
    } catch (err) {
      console.error('Delete account error:', err);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <MainNav />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Profile Settings
          </h1>

          {error && (
            <div className="bg-red-50 dark:bg-red-900 p-4 rounded-md mb-6">
              <p className="text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900 p-4 rounded-md mb-6">
              <p className="text-green-700 dark:text-green-200">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <button
                type="button"
                className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                  updateType === 'name'
                    ? 'bg-blue-600 text-white'
                    : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                onClick={() => setUpdateType('name')}
              >
                Update Name
              </button>
              <button
                type="button"
                className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                  updateType === 'email'
                    ? 'bg-blue-600 text-white'
                    : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                onClick={() => setUpdateType('email')}
              >
                Update Email
              </button>
            </div>

            {updateType === 'name' ? (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  className="input-field mt-1"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
            ) : (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className="input-field mt-1"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-center gap-2 [&>button]:w-full md:[&>button:first-child]:w-4/5 md:[&>button:last-child]:w-1/5">
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : `Update ${updateType === 'name' ? 'Name' : 'Email'}`}
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-600 py-4 px-2 text-white rounded hover:bg-red-700 transition duration-300 disabled:opacity-50"
                disabled={isLoading}
              >
                Delete Account
              </button>
            </div>
          </form>
        </div>

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm w-full">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Delete Account
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Are you sure you want to delete your account? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 