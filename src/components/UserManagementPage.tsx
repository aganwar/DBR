// src/components/UserManagementPage.tsx
import React, { useState, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, GridReadyEvent, SelectionChangedEvent } from 'ag-grid-community';
import { useToast } from './Toast';

// Mock data types
interface User {
  id: string;
  username: string;
  email: string;
  accessRight: 'ReadOnly' | 'Write' | 'Admin';
  status: 'Active' | 'Locked';
  lastActiveDate: string;
  createdDate: string;
}

interface PageAccess {
  pageName: string;
  pageKey: string;
  access: 'ReadOnly' | 'Write' | 'None';
}

// Mock data
const MOCK_USERS: User[] = [
  {
    id: '1',
    username: 'aganwar',
    email: 'admin@company.com',
    accessRight: 'Admin',
    status: 'Active',
    lastActiveDate: '2025-01-15T10:30:00Z',
    createdDate: '2024-01-15T09:00:00Z'
  },
  {
    id: '2',
    username: 'jsmith',
    email: 'john.smith@company.com',
    accessRight: 'Write',
    status: 'Active',
    lastActiveDate: '2025-01-14T16:45:00Z',
    createdDate: '2024-03-10T14:20:00Z'
  },
  {
    id: '3',
    username: 'mwilson',
    email: 'mary.wilson@company.com',
    accessRight: 'ReadOnly',
    status: 'Active',
    lastActiveDate: '2025-01-10T08:15:00Z',
    createdDate: '2024-05-22T11:30:00Z'
  },
  {
    id: '4',
    username: 'rjohnson',
    email: 'robert.johnson@company.com',
    accessRight: 'Write',
    status: 'Locked',
    lastActiveDate: '2024-12-20T13:22:00Z',
    createdDate: '2024-06-15T10:45:00Z'
  }
];

const MOCK_PAGES: Omit<PageAccess, 'access'>[] = [
  { pageName: 'Resource Planner', pageKey: 'resource-planner' },
  { pageName: 'Priority List', pageKey: 'priority-list' },
  { pageName: 'User Management', pageKey: 'user-management' }
];

export default function UserManagementPage() {
  const toast = useToast();
  const gridRef = useRef<AgGridReact<User>>(null);

  // State
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [filters, setFilters] = useState({
    username: '',
    email: '',
    accessRight: '' as '' | 'ReadOnly' | 'Write' | 'Admin'
  });

  // Mock current user (for permissions)
  const currentUser = { username: 'aganwar', accessRight: 'Admin' as const };
  const isAdmin = currentUser.accessRight === 'Admin';

  // User page access state
  const [userPageAccess, setUserPageAccess] = useState<Record<string, Record<string, 'Write' | 'ReadOnly' | 'NoAccess'>>>({});

  // Filter users based on applied filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      if (filters.username && !user.username.toLowerCase().includes(filters.username.toLowerCase())) {
        return false;
      }
      if (filters.email && !user.email.toLowerCase().includes(filters.email.toLowerCase())) {
        return false;
      }
      if (filters.accessRight && user.accessRight !== filters.accessRight) {
        return false;
      }
      return true;
    });
  }, [users, filters]);

  // Get user page access
  const getUserPageAccess = (user: User, pageKey: string): 'Write' | 'ReadOnly' | 'NoAccess' => {
    if (user.accessRight === 'Admin') {
      return 'Write';
    }
    return userPageAccess[user.id]?.[pageKey] || (user.accessRight === 'Write' ? 'Write' : 'ReadOnly');
  };

  // Update user page access
  const updateUserPageAccess = (user: User, pageKey: string, access: 'Write' | 'ReadOnly' | 'NoAccess') => {
    if (!isAdmin || user.accessRight === 'Admin') return;

    setUserPageAccess(prev => ({
      ...prev,
      [user.id]: {
        ...prev[user.id],
        [pageKey]: access
      }
    }));
    toast.show(`Page access updated for ${pageKey}`, { variant: 'success' });
  };

  // Grid column definitions
  const columnDefs = useMemo<ColDef<User>[]>(() => [
    {
      field: 'username',
      headerName: 'Username',
      width: 150,
      headerTooltip: 'Username - System login identifier'
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 250,
      headerTooltip: 'Email - User\'s email address'
    },
    {
      field: 'accessRight',
      headerName: 'Access Right',
      width: 130,
      headerTooltip: 'Access Right - User\'s system access level (ReadOnly/Write/Admin)',
      cellRenderer: (params: any) => {
        const { accessRight } = params.data;
        const colorClass =
          accessRight === 'Admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
          accessRight === 'Write' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
          'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';

        return `<span class="px-2 py-1 rounded-full text-xs font-medium ${colorClass}">${accessRight}</span>`;
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      headerTooltip: 'Status - User account status (Active/Locked)',
      cellRenderer: (params: any) => {
        const { status } = params.data;
        const colorClass = status === 'Active' ?
          'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
          'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';

        return `<span class="px-2 py-1 rounded-full text-xs font-medium ${colorClass}">${status}</span>`;
      }
    },
    {
      field: 'lastActiveDate',
      headerName: 'Last Active',
      width: 180,
      headerTooltip: 'Last Active Date - When the user last accessed the system',
      valueFormatter: (params) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleString();
      }
    }
  ], []);

  const defaultColDef: ColDef<User> = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: true,
  }), []);

  // Handlers
  const clearFilters = () => {
    setFilters({ username: '', email: '', accessRight: '' });
    setSelectedUser(null);
    toast.show('Filter cleared', { variant: 'info' });
  };

  const handleSelectionChanged = (event: SelectionChangedEvent<User>) => {
    const selectedRows = event.api.getSelectedRows();
    setSelectedUser(selectedRows.length > 0 ? selectedRows[0] : null);
  };

  const handleAddUser = (newUser: Omit<User, 'id' | 'createdDate'>) => {
    const user: User = {
      ...newUser,
      id: Date.now().toString(),
      createdDate: new Date().toISOString()
    };
    setUsers(prev => [...prev, user]);
    setAddUserOpen(false);
    toast.show('User added successfully', { variant: 'success' });
  };

  const updateUserField = (field: keyof User, value: any) => {
    if (!selectedUser || !isAdmin) return;

    setUsers(prev => prev.map(user =>
      user.id === selectedUser.id ? { ...user, [field]: value } : user
    ));
    setSelectedUser(prev => prev ? { ...prev, [field]: value } : null);
    toast.show('User updated successfully', { variant: 'success' });
  };


  const onGridReady = (params: GridReadyEvent<User>) => {
    params.api.sizeColumnsToFit();
  };

  const exportToCsv = () => {
    if (gridRef.current?.api) {
      gridRef.current.api.exportDataAsCsv({
        fileName: `users-${new Date().toISOString().split('T')[0]}.csv`,
        columnKeys: ['username', 'email', 'accessRight', 'status', 'lastActiveDate']
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="card-header">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold text-slate-800 dark:text-slate-200">User Management</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCsv}
            disabled={filteredUsers.length === 0}
            className="btn text-xs"
            title="Export users to CSV"
          >
            Export CSV
          </button>

          {isAdmin && (
            <button
              onClick={() => setAddUserOpen(true)}
              className="btn-solid text-xs"
            >
              Add New User
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 min-h-0 flex gap-4">
        {/* Left Panel - User Details */}
        {selectedUser && (
          <div className="w-80 flex flex-col gap-4">
            {/* User Details Card */}
            <div className="card">
              <div className="card-header">
                <h3 className="font-medium text-slate-800 dark:text-slate-200">User Details</h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={selectedUser.username}
                    disabled
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md
                               bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100
                               cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={selectedUser.email}
                    disabled
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md
                               bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100
                               cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={selectedUser.status}
                    onChange={(e) => updateUserField('status', e.target.value)}
                    disabled={!isAdmin}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md
                               bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100
                               disabled:bg-slate-50 disabled:dark:bg-slate-700 disabled:cursor-not-allowed"
                  >
                    <option value="Active">Active</option>
                    <option value="Locked">Locked</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Last Active Date
                  </label>
                  <input
                    type="text"
                    value={new Date(selectedUser.lastActiveDate).toLocaleString()}
                    disabled
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md
                               bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100
                               cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Page Access Matrix */}
            <div className="card flex-1">
              <div className="card-header">
                <h3 className="font-medium text-slate-800 dark:text-slate-200">Page Access Rights</h3>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {MOCK_PAGES.map(page => {
                    const userAccess = getUserPageAccess(selectedUser, page.pageKey);
                    return (
                      <div key={page.pageKey} className="border border-slate-200 dark:border-slate-600 rounded-lg p-3">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">{page.pageName}</h4>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`${page.pageKey}-access`}
                              checked={userAccess === 'Write'}
                              onChange={() => updateUserPageAccess(selectedUser, page.pageKey, 'Write')}
                              disabled={!isAdmin || selectedUser.accessRight === 'Admin'}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300">Write Access</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`${page.pageKey}-access`}
                              checked={userAccess === 'ReadOnly'}
                              onChange={() => updateUserPageAccess(selectedUser, page.pageKey, 'ReadOnly')}
                              disabled={!isAdmin || selectedUser.accessRight === 'Admin'}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300">Read Access</span>
                          </label>
                          {selectedUser.accessRight !== 'Admin' && (
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`${page.pageKey}-access`}
                                checked={userAccess === 'NoAccess'}
                                onChange={() => updateUserPageAccess(selectedUser, page.pageKey, 'NoAccess')}
                                disabled={!isAdmin}
                                className="text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-slate-700 dark:text-slate-300">No Access</span>
                            </label>
                          )}
                          {selectedUser.accessRight === 'Admin' && (
                            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                              Admin users have Write access to all pages
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right Side - Filter and User Grid */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Filter Controls */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-medium text-slate-800 dark:text-slate-200">Filter Users</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={filters.username}
                    onChange={(e) => setFilters(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md
                               bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    placeholder="Filter by username..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    type="text"
                    value={filters.email}
                    onChange={(e) => setFilters(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md
                               bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    placeholder="Filter by email..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Access Right
                  </label>
                  <select
                    value={filters.accessRight}
                    onChange={(e) => setFilters(prev => ({ ...prev, accessRight: e.target.value as any }))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md
                               bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    <option value="">All Access Rights</option>
                    <option value="ReadOnly">ReadOnly</option>
                    <option value="Write">Write</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4">
                <button
                  onClick={clearFilters}
                  className="btn text-xs"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* User Grid */}
          <div className="card flex-1 min-h-0">
            <div className="card-header">
              <h3 className="font-medium text-slate-800 dark:text-slate-200">Users ({filteredUsers.length})</h3>
            </div>
            <div className="p-3 flex-1 min-h-0">
              <div className="ag-theme-alpine modern-ag h-full">
                <AgGridReact<User>
                  ref={gridRef}
                  theme="legacy"
                  rowData={filteredUsers}
                  columnDefs={columnDefs}
                  defaultColDef={defaultColDef}
                  animateRows
                  rowSelection={{ mode: "singleRow", enableClickSelection: true }}
                  onSelectionChanged={handleSelectionChanged}
                  onGridReady={onGridReady}
                />
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Add User Modal */}
      {addUserOpen && (
        <AddUserModal
          onClose={() => setAddUserOpen(false)}
          onSave={handleAddUser}
          existingUsernames={users.map(u => u.username)}
          existingEmails={users.map(u => u.email)}
        />
      )}
    </div>
  );
}

// Add User Modal Component
interface AddUserModalProps {
  onClose: () => void;
  onSave: (user: Omit<User, 'id' | 'createdDate'>) => void;
  existingUsernames: string[];
  existingEmails: string[];
}

function AddUserModal({ onClose, onSave, existingUsernames, existingEmails }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    accessRight: 'ReadOnly' as 'ReadOnly' | 'Write' | 'Admin',
    status: 'Active' as 'Active' | 'Locked',
    lastActiveDate: new Date().toISOString()
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (existingUsernames.includes(formData.username)) {
      newErrors.username = 'Username already exists';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    } else if (existingEmails.includes(formData.email)) {
      newErrors.email = 'Email already exists';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Add New User</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Username *
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 ${
                errors.username ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
              }`}
              placeholder="Enter username..."
            />
            {errors.username && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.username}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 ${
                errors.email ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
              }`}
              placeholder="Enter email..."
            />
            {errors.email && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Access Right
            </label>
            <select
              value={formData.accessRight}
              onChange={(e) => setFormData(prev => ({ ...prev, accessRight: e.target.value as any }))}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="ReadOnly">ReadOnly</option>
              <option value="Write">Write</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="Active">Active</option>
              <option value="Locked">Locked</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="btn text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn-solid text-xs"
          >
            Add User
          </button>
        </div>
      </div>
    </div>
  );
}