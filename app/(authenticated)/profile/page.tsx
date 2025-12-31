'use client';

import React from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import Image from 'next/image';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-slate-800 rounded-lg shadow-md mx-auto">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/images/lend-track-logo.png"
              alt="LendTrack Logo"
              width={48}
              height={48}
            />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-800 dark:text-white">
            Your Profile
          </h2>
        </div>

        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                User ID
              </label>
              <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white">
                {user?.id}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white">
                {user?.email}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white">
                {user?.name || 'Not provided'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;