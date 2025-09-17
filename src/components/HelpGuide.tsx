// src/components/HelpGuide.tsx
import React from 'react';

interface HelpGuideProps {
  open: boolean;
  onClose: () => void;
  currentPage?: 'landing' | 'resource-planner' | 'priority-list' | 'user-management';
}

export default function HelpGuide({ open, onClose, currentPage = 'resource-planner' }: HelpGuideProps) {
  if (!open) return null;

  const getPageTitle = () => {
    switch (currentPage) {
      case 'landing':
        return 'DBR-AI System Overview';
      case 'priority-list':
        return 'DBR-AI Priority List Guide';
      case 'user-management':
        return 'DBR-AI User Management Guide';
      case 'resource-planner':
      default:
        return 'DBR-AI Resource Planner Guide';
    }
  };

  function renderPriorityListContent() {
    return (
      <div className="space-y-8">
        {/* Overview */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Overview</h3>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p>The Priority List page displays production orders sorted by priority, allowing you to manage target dates and monitor production scheduling. Orders are ranked by steps remaining, target RBC, and production order number.</p>
          </div>
        </section>

        {/* Filtering */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Filtering & Search</h3>
          <div className="space-y-3">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Resource Selection</h4>
              <p className="text-slate-700 dark:text-slate-300 text-sm">Select one or multiple resource groups to filter production orders. Use "Select All" or "Clear All" for bulk operations.</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Non-scheduled Filter</h4>
              <p className="text-slate-700 dark:text-slate-300 text-sm">Enable "Include non-scheduled" to show orders that haven't been assigned to the schedule yet.</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Search</h4>
              <p className="text-slate-700 dark:text-slate-300 text-sm">Search by production order number, material number, or item name for quick filtering.</p>
            </div>
          </div>
        </section>

        {/* Target Date Management */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Target Date Management</h3>
          <div className="space-y-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Editing Target Dates</h4>
              <p className="text-blue-800 dark:text-blue-200 text-sm mb-2">Click on any target date cell to edit. When you change a target date:</p>
              <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1 ml-4">
                <li>• All rows with the same production order are updated automatically</li>
                <li>• Changes are validated (future dates only)</li>
                <li>• Invalid changes show in red, valid changes in green</li>
                <li>• Use "Save" to apply changes or "Cancel" to revert</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Grid Features */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Grid Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Sorting</h4>
              <p className="text-slate-700 dark:text-slate-300 text-sm">Default sort: Steps to Go (asc) → Target RBC (desc) → Production Order (asc). Click column headers to sort.</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Pagination</h4>
              <p className="text-slate-700 dark:text-slate-300 text-sm">Navigate through pages and adjust page size (25, 50, 100, 200 rows per page).</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Export</h4>
              <p className="text-slate-700 dark:text-slate-300 text-sm">Export current view to CSV with all visible columns and data.</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">DBR Operations</h4>
              <p className="text-slate-700 dark:text-slate-300 text-sm">Use "Reset DBR" and "Run DBR" buttons to manage the demand-based replenishment system.</p>
            </div>
          </div>
        </section>

        {/* Validation */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Validation Rules</h3>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <ul className="text-yellow-800 dark:text-yellow-200 text-sm space-y-2">
              <li><strong>Target Dates:</strong> Must be in the future (cannot set past dates)</li>
              <li><strong>Bulk Updates:</strong> Changing one row's target date updates all rows with the same production order</li>
              <li><strong>Visual Feedback:</strong> Green = valid change, Red = invalid change</li>
              <li><strong>Save Protection:</strong> Cannot save while invalid changes exist</li>
            </ul>
          </div>
        </section>
      </div>
    );
  }

  function renderResourcePlannerContent() {
    return (
      <div className="space-y-8">
        {/* Overview */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Overview</h3>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p>The Resource Planner helps you manage resource capacity and scheduling through two interconnected grids: the Master Grid for resource management and the Calendar Grid for capacity planning.</p>
          </div>
        </section>

        {/* Filtering */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Resource Filtering</h3>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
            <p className="text-slate-700 dark:text-slate-300 text-sm mb-3">Use the funnel icon on the left to open the filter modal and select resource groups to display in both grids.</p>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="w-2 h-2 bg-blue-500 rounded"></span>
              <span>Empty selection shows no data</span>
              <span className="w-2 h-2 bg-green-500 rounded ml-4"></span>
              <span>Applied filters update both grids</span>
            </div>
          </div>
        </section>

        {/* Master Grid */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Master Grid (Resource Management)</h3>
          <div className="space-y-3">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Resource Operations</h4>
              <ul className="text-slate-700 dark:text-slate-300 text-sm space-y-1">
                <li><strong>Add:</strong> Create new resource groups</li>
                <li><strong>Edit:</strong> Modify capacity and constraint settings</li>
                <li><strong>Delete:</strong> Remove selected resources</li>
                <li><strong>Export:</strong> Export resource data to CSV</li>
              </ul>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Resource Fields</h4>
              <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
                <li><strong>Resource Group:</strong> Unique identifier (required)</li>
                <li><strong>Is Constraint:</strong> Mark as bottleneck resource</li>
                <li><strong>Capacity:</strong> Maximum production capacity (required, ≥ 0)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Calendar Grid */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Calendar Grid (Capacity Planning)</h3>
          <div className="space-y-3">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Date Range Controls</h4>
              <p className="text-slate-700 dark:text-slate-300 text-sm mb-2">Select time periods to view and edit capacity:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <span><strong>Week:</strong> Current week</span>
                <span><strong>+7:</strong> Next 7 days</span>
                <span><strong>Next:</strong> Next week</span>
                <span><strong>Month:</strong> Current month</span>
                <span><strong>All:</strong> All available dates</span>
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Capacity Editing</h4>
              <ul className="text-green-800 dark:text-green-200 text-sm space-y-1">
                <li><strong>Capacity:</strong> Set daily production capacity (≥ 0)</li>
                <li><strong>Off Day:</strong> Mark non-working days (sets capacity to 0)</li>
                <li><strong>Auto-sync:</strong> Setting capacity to 0 marks as off day, positive capacity unmarks off day</li>
                <li><strong>Export:</strong> Export calendar data for selected resource</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Validation */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Validation & Visual Feedback</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">Master Grid Rules</h4>
              <ul className="text-yellow-800 dark:text-yellow-200 text-sm space-y-1">
                <li>Resource Group: Required, non-empty</li>
                <li>Capacity: Required, must be ≥ 0</li>
                <li>Invalid cells show red background</li>
                <li>Valid edits show green background</li>
              </ul>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">Calendar Grid Rules</h4>
              <ul className="text-purple-800 dark:text-purple-200 text-sm space-y-1">
                <li>Capacity: Optional, but must be ≥ 0 if set</li>
                <li>Off Day: Links to capacity (0 ↔ off day)</li>
                <li>Same color coding as Master Grid</li>
                <li>Cancel always available to reload data</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    );
  }

  function renderUserManagementContent() {
    return (
      <div className="space-y-8">
        {/* Overview */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Overview</h3>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p>The User Management page provides comprehensive tools for managing user accounts, roles, and permissions. Admin users can create, edit, and delete user accounts while configuring page-level access rights.</p>
          </div>
        </section>

        {/* Layout & Features */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Layout & Features</h3>
          <div className="space-y-3">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Left Panel - User Grid</h4>
              <p className="text-slate-700 dark:text-slate-300 text-sm">Displays all users in a filterable grid with columns for Username, Email, Access Right, Status, and Last Active date. Supports single-row selection and CSV export.</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Right Panel - User Details</h4>
              <p className="text-slate-700 dark:text-slate-300 text-sm">Shows detailed information for the selected user. Admin users can edit user properties including email, status, and role assignments.</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Page Access Matrix</h4>
              <p className="text-slate-700 dark:text-slate-300 text-sm">Configure page-level access rights for the selected user across all application pages (ReadOnly/Write permissions).</p>
            </div>
          </div>
        </section>

        {/* User Roles */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">User Roles & Permissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">Admin</h4>
              <ul className="text-red-800 dark:text-red-200 text-sm space-y-1">
                <li>• Full system access</li>
                <li>• Create, edit, delete users</li>
                <li>• Assign/modify roles</li>
                <li>• Configure page permissions</li>
              </ul>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Write</h4>
              <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
                <li>• Standard user access</li>
                <li>• Can edit data</li>
                <li>• View own profile only</li>
                <li>• Access to core features</li>
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">ReadOnly</h4>
              <ul className="text-gray-800 dark:text-gray-200 text-sm space-y-1">
                <li>• View-only access</li>
                <li>• Cannot modify data</li>
                <li>• Limited system features</li>
                <li>• Read-only reports</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Operations */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">User Operations</h3>
          <div className="space-y-3">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Filter & Search</h4>
              <ul className="text-green-800 dark:text-green-200 text-sm space-y-1">
                <li>• Filter by username, email, or access right</li>
                <li>• Apply/Cancel filter operations</li>
                <li>• Real-time grid updates</li>
                <li>• Clear all filters to reset view</li>
              </ul>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">Add New User (Admin Only)</h4>
              <ul className="text-purple-800 dark:text-purple-200 text-sm space-y-1">
                <li>• Required fields: Username, Email, Access Right</li>
                <li>• Username and email must be unique</li>
                <li>• Default status: Active</li>
                <li>• Form validation and error handling</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Visual Indicators */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Visual Feedback</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-100 border border-red-200 rounded-full"></div>
              <span className="text-slate-700 dark:text-slate-300 text-sm">Admin role - Red badge</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded-full"></div>
              <span className="text-slate-700 dark:text-slate-300 text-sm">Write role - Blue badge</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded-full"></div>
              <span className="text-slate-700 dark:text-slate-300 text-sm">ReadOnly role - Gray badge</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded-full"></div>
              <span className="text-slate-700 dark:text-slate-300 text-sm">Active status - Green badge</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-100 border border-red-200 rounded-full"></div>
              <span className="text-slate-700 dark:text-slate-300 text-sm">Locked status - Red badge</span>
            </div>
          </div>
        </section>

        {/* Default User */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Default User</h3>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm mb-2">The system includes one default admin user:</p>
            <ul className="text-yellow-800 dark:text-yellow-200 text-sm space-y-1">
              <li><strong>Username:</strong> aganwar</li>
              <li><strong>Email:</strong> admin@company.com</li>
              <li><strong>Role:</strong> Admin</li>
              <li><strong>Status:</strong> Active</li>
            </ul>
          </div>
        </section>
      </div>
    );
  }

  const renderContent = () => {
    if (currentPage === 'priority-list') {
      return renderPriorityListContent();
    }
    if (currentPage === 'user-management') {
      return renderUserManagementContent();
    }
    if (currentPage === 'landing') {
      return (
        <div className="space-y-12">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6 border-b border-slate-200 dark:border-slate-700 pb-3">
              Schedule Resource Guide
            </h2>
            {renderResourcePlannerContent()}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6 border-b border-slate-200 dark:border-slate-700 pb-3">
              Priority List Guide
            </h2>
            {renderPriorityListContent()}
          </div>
        </div>
      );
    }
    return renderResourcePlannerContent();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {getPageTitle()}
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
          {renderContent()}
        </div>
      </div>
    </div>
  );
}