// src/components/PageBasedHelpGuide.tsx
import React from 'react';
import { usePage } from '../contexts/PageContext';
import HelpGuide from './HelpGuide';

interface PageBasedHelpGuideProps {
  open: boolean;
  onClose: () => void;
}

// Analytics Help Content
function AnalyticsHelpContent() {
  return (
    <div className="px-6 py-6 space-y-6">
      {/* Overview */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Analytics Overview</h3>
        </div>
        <div className="pl-11">
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            The Analytics Dashboard provides comprehensive insights into your resource planning performance,
            utilization metrics, and operational efficiency indicators.
          </p>
        </div>
      </section>

      {/* Key Metrics */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Key Metrics</h3>
        </div>
        <div className="pl-11 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">Total Resources</h4>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-sm">
                Overall count of all resources in your system across all resource groups.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">Utilization Rate</h4>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-sm">
                Percentage of total capacity currently being utilized across all resources.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Charts and Reports */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Charts & Reports</h3>
        </div>
        <div className="pl-11">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-5 border border-purple-200/50 dark:border-purple-800/50">
            <div className="grid gap-3 text-sm">
              <div className="flex items-center gap-3 text-purple-800 dark:text-purple-200">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                <span>Resource Utilization Trend - Shows capacity usage over time</span>
              </div>
              <div className="flex items-center gap-3 text-purple-800 dark:text-purple-200">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                <span>Capacity Distribution - Breakdown of resources by type and location</span>
              </div>
              <div className="flex items-center gap-3 text-purple-800 dark:text-purple-200">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                <span>Performance Reports - Export data for external analysis</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189 6.01 6.01 0 01.75 3.439c0 .44-.357.797-.8.797H6.05c-.443 0-.8-.357-.8-.797a6.01 6.01 0 01.75-3.439 6.01 6.01 0 001.5.189V12.75a6.01 6.01 0 011.5-.189 6.01 6.01 0 011.5.189V12.75zM2.25 6.75c0 .414.336.75.75.75h18a.75.75 0 00.75-.75 2.25 2.25 0 00-2.25-2.25H4.5A2.25 2.25 0 002.25 6.75z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Analytics Tips</h3>
        </div>
        <div className="pl-11">
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl p-5 border border-cyan-200/50 dark:border-cyan-800/50">
            <div className="grid gap-3 text-sm">
              <div className="flex items-start gap-3 text-cyan-800 dark:text-cyan-200">
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2"></div>
                <span>Monitor trends over time to identify patterns in resource usage</span>
              </div>
              <div className="flex items-start gap-3 text-cyan-800 dark:text-cyan-200">
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2"></div>
                <span>Export reports for stakeholder presentations and planning meetings</span>
              </div>
              <div className="flex items-start gap-3 text-cyan-800 dark:text-cyan-200">
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2"></div>
                <span>Use metrics to optimize resource allocation and capacity planning</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function PageBasedHelpGuide({ open, onClose }: PageBasedHelpGuideProps) {
  const { currentPage, pageTitle } = usePage();

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {pageTitle} Guide
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Close help guide"
            >
              <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content based on current page */}
        {currentPage === 'analytics' ? (
          <AnalyticsHelpContent />
        ) : (
          // Fallback to existing HelpGuide content for resource-planner
          <HelpGuide open={true} onClose={onClose} />
        )}
      </div>
    </div>
  );
}