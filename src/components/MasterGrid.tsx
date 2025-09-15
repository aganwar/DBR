// src/components/MasterGrid.tsx
import React from "react";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  CellClassParams,
  GridReadyEvent,
  CellEditRequestEvent,
} from "ag-grid-community";

import { api } from "../api";
import type { ResourceDto, GridConfigDto, Resource } from "../types";
import { fromResource, toResource } from "../types";

/** Props sent from App (page orchestrator) */
type Props = {
  /** Page-level applied groups (filter). Empty array means “no filter” (show nothing). */
  initialGroups: string[];
  /** When a single row is selected, we send its id (or fallback key) or null. */
  onSelectResource: (id: string | number | null) => void;
  /** Keep App informed of how many rows are selected (for small UI hints). */
  onSelectionCount: (n: number) => void;
  /** Called after a successful save so App can toast, etc. */
  onMasterPatched?: () => void;
  /** Future access control; if false, turn off editing/add/delete. */
  canWrite?: boolean;
};

/** Local row shape we show in the grid (camelCase) */
type RowModel = Resource & { __isNew?: boolean };

/** Track dirty cells per (rowId -> set of colIds) */
type DirtyMap = Map<string | number, Set<string>>;

/** Track invalid cells per (rowId -> set of colIds) */
type ErrorMap = Map<string | number, Set<string>>;

/** Track pending edits (similar to CalendarGrid pattern) */
type PendingEdits = Record<string | number, Partial<RowModel>>;

export default function MasterGrid({
  initialGroups,
  onSelectResource,
  onSelectionCount,
  onMasterPatched,
  canWrite = true,
}: Props) {
  console.log('MasterGrid: Component rendered/re-rendered', { initialGroups, canWrite });
  const gridRef = React.useRef<AgGridReact<RowModel>>(null);

  const [rows, setRows] = React.useState<RowModel[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [gridConfig, setGridConfig] = React.useState<GridConfigDto | null>(null);

  const [pending, setPending] = React.useState<PendingEdits>({});
  const [errors, setErrors] = React.useState<Record<string | number, Partial<Record<keyof RowModel, true>>>>({});

  /** Persist the currently selected key so we can re-select it after refresh/cancel */
  const selectedKeyRef = React.useRef<string | number | null>(null);

  // fetch data whenever groups change
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // explicitly cleared filter => show nothing
        if (initialGroups && initialGroups.length === 0) {
          setRows([]);
          clearPending();
          onSelectResource(null);
          onSelectionCount(0);
          setLoading(false);
          return;
        }

        const cfg = await api.get<GridConfigDto>("/api/grid-config/scheduled-resources-master");
        if (!alive) return;
        setGridConfig(cfg.data);

        const param = (initialGroups ?? []).join(",");
        const res = await api.get<ResourceDto[]>(`/api/resources?groups=${encodeURIComponent(param)}`);
        if (!alive) return;

        const mapped: RowModel[] = (res.data || []).map(toResource);
        setRows(mapped);
        clearPending();

        // Preserve selection if possible
        reselectAfterRefresh(mapped);

        onSelectionCount(gridRef.current?.api?.getSelectedRows()?.length || 0);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Failed to load resources");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialGroups)]);

  const clearPending = () => {
    setPending({});
    setErrors({});
    gridRef.current?.api?.redrawRows();
  };

  function setErrorFlag(rowKey: string | number, field: keyof RowModel, invalid: boolean) {
    setErrors((prev) => {
      const next = { ...prev };
      const entry = { ...(next[rowKey] || {}) };
      if (invalid) entry[field] = true;
      else delete entry[field];
      if (Object.keys(entry).length === 0) delete next[rowKey];
      else next[rowKey] = entry;
      return next;
    });
  }

  // Validation function for MasterGrid fields - capacity is mandatory, must be 0 or positive
  function validate(field: keyof RowModel, value: any): boolean {
    if (field === "capacity") {
      // capacity is mandatory - cannot be null/empty
      if (value === "" || value == null || value === undefined) return false;
      if (typeof value === "number" && Number.isFinite(value) && value >= 0) return true;
      // Also handle string numbers
      const num = Number(value);
      if (typeof value === "string" && !isNaN(num) && Number.isFinite(num) && num >= 0) return true;
      return false;
    }
    if (field === "resourceGroup") {
      return value && String(value).trim().length > 0;
    }
    if (field === "isConstraint") {
      return typeof value === "boolean";
    }
    return true;
  }

  const addNew = () => {
    if (!canWrite) return;
    const blank: RowModel = {
      id: `new-${Date.now()}`,
      resourceGroup: "",
      isConstraint: false,
      capacity: null,
      __isNew: true,
    };
    setRows((prev) => [blank, ...prev]);

    // Mark as pending edit for new row and set error flag for empty mandatory fields
    setPending((prev) => ({
      ...prev,
      [blank.id!]: { resourceGroup: "", capacity: null }
    }));

    // Set error flags for empty mandatory fields
    setErrorFlag(blank.id!, "resourceGroup", true);
    setErrorFlag(blank.id!, "capacity", true); // capacity is also mandatory
    gridRef.current?.api?.ensureIndexVisible(0);
    setTimeout(() => {
      gridRef.current?.api?.startEditingCell({
        rowIndex: 0,
        colKey: "resourceGroup",
      });
    }, 0);
  };

  const delSelected = async () => {
    if (!canWrite) return;
    const apiGrid = gridRef.current?.api;
    const selected = apiGrid?.getSelectedRows() ?? [];

    if (selected.length === 0) {
      setError("Please select a resource to delete.");
      return;
    }

    // Use resourceGroup as the identifier for deletion (this is what the API expects)
    const resourceGroupsToDelete = selected
      .map((r) => r.resourceGroup)
      .filter((group) => group && String(group).trim().length > 0);

    if (resourceGroupsToDelete.length === 0) {
      setError("Selected resources don't have valid resource groups.");
      return;
    }

    // Don't handle new rows locally - always call API for real deletions
    setLoading(true);
    setError(null);
    try {
      console.log('MasterGrid: Deleting resource groups:', resourceGroupsToDelete);

      // Use DELETE endpoint as per API specification with resourceGroup names
      await api.delete("/api/resources", { data: resourceGroupsToDelete });

      console.log('MasterGrid: Delete successful, refreshing data...');

      // Refresh data from server
      const param = (initialGroups ?? []).join(",");
      const res = await api.get<ResourceDto[]>(`/api/resources?groups=${encodeURIComponent(param)}`);
      const mapped = (res.data || []).map(toResource);
      setRows(mapped);
      clearPending();

      // Clear selection
      apiGrid?.deselectAll?.();
      onSelectionCount(0);
      selectedKeyRef.current = null;

      console.log('MasterGrid: Delete completed, rows refreshed');
    } catch (e: any) {
      console.error('MasterGrid: Delete failed:', e);
      setError(e?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!canWrite) return;

    // Check if any errors exist before saving
    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) {
      setError("Please fix invalid fields before saving.");
      return;
    }

    const changedIds = Object.keys(pending);
    const candidates = rows.filter((r) => changedIds.includes(String(r.id)) || r.__isNew);
    for (const r of candidates) {
      if (!r.resourceGroup || !r.resourceGroup.trim()) {
        setError("Please fill required fields before saving.");
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      // Separate new resources from existing ones
      const newResources = candidates.filter(r => r.__isNew);
      const existingResources = candidates.filter(r => !r.__isNew);

      // Create new resources one by one (API only accepts single ResourceDto)
      for (const newResource of newResources) {
        const dto: ResourceDto = {
          resource_group: newResource.resourceGroup,
          is_constraint: newResource.isConstraint,
          capacity: newResource.capacity ? Math.floor(newResource.capacity) : null // Convert to int
        };
        await api.post("/api/resources", dto);
      }

      // Update existing resources using PATCH endpoint
      if (existingResources.length > 0) {
        const patchItems = existingResources.map(resource => ({
          id: resource.resourceGroup, // Use resourceGroup as id
          changes: {
            is_constraint: resource.isConstraint,
            capacity: resource.capacity ? Math.floor(resource.capacity) : null // Convert to int
          }
        }));
        await api.patch("/api/resources", patchItems);
      }

      // Refresh data
      const param = (initialGroups ?? []).join(",");
      const fresh = await api.get<ResourceDto[]>(`/api/resources?groups=${encodeURIComponent(param)}`);
      const mapped = (fresh.data || []).map(toResource);
      setRows(mapped);
      clearPending();

      // Reselect previous selection
      reselectAfterRefresh(mapped);

      onMasterPatched?.();
    } catch (e: any) {
      setError(e?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  /** Cancel must ALWAYS be enabled: refresh data from server, keep filters & selection, drop edits */
  const cancel = async () => {
    setLoading(true);
    setError(null);
    try {
      const param = (initialGroups ?? []).join(",");
      const res = await api.get<ResourceDto[]>(`/api/resources?groups=${encodeURIComponent(param)}`);
      const mapped = (res.data || []).map(toResource);
      setRows(mapped);
      clearPending();

      // Reapply selection if present
      reselectAfterRefresh(mapped);
      onSelectionCount(gridRef.current?.api?.getSelectedRows()?.length || 0);
    } catch (e: any) {
      setError(e?.message || "Reload failed");
    } finally {
      setLoading(false);
    }
  };

  /** Stable key for rows (matches what we use to reselect) */
  const getRowId = React.useCallback((params: { data: RowModel }) => {
    const key = params.data?.id ?? params.data?.resourceGroup;
    return String(key ?? "");
  }, []);

  /** Remember and emit selection → Calendar */
  const onSelectionChanged = () => {
    const sel = gridRef.current?.api?.getSelectedRows?.() ?? [];
    onSelectionCount(sel.length);
    if (sel.length === 1) {
      const row = sel[0];
      const key = (row.id ?? row.resourceGroup) as string | number | undefined;
      selectedKeyRef.current = key ?? null; // remember for reselect on refresh/cancel
      onSelectResource(key ?? null);
    } else {
      selectedKeyRef.current = null;
      onSelectResource(null);
    }
  };

  /** Re-select previously selected row (by our stable key) */
  function reselectAfterRefresh(nextRows: RowModel[]) {
    const apiGrid = gridRef.current?.api;
    const prev = selectedKeyRef.current;
    if (!apiGrid || prev == null) return;
    const prevKey = String(prev);

    let matched = false;
    apiGrid.forEachNode((node) => {
      const nodeKey =
        (node.data?.id != null ? String(node.data.id) : String(node.data?.resourceGroup ?? ""));
      if (!matched && nodeKey === prevKey) {
        node.setSelected(true);
        matched = true;
      }
    });
    if (!matched) {
      // if it no longer exists, clear selection state
      apiGrid.deselectAll();
      selectedKeyRef.current = null;
      onSelectResource(null);
    }
  }

  // Cell class helper - create a stable function that doesn't recreate on every state change
  const getCellClass = React.useCallback((p: CellClassParams<RowModel>) => {
    // Use same logic as getRowId to get consistent row key
    const rowKey = p.data?.id ?? p.data?.resourceGroup;
    const field = p.colDef.field as keyof RowModel;

    if (!rowKey) return "";

    // Get current state values at render time
    const currentPending = pending[rowKey];
    const currentErrors = errors[rowKey];

    // Check if this specific cell (row + field combination) was edited
    const fieldInPending = currentPending && (field in currentPending);
    const invalid = !!currentErrors?.[field];

    // Only log if there's something interesting to show
    if (fieldInPending || currentPending) {
      console.log(`MasterGrid getCellClass: rowKey=${rowKey}, field=${field}, fieldInPending=${fieldInPending}, currentPending=${JSON.stringify(currentPending)}`);
    }

    if (fieldInPending && invalid) {
      console.log(`MasterGrid: Applied bg-rose-50 to cell ${rowKey}-${field}`);
      return "bg-rose-50";  // edited + invalid → light red
    }
    if (fieldInPending) {
      console.log(`MasterGrid: Applied bg-emerald-50 to cell ${rowKey}-${field}`);
      return "bg-emerald-50";          // edited + valid   → light green
    }

    // Special case for new rows - highlight mandatory empty fields
    if (p.data?.__isNew) {
      if (field === "resourceGroup" && (!p.value || !String(p.value).trim())) {
        return "bg-rose-50"; // Red for mandatory empty resourceGroup
      }
      if (field === "capacity" && (p.value === null || p.value === undefined || p.value === "")) {
        return "bg-rose-50"; // Red for mandatory empty capacity
      }
    }

    return "";
  }, [pending, errors]);


  const defaultColDef: ColDef<RowModel> = {
    editable: canWrite,
    sortable: true,
    filter: true,
    resizable: true,
  };

  const colDefs: ColDef<RowModel>[] =
    gridConfig?.columns?.length
      ? gridConfig.columns.map((c) => ({
          field: toField(c.field),
          headerName: c.headerName ?? pretty(c.field),
          editable: canWrite && (c.editable ?? true),
          hide: c.hide ?? false,
          width: c.width,
          type: (c.type as any) || undefined,
          cellClass: getCellClass,
        }))
      : [
          {
            field: "resourceGroup",
            headerName: "Resource Group",
            editable: canWrite,
            cellClass: getCellClass
          },
          {
            field: "isConstraint",
            headerName: "Is Constraint",
            editable: canWrite,
            cellClass: getCellClass,
            cellRenderer: "agCheckboxCellRenderer"
          },
          {
            field: "capacity",
            headerName: "Capacity",
            editable: canWrite,
            cellClass: getCellClass,
            type: "numericColumn",
            valueParser: (p: any) => {
              const v = String(p.newValue ?? "").trim();
              if (v === "") return null;
              const n = Number(v.replace(",", "."));
              // Return the parsed value even if invalid - let validation handle it
              return Number.isFinite(n) ? n : p.newValue;
            }
          },
        ];

  const onGridReady = (e: GridReadyEvent<RowModel>) => {
    console.log('MasterGrid: Grid is ready!', { rowCount: rows.length });
    e.api.sizeColumnsToFit();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="card-header">
        <div className="font-medium text-slate-800 dark:text-slate-200">Filter Results</div>
        <div className="flex items-center gap-2 text-sm">
          <button className="btn" onClick={addNew} disabled={!canWrite}>
            Add
          </button>
          <button
            className="btn"
            onClick={save}
            disabled={!canWrite || Object.keys(pending).length === 0 || Object.keys(errors).length > 0}
            title={Object.keys(errors).length > 0 ? "Fix invalid fields before saving" : "Save changes"}
          >
            Save
          </button>
          {/* Cancel is ALWAYS enabled to refresh while preserving filters/selection */}
          <button className="btn-ghost" onClick={cancel}>
            Cancel
          </button>
          <div className="w-px h-5 bg-slate-200 mx-1" />
          <button className="btn" onClick={delSelected} disabled={!canWrite}>
            Delete
          </button>
        </div>
      </div>

      {error && <div className="px-4 py-2 text-rose-700 bg-rose-50 border-t border-rose-200">{error}</div>}

      {/* Grid */}
      <div className="p-3 grow">
        <div className="ag-theme-alpine modern-ag h-full">
          <AgGridReact<RowModel>
            ref={gridRef as any}
            theme="legacy"                                  // keep legacy CSS theme
            rowData={rows}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            animateRows
            getRowId={getRowId}
            rowSelection={{ mode: "singleRow", enableClickSelection: false, checkboxes: true, headerCheckbox: false }}
            onSelectionChanged={onSelectionChanged}
            onCellValueChanged={(e) => {
              console.log('MasterGrid: Raw cell data:', e.data);

              const field = e.colDef.field as keyof RowModel;
              const value = e.newValue;
              // Use same logic as getRowId to get consistent row key
              const rowKey = e.data.id ?? e.data.resourceGroup;
              const isDirty = e.newValue !== e.oldValue;

              // Validate the new value
              const isValid = validate(field, value);

              console.log(`MasterGrid onCellValueChanged:`, {
                field,
                oldValue: e.oldValue,
                newValue: e.newValue,
                rowKey,
                isDirty,
                isValid
              });

              console.log(`MasterGrid: About to update pending state. Current pending:`, pending);

              // Track pending change
              setPending((prev) => {
                const next = { ...prev };
                const entry = next[rowKey] ? { ...next[rowKey] } : {};
                entry[field] = value;
                next[rowKey] = entry;
                console.log(`MasterGrid: Updated pending state:`, next);
                return next;
              });

              // Validate edited cell
              setErrorFlag(rowKey, field, !isValid);
              console.log(`MasterGrid: Set error flag for ${rowKey}-${field}: ${!isValid}`);

              // Force cell refresh to update visual feedback for just this cell
              setTimeout(() => {
                gridRef.current?.api?.refreshCells({
                  rowNodes: [e.node],
                  columns: [e.column],
                  force: true
                });
              }, 0);
            }}
            onGridReady={onGridReady}
          />
        </div>
        {loading && <div className="text-sm text-slate-500 mt-2">Working…</div>}
      </div>
    </div>
  );
}

/** Helpers */
function toField(serverField: string): keyof RowModel {
  if (serverField === "resource_group") return "resourceGroup";
  if (serverField === "is_constraint") return "isConstraint";
  return (serverField as any) as keyof RowModel;
}
function pretty(field: string) {
  if (field === "resource_group") return "Resource Group";
  if (field === "is_constraint") return "Is Constraint";
  return field[0].toUpperCase() + field.slice(1);
}
