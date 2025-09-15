// src/contexts/PageContext.tsx
import React, { createContext, useContext, useState } from 'react';

export type PageType = 'resource-planner' | 'analytics' | string;

interface PageContextType {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  pageTitle: string;
  pageDescription: string;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

const pageConfig = {
  'resource-planner': {
    title: 'Resource Planner',
    description: 'Manage resource capacity planning with master and calendar grids'
  },
  'analytics': {
    title: 'Analytics Dashboard',
    description: 'Monitor performance metrics and generate insights'
  }
} as const;

export function PageProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState<PageType>('resource-planner');

  const config = pageConfig[currentPage as keyof typeof pageConfig] || {
    title: 'OCX AI',
    description: 'Resource planning and analytics platform'
  };

  return (
    <PageContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        pageTitle: config.title,
        pageDescription: config.description
      }}
    >
      {children}
    </PageContext.Provider>
  );
}

export function usePage() {
  const context = useContext(PageContext);
  if (context === undefined) {
    throw new Error('usePage must be used within a PageProvider');
  }
  return context;
}