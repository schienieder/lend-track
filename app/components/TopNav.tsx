'use client';

import { useTheme } from '../contexts/ThemeContext';
import Image from 'next/image';
import Link from 'next/link';

export default function TopNav() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 py-4 px-6 flex justify-between items-center">
      <div className="flex items-center">
        <Image
          src="/images/lend-track-logo.png"
          alt="LendTrack Logo"
          width={32}
          height={32}
        />
        <span className="ml-2 text-xl font-bold bg-clip-text text-slate-800 dark:text-white">LendTrack</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            // Moon icon for light theme (switching to dark)
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          ) : (
            // Sun icon for dark theme (switching to light)
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        <Link
          href="/login"
          className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="bg-slate-800 dark:bg-white text-white dark:text-slate-800 px-4 py-2 rounded-md font-medium transition-all hover:scale-105"
        >
          Register
        </Link>
      </div>
    </nav>
  );
}