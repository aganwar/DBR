// src/components/HelpGuide.tsx
import React from 'react';

interface HelpGuideProps {
  open: boolean;
  onClose: () => void;
}

export default function HelpGuide({ open, onClose }: HelpGuideProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              DBR-AI Resource Planner Guide
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

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Overview */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Overview</h3>
            </div>
            <div className="pl-11">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                The DBR-AI Resource Planner helps you manage resource capacity planning with two main grids:
                the Master Grid for resource management and the Calendar Grid for detailed capacity scheduling.
              </p>
            </div>
          </section>

          {/* Master Grid */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5m18.375 0a1.125 1.125 0 00-1.125 1.125m1.125-1.125V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m-1.125-1.125v-1.5m0 3.75h-7.5A1.125 1.125 0 0012 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625c0-.621.504-1.125 1.125-1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 4.5M20.625 4.5" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Master Grid</h3>
            </div>
            <div className="pl-11 space-y-4">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-5 border border-emerald-200/50 dark:border-emerald-800/50">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                  </svg>
                  <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">Purpose</h4>
                </div>
                <p className="text-emerald-800 dark:text-emerald-200 text-sm leading-relaxed">
                  Manage resource groups, set constraints, and define default capacities for your scheduling system.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">Mandatory Columns</h4>
                  </div>
                  <ul className="text-slate-700 dark:text-slate-300 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="font-medium text-slate-900 dark:text-slate-100 min-w-0">Resource Group:</span>
                      <span className="text-xs">Unique identifier (required for new resources)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium text-slate-900 dark:text-slate-100 min-w-0">Capacity:</span>
                      <span className="text-xs">Must be a valid number &ge; 0 (cannot be empty)</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">Actions</h4>
                  </div>
                  <ul className="text-slate-700 dark:text-slate-300 text-sm space-y-2">
                    <li><span className="font-medium">Add New:</span> Click the + button to create a new resource</li>
                    <li><span className="font-medium">Edit:</span> Double-click any cell to edit values</li>
                    <li><span className="font-medium">Delete:</span> Select row(s) and click Delete button</li>
                    <li><span className="font-medium">Save:</span> Click Save to commit all changes</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Calendar Grid */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Calendar Grid</h3>
            </div>
            <div className="pl-11 space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-5 border border-purple-200/50 dark:border-purple-800/50">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100">Purpose</h4>
                </div>
                <p className="text-purple-800 dark:text-purple-200 text-sm leading-relaxed">
                  Set daily capacity and off-day scheduling for selected resources with intelligent bidirectional logic.
                </p>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-5 border border-amber-200/50 dark:border-amber-800/50">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                  <h4 className="font-semibold text-amber-900 dark:text-amber-100">Bidirectional Logic</h4>
                </div>
                <div className="grid gap-3 text-sm">
                  <div className="flex items-center gap-3 text-amber-800 dark:text-amber-200">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                    <span>Setting capacity to 0 automatically checks "Off day"</span>
                  </div>
                  <div className="flex items-center gap-3 text-amber-800 dark:text-amber-200">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                    <span>Setting capacity &gt; 0 automatically unchecks "Off day"</span>
                  </div>
                  <div className="flex items-center gap-3 text-amber-800 dark:text-amber-200">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                    <span>Checking "Off day" automatically sets capacity to 0</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">Date Range Controls</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900 dark:text-slate-100">Week</span>
                    <span className="text-slate-600 dark:text-slate-400 text-xs">Current week</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900 dark:text-slate-100">+7</span>
                    <span className="text-slate-600 dark:text-slate-400 text-xs">Next 7 days</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900 dark:text-slate-100">Next</span>
                    <span className="text-slate-600 dark:text-slate-400 text-xs">Next week</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900 dark:text-slate-100">Month</span>
                    <span className="text-slate-600 dark:text-slate-400 text-xs">Current month</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900 dark:text-slate-100">All</span>
                    <span className="text-slate-600 dark:text-slate-400 text-xs">All dates</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Validation */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Validation & Visual Feedback</h3>
            </div>
            <div className="pl-11 space-y-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M4.098 19.902A3.75 3.75 0 109.402 4.098m0 15.804l6.4-6.402a3.75 3.75 0 000-5.304M9.402 4.098l6.401 6.402A3.75 3.75 0 0021.205 15.804M9.402 4.098A3.75 3.75 0 014.098 9.402" />
                  </svg>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">Cell Colors</h4>
                </div>
                <div className="grid gap-4">
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-800 border-2 border-emerald-300 dark:border-emerald-600 rounded flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-medium text-emerald-900 dark:text-emerald-100">Light Green</span>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300">Valid edited value</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-800">
                    <div className="w-6 h-6 bg-rose-100 dark:bg-rose-800 border-2 border-rose-300 dark:border-rose-600 rounded flex items-center justify-center">
                      <svg className="w-3 h-3 text-rose-600 dark:text-rose-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-medium text-rose-900 dark:text-rose-100">Light Red</span>
                      <p className="text-sm text-rose-700 dark:text-rose-300">Invalid edited value</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="w-6 h-6 bg-amber-100 dark:bg-amber-800 border-2 border-amber-300 dark:border-amber-600 rounded flex items-center justify-center">
                      <svg className="w-3 h-3 text-amber-600 dark:text-amber-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-medium text-amber-900 dark:text-amber-100">Light Amber</span>
                      <p className="text-sm text-amber-700 dark:text-amber-300">Required field is empty</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">Validation Rules</h4>
                </div>
                <div className="grid gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                    <span>Capacity must be a number &ge; 0</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                    <span>Resource Group cannot be empty for new resources</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                    <span>Invalid values prevent saving until corrected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                    <span>Changes are tracked and highlighted until saved</span>
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
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Tips & Best Practices</h3>
            </div>
            <div className="pl-11">
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl p-5 border border-cyan-200/50 dark:border-cyan-800/50">
                <div className="grid gap-3 text-sm">
                  <div className="flex items-start gap-3 text-cyan-800 dark:text-cyan-200">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2"></div>
                    <span>Use the filter to work with specific resource groups</span>
                  </div>
                  <div className="flex items-start gap-3 text-cyan-800 dark:text-cyan-200">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2"></div>
                    <span>Select a resource in Master Grid to load its calendar</span>
                  </div>
                  <div className="flex items-start gap-3 text-cyan-800 dark:text-cyan-200">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2"></div>
                    <span>Save frequently to avoid losing changes</span>
                  </div>
                  <div className="flex items-start gap-3 text-cyan-800 dark:text-cyan-200">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2"></div>
                    <span>Use Cancel to reload and discard unsaved changes</span>
                  </div>
                  <div className="flex items-start gap-3 text-cyan-800 dark:text-cyan-200">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2"></div>
                    <span>Constraint checkbox helps identify bottleneck resources</span>
                  </div>
                  <div className="flex items-start gap-3 text-cyan-800 dark:text-cyan-200">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2"></div>
                    <span>Date range controls help focus on relevant time periods</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}