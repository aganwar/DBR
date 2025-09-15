// src/components/Layout.tsx
import React from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { Toast } from './Toast';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <ThemeProvider>
      <Toast>
        <div className="min-h-screen flex flex-col bg-transparent">
          <Header />
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </div>
      </Toast>
    </ThemeProvider>
  );
}