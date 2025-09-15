// src/pages/AnalyticsPage.tsx
import React from 'react';

export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Analytics Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Monitor performance metrics and generate insights from your resource planning data.
          </p>
        </div>

        {/* Placeholder Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Metric Cards */}
          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Total Resources</h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">247</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Utilization Rate</h3>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">87.3%</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Avg Response Time</h3>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">0.3s</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Resource Utilization Trend</h3>
            <div className="h-64 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-center justify-center">
              <p className="text-slate-500 dark:text-slate-400">Chart will be implemented with real data</p>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Capacity Distribution</h3>
            <div className="h-64 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-center justify-center">
              <p className="text-slate-500 dark:text-slate-400">Chart will be implemented with real data</p>
            </div>
          </div>
        </div>

        {/* API Integration Notice */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Development Phase</h4>
              <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                This page is ready for API integration. Add your new endpoints to connect real data:
              </p>
              <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                <li>• <code>/api/analytics/metrics</code> - Overall statistics</li>
                <li>• <code>/api/analytics/trends</code> - Time-series data</li>
                <li>• <code>/api/analytics/reports</code> - Report generation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}