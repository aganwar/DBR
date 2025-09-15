// src/templates/NewPageTemplate.tsx
// Template for creating new pages - copy and customize this file

import React, { useState } from 'react';
import { useToast } from '../components/Toast';

// Example interface for page data
interface PageData {
  id: string;
  name: string;
  description: string;
  // Add your specific data fields here
}

export default function NewPageTemplate() {
  const toast = useToast();

  // State management
  const [data, setData] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API calls (replace with your actual endpoints)
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Replace with your API endpoint
      // const response = await api.get<PageData[]>('/api/your-endpoint');
      // setData(response.data);

      // Placeholder for development
      setData([
        { id: '1', name: 'Sample Item 1', description: 'Description 1' },
        { id: '2', name: 'Sample Item 2', description: 'Description 2' }
      ]);

      toast.show('Data loaded successfully', { variant: 'success' });
    } catch (err: any) {
      setError(err?.message || 'Failed to load data');
      toast.show('Failed to load data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (item: PageData) => {
    try {
      setLoading(true);

      // Replace with your API endpoint
      // await api.post('/api/your-endpoint', item);

      toast.show('Data saved successfully', { variant: 'success' });
      fetchData(); // Refresh data
    } catch (err: any) {
      toast.show('Failed to save data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  React.useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Your New Page Title
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Describe what this page does and its main purpose.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={fetchData}
            disabled={loading}
            className="btn"
          >
            {loading ? 'Loading...' : 'Refresh Data'}
          </button>

          <button
            onClick={() => {
              // Add new item logic
              const newItem: PageData = {
                id: `new-${Date.now()}`,
                name: 'New Item',
                description: 'New description'
              };
              saveData(newItem);
            }}
            disabled={loading}
            className="btn-solid"
          >
            Add New Item
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg">
            <p className="text-rose-800 dark:text-rose-200">{error}</p>
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Content Area */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Main Content
            </h3>

            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-slate-500 dark:text-slate-400">Loading...</div>
              </div>
            ) : (
              <div className="space-y-4">
                {data.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
                  >
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">
                      {item.name}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Side Panel */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Additional Information
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Development Status
                </h4>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  This page is ready for API integration. Replace the placeholder data
                  with calls to your backend endpoints.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <h4 className="font-medium text-emerald-900 dark:text-emerald-100 mb-2">
                  Next Steps
                </h4>
                <ul className="text-emerald-800 dark:text-emerald-200 text-sm space-y-1">
                  <li>• Create backend API endpoints</li>
                  <li>• Define data models and DTOs</li>
                  <li>• Implement business logic</li>
                  <li>• Connect frontend to real APIs</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* API Integration Notice */}
        <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <div>
              <h4 className="font-medium text-amber-900 dark:text-amber-100">
                Ready for Backend Integration
              </h4>
              <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                This template provides the frontend structure. Add your API endpoints:
              </p>
              <ul className="text-sm text-amber-700 dark:text-amber-300 mt-2 space-y-1">
                <li>• <code>GET /api/your-endpoint</code> - Fetch data</li>
                <li>• <code>POST /api/your-endpoint</code> - Create new items</li>
                <li>• <code>PUT /api/your-endpoint/:id</code> - Update items</li>
                <li>• <code>DELETE /api/your-endpoint/:id</code> - Delete items</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}