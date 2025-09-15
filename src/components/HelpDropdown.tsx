// src/components/HelpDropdown.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface HelpDropdownProps {
  onOpenGuide: () => void;
}

export default function HelpDropdown({ onOpenGuide }: HelpDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenGuide = () => {
    setIsOpen(false);
    onOpenGuide();
  };

  const handleToggleTheme = () => {
    toggleTheme();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Help Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 group"
        aria-label="Help and settings"
        title="Help and settings"
      >
        <svg
          className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
          {/* Theme Toggle */}
          <button
            onClick={handleToggleTheme}
            className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 text-sm"
          >
            <div className="flex-shrink-0">
              {theme === 'light' ? (
                <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium text-slate-900 dark:text-slate-100">
                {theme === 'light' ? 'Dark mode' : 'Light mode'}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Switch to {theme === 'light' ? 'dark' : 'light'} theme
              </div>
            </div>
          </button>

          {/* Divider */}
          <div className="h-px bg-slate-200 dark:bg-slate-700 my-2" />

          {/* Help Guide */}
          <button
            onClick={handleOpenGuide}
            className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 text-sm"
          >
            <div className="flex-shrink-0">
              <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-medium text-slate-900 dark:text-slate-100">
                User Guide
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Learn how to use the resource planner
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}