'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginData } from '@/schemas/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';

interface LoginFormProps {
  onLoginSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onLoginSuccess,
  onSwitchToRegister
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { updateUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Login failed');
      }

      // Update the auth context with the user data from the API response
      if (result.user) {
        updateUser({
          id: result.user.id,
          email: result.user.email,
          name: result.user.name
        });
      }

      // Call the success callback
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        // If no callback provided, redirect to dashboard
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-slate-800 rounded-lg shadow-md">
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-bold text-gray-800 dark:text-white">
          Sign in to your account
        </h2>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
            <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email address
            </label>
            <input
              id="email-address"
              type="email"
              className={`appearance-none block w-full px-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
              placeholder="Email address"
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              className={`appearance-none block w-full px-3 py-2 border ${errors.password ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
              placeholder="Password"
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 dark:border-gray-600 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <Link href="/auth/forgot-password" className="font-medium text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300">
              Forgot your password?
            </Link>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-slate-800 disabled:opacity-50 transition-all"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>

      <div className="text-center">
        <button
          onClick={onSwitchToRegister}
          className="font-medium text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 cursor-pointer"
        >
          Don't have an account? Sign up
        </button>
      </div>
    </div>
  );
};

export default LoginForm;