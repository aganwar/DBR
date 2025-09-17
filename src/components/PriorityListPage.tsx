// src/components/PriorityListPage.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, GridReadyEvent, CellEditRequestEvent } from 'ag-grid-community';
import { useToast } from './Toast';
import { priorityListApi } from '../api/priorityListApi';
import { api } from '../api';
import type { PriorityRowDto, ImportStatusDto, PriorityListPageDto } from '../types/priorityList';

export default function PriorityListPage() {
  const toast = useToast();
  const gridRef = React.useRef<AgGridReact<PriorityRowDto>>(null);

  // State
  const [data, setData] = useState<PriorityRowDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<ImportStatusDto | null>(null);
  const [dbrLoading, setDbrLoading] = useState<{ reset: boolean; run: boolean }>({ reset: false, run: false });

  // Filters
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [nonScheduledOnly, setNonScheduledOnly] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [resourceDropdownOpen, setResourceDropdownOpen] = useState(false);
  const resourceDropdownRef = useRef<HTMLDivElement>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);

  // Original data before any edits (for reverting)
  const [originalData, setOriginalData] = useState<Map<string, string | null>>(new Map());
  // All edits (both valid and invalid)
  const [allEdits, setAllEdits] = useState<Map<string, string | null>>(new Map());
  // Pending valid edits for manual save
  const [pendingEdits, setPendingEdits] = useState<Map<string, string | null>>(new Map());
  // Validation errors for edits
  const [validationErrors, setValidationErrors] = useState<Map<string, string>>(new Map());

  // Available resources from API
  const [availableResources, setAvailableResources] = useState<string[]>([]);

  // Validation function for target dates
  const validateTargetDate = (dateValue: string | null): string | null => {
    if (!dateValue) return null; // Empty is valid

    console.log('validateTargetDate called with:', dateValue, 'type:', typeof dateValue);

    // Handle different date formats from AG-Grid
    let inputDate: Date;
    if (dateValue instanceof Date) {
      // Use the date as-is but ensure we're working in local time
      inputDate = new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate());
    } else if (typeof dateValue === 'string') {
      // For string dates, create date in local timezone
      if (dateValue.includes('T')) {
        // ISO format - parse as is
        inputDate = new Date(dateValue);
      } else {
        // Date-only format (YYYY-MM-DD) - parse in local timezone
        const parts = dateValue.split('-');
        if (parts.length === 3) {
          inputDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        } else {
          inputDate = new Date(dateValue);
        }
      }
    } else {
      return 'Invalid date format';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    // Reset input date time to start of day for fair comparison
    const inputDateOnly = new Date(inputDate);
    inputDateOnly.setHours(0, 0, 0, 0);

    console.log('Comparing dates - input:', inputDateOnly, 'today:', today);

    if (isNaN(inputDate.getTime())) {
      console.log('Invalid date detected');
      return 'Invalid date format';
    }

    if (inputDateOnly < today) {
      console.log('Past date detected');
      return 'Cannot set date in the past';
    }

    console.log('Date validation passed');
    return null; // Valid
  };

  // Filtered data for client-side search
  const filteredData = useMemo(() => {
    if (!searchText.trim()) return data;
    const search = searchText.toLowerCase();
    return data.filter(row =>
      row.productionOrderNr.toLowerCase().includes(search) ||
      row.materialNumber.toLowerCase().includes(search) ||
      row.name.toLowerCase().includes(search)
    );
  }, [data, searchText]);

  // Fetch priority list data
  const fetchData = useCallback(async () => {
    // Allow fetching if either resources are selected OR non-scheduled is checked
    if (selectedResources.length === 0 && !nonScheduledOnly) {
      setData([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await priorityListApi.fetchPriorityList({
        resources: selectedResources.length > 0 ? selectedResources : undefined,
        nonScheduled: nonScheduledOnly,
        page: currentPage,
        pageSize: pageSize
      });

      setData(response.items);
      setTotalCount(response.total);

      // Store original target dates for reverting using unique row keys
      const originalMap = new Map<string, string | null>();
      response.items.forEach(item => {
        const rowKey = `${item.productionOrderNr}_${item.aspKey}`;
        originalMap.set(rowKey, item.targetDate);
      });
      setOriginalData(originalMap);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch priority list');
      toast.show('Failed to fetch data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [selectedResources, nonScheduledOnly, currentPage, pageSize, toast]);

  // Fetch import status
  const fetchImportStatus = useCallback(async () => {
    try {
      const status = await priorityListApi.getImportStatus();
      setImportStatus(status);
    } catch (err) {
      console.warn('Failed to fetch import status:', err);
    }
  }, []);

  // Fetch available resources
  const fetchAvailableResources = useCallback(async () => {
    try {
      const response = await api.get<string[]>('/api/resource-groups');
      setAvailableResources(response.data || []);
    } catch (err) {
      console.warn('Failed to fetch available resources:', err);
      // Set some fallback resources if API fails
      setAvailableResources(['RES-A', 'RES-B', 'RES-C', 'RES-D', 'RES-E']);
    }
  }, []);

  // Close resource dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resourceDropdownRef.current && !resourceDropdownRef.current.contains(event.target as Node)) {
        setResourceDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initial data load and import status
  useEffect(() => {
    fetchData();
    fetchImportStatus();
    fetchAvailableResources();
  }, [fetchData, fetchImportStatus, fetchAvailableResources]);


  // Resource selection helpers
  const toggleResource = (resource: string) => {
    setSelectedResources(prev => {
      if (prev.includes(resource)) {
        return prev.filter(r => r !== resource);
      } else {
        return [...prev, resource];
      }
    });
    setCurrentPage(1);
    if (selectedResources.length > 0 || !selectedResources.includes(resource)) {
      setNonScheduledOnly(false);
    }
  };

  const clearAllResources = () => {
    setSelectedResources([]);
    setCurrentPage(1);
  };

  const selectAllResources = () => {
    setSelectedResources([...availableResources]);
    setCurrentPage(1);
    setNonScheduledOnly(false);
  };

  // DBR Operations
  const handleDbrOperation = async (operation: 'reset' | 'run') => {
    setDbrLoading(prev => ({ ...prev, [operation]: true }));

    try {
      const result = await priorityListApi.runDbr(operation);
      toast.show(`DBR ${operation} completed successfully`, { variant: 'success' });
      // Optionally refresh data after DBR operations
      fetchData();
    } catch (err: any) {
      toast.show(`DBR ${operation} failed: ${err.message}`, { variant: 'error' });
    } finally {
      setDbrLoading(prev => ({ ...prev, [operation]: false }));
    }
  };

  // Handle target date edits
  const onCellEditRequest = (e: CellEditRequestEvent<PriorityRowDto>) => {
    const { data: rowData, colDef, newValue } = e;

    console.log('onCellEditRequest called:', { field: colDef.field, newValue, rowData: rowData?.productionOrderNr });

    if (colDef.field === 'targetDate' && rowData) {
      // Use a unique row key combining production order and asp key
      const rowKey = `${rowData.productionOrderNr}_${rowData.aspKey}`;

      // Store original values for ALL rows with same production order if first edit
      setOriginalData(prev => {
        const next = new Map(prev);
        // Find all rows with same production order and store their original values
        data.forEach(row => {
          if (row.productionOrderNr === rowData.productionOrderNr) {
            const currentRowKey = `${row.productionOrderNr}_${row.aspKey}`;
            if (!next.has(currentRowKey)) {
              next.set(currentRowKey, row.targetDate);
            }
          }
        });
        return next;
      });

      // Track all edits for ALL rows with same production order
      setAllEdits(prev => {
        const next = new Map(prev);
        // Add edit for all rows with same production order
        data.forEach(row => {
          if (row.productionOrderNr === rowData.productionOrderNr) {
            const currentRowKey = `${row.productionOrderNr}_${row.aspKey}`;
            next.set(currentRowKey, newValue || null);
          }
        });
        return next;
      });

      // Validate the new value
      const validationError = validateTargetDate(newValue);
      console.log('Validation result:', validationError);

      // Update validation errors for ALL rows with same production order
      setValidationErrors(prev => {
        const next = new Map(prev);
        data.forEach(row => {
          if (row.productionOrderNr === rowData.productionOrderNr) {
            const currentRowKey = `${row.productionOrderNr}_${row.aspKey}`;
            if (validationError) {
              next.set(currentRowKey, validationError);
            } else {
              next.delete(currentRowKey);
            }
          }
        });
        console.log('Updated validation for all rows with production order', rowData.productionOrderNr, ':', validationError);
        return next;
      });

      // Optimistically update the UI - update ALL rows with same production order
      setData(prevData => {
        const updatedData = prevData.map(row =>
          row.productionOrderNr === rowData.productionOrderNr
            ? {
                ...row,
                targetDate: newValue || null,
                customizedTargetDate: newValue ? true : false
              }
            : row
        );
        console.log('Updated data for all rows with production order', rowData.productionOrderNr, 'new targetDate:', newValue);
        return updatedData;
      });

      // Add to pending edits only if valid - for ALL rows with same production order
      setPendingEdits(prev => {
        const next = new Map(prev);
        data.forEach(row => {
          if (row.productionOrderNr === rowData.productionOrderNr) {
            const currentRowKey = `${row.productionOrderNr}_${row.aspKey}`;
            if (!validationError) {
              next.set(currentRowKey, newValue || null);
            } else {
              next.delete(currentRowKey);
            }
          }
        });
        console.log('Updated pending edits for all rows with production order', rowData.productionOrderNr, ':', !validationError ? 'added' : 'removed');
        return next;
      });
    }
  };

  // Column definitions
  const columnDefs = useMemo<ColDef<PriorityRowDto>[]>(() => [
    { field: 'productionOrderNr', headerName: 'Production Order', width: 130, pinned: 'left', sort: 'asc', sortIndex: 2, headerTooltip: 'Production Order Number - Unique identifier for the production order' },
    { field: 'workStepNr', headerName: 'Work Step', width: 100, headerTooltip: 'Work Step Number - Sequential step number in the production process' },
    { field: 'resource', headerName: 'Resource', width: 100, headerTooltip: 'Resource - The resource group assigned to this work step' },
    { field: 'name', headerName: 'Name', width: 200, headerTooltip: 'Name - Description or name of the production item' },
    { field: 'materialNumber', headerName: 'Material', width: 120, headerTooltip: 'Material Number - Material or part number being produced' },
    { field: 'quantity', headerName: 'Quantity', width: 100, type: 'numericColumn', headerTooltip: 'Quantity - Number of units to be produced' },
    { field: 'productionTime', headerName: 'Production Time', width: 120, type: 'numericColumn', headerTooltip: 'Production Time - Estimated time required for production (in minutes)' },
    { field: 'workstepsToGo', headerName: 'Steps to Go', width: 110, type: 'numericColumn', sort: 'asc', sortIndex: 0, headerTooltip: 'Work Steps to Go - Number of remaining work steps until completion' },
    {
      field: 'targetDate',
      headerName: 'Target Date',
      width: 120,
      editable: true,
      headerTooltip: 'Target Date - Target completion date for this production order (editable)',
      cellEditor: 'agDateCellEditor',
      cellEditorParams: {
        suppressKeyboardNavigation: true,
        max: '2099-12-31' // Disable AG-Grid's max date validation
      },
      valueParser: (params) => {
        // Handle the date value from AG-Grid editor
        const value = params.newValue;
        if (!value) return null;

        // If it's a Date object from AG-Grid, convert to YYYY-MM-DD format only (no time)
        if (value instanceof Date) {
          // Use getFullYear, getMonth, getDate to avoid timezone issues
          const year = value.getFullYear();
          const month = String(value.getMonth() + 1).padStart(2, '0');
          const day = String(value.getDate()).padStart(2, '0');
          const dateString = `${year}-${month}-${day}`;
          console.log('valueParser: Date object converted to', dateString, 'from original:', value);
          return dateString;
        }

        // If it's already a string, return as-is or strip time component
        if (typeof value === 'string') {
          if (value.includes('T')) {
            // Extract just the date part
            return value.split('T')[0];
          }
          return value;
        }

        return value;
      },
      valueFormatter: (params) => {
        if (!params.value) return '';
        try {
          // If it's a string in YYYY-MM-DD format, parse it carefully to avoid timezone issues
          if (typeof params.value === 'string' && params.value.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = params.value.split('-').map(Number);
            const date = new Date(year, month - 1, day); // Create date in local timezone
            return date.toLocaleDateString();
          }

          const date = new Date(params.value);
          if (isNaN(date.getTime())) return '';
          return date.toLocaleDateString();
        } catch {
          return '';
        }
      },
      cellClass: (params) => {
        if (!params.data) return '';

        const { productionOrderNr, aspKey } = params.data;
        const rowKey = `${productionOrderNr}_${aspKey}`;
        const hasValidationError = validationErrors.has(rowKey);
        const hasEdit = allEdits.has(rowKey);

        // Debug logging
        if (hasEdit || hasValidationError) {
          console.log(`cellClass for ${rowKey}: hasEdit=${hasEdit}, hasValidationError=${hasValidationError}`);
        }

        if (hasEdit && hasValidationError) {
          return 'bg-rose-50 dark:bg-rose-900/20';
        }

        if (hasEdit) {
          return 'bg-emerald-50 dark:bg-emerald-900/20';
        }

        return params.data.customizedTargetDate ? 'bg-blue-50 dark:bg-blue-900/20' : '';
      },
      suppressKeyboardEvent: (params) => {
        // Disable AG-Grid's built-in validation behaviors
        return false;
      }
    },
    { field: 'targetType', headerName: 'Target Type', width: 100, headerTooltip: 'Target Type - Type of target constraint (e.g., date-based, quantity-based)' },
    { field: 'targetBufferSize', headerName: 'Buffer Size', width: 110, type: 'numericColumn', headerTooltip: 'Target Buffer Size - Initial buffer size allocated for this target' },
    { field: 'remainingTargetBufferSize', headerName: 'Remaining Buffer', width: 130, type: 'numericColumn', headerTooltip: 'Remaining Target Buffer Size - Remaining buffer capacity available' },
    { field: 'targetRbc', headerName: 'Target RBC', width: 100, type: 'numericColumn', sort: 'desc', sortIndex: 1, headerTooltip: 'Target RBC - Resource Buffer Capacity target value' },
    { field: 'prio', headerName: 'Priority', width: 80, headerTooltip: 'Priority - Production priority level for this order' },
    { field: 'runningSumProductionTime', headerName: 'Running Sum', width: 120, type: 'numericColumn', headerTooltip: 'Running Sum Production Time - Cumulative production time including all previous steps' },
    { field: 'expectedStartTimeMin', headerName: 'Expected Start', width: 130, type: 'numericColumn', headerTooltip: 'Expected Start Time - Estimated start time in minutes from now' },
    { field: 'setupGroup', headerName: 'Setup Group', width: 110, headerTooltip: 'Setup Group - Group classification for setup operations' },
    {
      field: 'customizedTargetDate',
      headerName: 'Customized',
      width: 100,
      cellRenderer: (params: any) => params.value ? '✓' : '',
      headerTooltip: 'Customized Target Date - Indicates if target date has been manually customized'
    },
    {
      field: 'isExcluded',
      headerName: 'Excluded',
      width: 90,
      cellRenderer: (params: any) => params.value ? '✓' : '',
      headerTooltip: 'Is Excluded - Indicates if this item is excluded from scheduling'
    },
    {
      field: 'isScheduledRes',
      headerName: 'Scheduled',
      width: 100,
      cellRenderer: (params: any) => params.value ? '✓' : '',
      headerTooltip: 'Is Scheduled Resource - Indicates if this resource is currently scheduled'
    },
  ], [allEdits, validationErrors]);

  const defaultColDef: ColDef<PriorityRowDto> = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: true,
  }), []);

  const onGridReady = (params: GridReadyEvent<PriorityRowDto>) => {
    params.api.sizeColumnsToFit();

    // Apply initial sorting: WorkStepsToGo ASC, TargetRBC DESC, ProductionOrderNr ASC
    params.api.applyColumnState({
      state: [
        { colId: 'workstepsToGo', sort: 'asc', sortIndex: 0 },
        { colId: 'targetRbc', sort: 'desc', sortIndex: 1 },
        { colId: 'productionOrderNr', sort: 'asc', sortIndex: 2 }
      ]
    });
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="card-header">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold text-slate-800 dark:text-slate-200">Priority List</h1>

          {/* Import Status Pill */}
          {importStatus && (
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs">
              <div className={`w-2 h-2 rounded-full ${
                importStatus.status?.toLowerCase().includes('success') ? 'bg-green-500' :
                importStatus.status?.toLowerCase().includes('error') ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <span className="text-slate-700 dark:text-slate-300">
                {importStatus.file} - {importStatus.date ? new Date(importStatus.date).toLocaleString() : importStatus.rawDate}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Batch Edit Controls - Always Visible */}
          <button
            onClick={() => {
              // Revert all edited rows to their original values
              setData(prevData => prevData.map(row => {
                const rowKey = `${row.productionOrderNr}_${row.aspKey}`;
                const originalDate = originalData.get(rowKey);
                if (originalDate !== undefined) {
                  return {
                    ...row,
                    targetDate: originalDate,
                    customizedTargetDate: originalDate ? true : false
                  };
                }
                return row;
              }));

              // Clear all edit states
              setAllEdits(new Map());
              setPendingEdits(new Map());
              setValidationErrors(new Map());
            }}
            disabled={allEdits.size === 0}
            className="btn text-xs"
          >
            Cancel ({allEdits.size})
          </button>
          <button
            onClick={async () => {
              if (pendingEdits.size === 0) {
                toast.show('No valid changes to save', { variant: 'warning' });
                return;
              }

              const updates = Array.from(pendingEdits.entries()).map(([rowKey, targetDate]) => {
                // Extract productionOrderNr from rowKey (format: "productionOrderNr_aspKey")
                const productionOrderNr = rowKey.split('_')[0];
                return {
                  productionOrderNr,
                  targetDate
                };
              });

              try {
                const result = await priorityListApi.patchTargetDates(updates);
                toast.show(`Updated ${result.updated} rows`, { variant: 'success' });

                // Clear all edit states after successful save
                setAllEdits(new Map());
                setPendingEdits(new Map());
                setValidationErrors(new Map());

                // Refresh data to get updated state from server
                fetchData();
              } catch (err: any) {
                toast.show('Failed to update target dates', { variant: 'error' });
                // On error, revert to original values
                setData(prevData => prevData.map(row => {
                  const rowKey = `${row.productionOrderNr}_${row.aspKey}`;
                  const originalDate = originalData.get(rowKey);
                  if (originalDate !== undefined) {
                    return {
                      ...row,
                      targetDate: originalDate,
                      customizedTargetDate: originalDate ? true : false
                    };
                  }
                  return row;
                }));

                // Clear edit states
                setAllEdits(new Map());
                setPendingEdits(new Map());
                setValidationErrors(new Map());
              }
            }}
            disabled={pendingEdits.size === 0}
            className="btn-solid text-xs"
          >
            Save ({pendingEdits.size})
          </button>
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-600" />

          <button
            onClick={() => {
              if (gridRef.current?.api) {
                gridRef.current.api.exportDataAsCsv({
                  fileName: `priority-list-${new Date().toISOString().split('T')[0]}.csv`,
                  columnKeys: columnDefs.map(col => col.field).filter(field => field !== undefined) as string[]
                });
              }
            }}
            disabled={filteredData.length === 0}
            className="btn text-xs"
            title="Export grid data to CSV"
          >
            Export CSV
          </button>

          <button
            onClick={() => handleDbrOperation('reset')}
            disabled={dbrLoading.reset || dbrLoading.run}
            className="btn text-xs"
          >
            {dbrLoading.reset ? 'Resetting...' : 'Reset DBR'}
          </button>
          <button
            onClick={() => handleDbrOperation('run')}
            disabled={dbrLoading.reset || dbrLoading.run}
            className="btn-solid text-xs"
          >
            {dbrLoading.run ? 'Running...' : 'Run DBR'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex flex-wrap items-center gap-4">
          {/* Resource Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Resources:</label>
            <div className="relative" ref={resourceDropdownRef}>
              <button
                type="button"
                onClick={() => setResourceDropdownOpen(!resourceDropdownOpen)}
                disabled={nonScheduledOnly}
                className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-md
                           bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100
                           hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-between min-w-48"
              >
                <span>
                  {selectedResources.length === 0
                    ? 'Select Resources'
                    : selectedResources.length === 1
                    ? selectedResources[0]
                    : `${selectedResources.length} Resources Selected`
                  }
                </span>
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {resourceDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg">
                  <div className="p-2 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex gap-2">
                      <button
                        onClick={selectAllResources}
                        className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Select All
                      </button>
                      <button
                        onClick={clearAllResources}
                        className="text-xs px-2 py-1 bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {availableResources.map(resource => (
                      <label
                        key={resource}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedResources.includes(resource)}
                          onChange={() => toggleResource(resource)}
                          className="rounded border-slate-300 dark:border-slate-600"
                        />
                        <span className="text-sm text-slate-900 dark:text-slate-100">{resource}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />

          {/* Non-scheduled Filter */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={nonScheduledOnly}
              onChange={(e) => {
                setNonScheduledOnly(e.target.checked);
                setCurrentPage(1);
              }}
              className="rounded border-slate-300 dark:border-slate-600"
            />
            <span className="text-slate-700 dark:text-slate-300">Include non-scheduled</span>
          </label>

          <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />

          {/* Search */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Search:</label>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Production order, material..."
              className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-md
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100
                         placeholder-slate-500 dark:placeholder-slate-400 w-64"
            />
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          {error}
          <button
            onClick={fetchData}
            className="ml-2 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 p-4 min-h-0 flex flex-col">
        <div className="ag-theme-alpine modern-ag flex-1">
          <AgGridReact<PriorityRowDto>
            ref={gridRef}
            theme="legacy"
            rowData={filteredData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            animateRows
            editType="fullRow"
            readOnlyEdit={true}
            onCellEditRequest={onCellEditRequest}
            onGridReady={onGridReady}
            loading={loading}
            suppressRowClickSelection
          />
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between flex-shrink-0">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} results
            {searchText && ` (filtered from ${data.length})`}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm">
              <label className="text-slate-600 dark:text-slate-400">Page size:</label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded
                           bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading}
                className="btn text-xs px-2"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-2 py-1 text-xs rounded ${
                        pageNum === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'btn'
                      }`}
                      disabled={loading}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || loading}
                className="btn text-xs px-2"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}