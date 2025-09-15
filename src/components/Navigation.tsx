// src/components/Navigation.tsx
import React from 'react';
import { PageType } from '../contexts/PageContext';

interface NavigationProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

const pages = [
  {
    id: 'resource-planner' as PageType,
    name: 'Resource Planner',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    description: 'Manage resource capacity planning'
  },
  // Add new pages here as needed
  {
    id: 'analytics' as PageType,
    name: 'Analytics',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    description: 'View performance analytics and reports'
  }
];

export default function Navigation({ currentPage, onPageChange }: NavigationProps) {
  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
      <div className="px-4">
        <div className="flex space-x-8">
          {pages.map((page) => {
            const isActive = currentPage === page.id;
            return (
              <button
                key={page.id}
                onClick={() => onPageChange(page.id)}
                className={`flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
                title={page.description}
              >
                <span className={isActive ? 'text-blue-500' : 'text-current'}>
                  {page.icon}
                </span>
                {page.name}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}