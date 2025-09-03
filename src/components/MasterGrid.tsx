// src/components/MasterGrid.tsx
import React from "react";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  CellClassParams,
  GridReadyEvent,
  RowSelectedEvent,
  CellEditRequestEvent,
} from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import { api } from "../api";
import {
  ResourceDto,
  GridConfigDto,
  fromResource,
  toResource,
  Resource,
} from "../types";

/** Props sent from App (page orchestrator) */
type Props = {
  /** Page-level applied groups (filter). Empty array means “no filter” (show nothing). */
  initialGroups: string[];
  /** When a single row is selected, we send its id; when 0 or many, send null. */
  onSelectResource: (id: string | number | null) => void;
  /** Keep App informed of how many rows are selected (for small UI hints). */
  onSelectionCount: (n: number) => void;
  /** Called after a successful save so App can toast, etc. */
  onMasterPatched?: () => void;
  /** Future access control; if false, turn off editing/add/delete. */
  canWrite?: boolean;
};

/** Local row shape we show in the grid (camelCase) */
type RowModel = Resource & {
  /** true when this is a newly inserted row that hasn’t been saved yet */
  __isNew?: boolean;
};

/** Track dirty cells per (rowId -> set of colIds) */
type DirtyMap = Map<string | number, Set<string>>;

export default function MasterGrid({
  initialGroups,
  onSelectResource,
  onSelectionCount,
  onMasterPatched,
  canWrite = true,
}: Props) {
  const gridRef = React.useRef<AgGridReact<RowModel>>(null);

  const [rows, setRows] = React.useState<RowModel[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // server-driven grid config (optional; we fall back to sensible defaults)
  const [gridConfig, setGridConfig] = React.useState<GridConfigDto | null>(null);

  // changed cells tracker
  const dirtyRef = React.useRef<DirtyMap>(new Map());

  // fetch data whenever groups change
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // If the page filter is explicitly empty => show nothing.
        if (initialGroups && initialGroups.length === 0) {
          setRows([]);
          clearDirty();
          onSelectResource(null);
          onSelectionCount(0);
          return;
        }

        // load grid config (columns/editability)
        const cfg = await api.get<GridConfigDto>("/api/grid-config/scheduled-resources-master");
        if (!alive) return;
        setGridConfig(cfg.data);

        // fetch resources for selected groups
        const param = (initialGroups ?? []).join(",");
        const res = await api.get<ResourceDto[]>(`/api/resources?groups=${encodeURIComponent(param)}`);
        if (!alive) return;

        // map server -> UI
        const mapped: RowModel[] = (res.data || []).map(toResource);
        setRows(mapped);
        clearDirty();

        // clear selection (new data set)
        onSelectResource(null);
        onSelectionCount(0);
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

  /** Reset the dirty tracker */
  const clearDirty = () => {
    dirtyRef.current.clear();
    // Repaint grid to remove dirty highlighting
    gridRef.current?.api.redrawRows();
  };

  /** Is the specific cell marked dirty? */
  const isDirtyCell = (rowId: string | number | undefined, colId: string) => {
    if (rowId === undefined || rowId === null) return false;
    return !!dirtyRef.current.get(rowId)?.has(colId);
  };

  /** Mark/unmark a cell as dirty */
  const markDirtyCell = (rowId: string | number | undefined, colId: string, dirty: boolean) => {
    if (rowId === undefined || rowId === null) return;
    const map = dirtyRef.current;
    const set = map.get(rowId) ?? new Set<string>();
    if (dirty) set.add(colId);
    else set.delete(colId);
    if (set.size > 0) map.set(rowId, set);
    else map.delete(rowId);
  };

  /** Add a new blank row and put grid into edit mode on the first mandatory cell */
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
    // mark required field visually as dirty until user fills
    markDirtyCell(blank.id!, "resourceGroup", true);
    gridRef.current?.api.ensureIndexVisible(0);
    setTimeout(() => {
      gridRef.current?.api.startEditingCell({
        rowIndex: 0,
        colKey: "resourceGroup",
      });
    }, 0);
  };

  /** Delete selected rows on server (only non-new rows with real ids) */
  const delSelected = async () => {
    if (!canWrite) return;
    const apiGrid = gridRef.current?.api;
    const selected = apiGrid?.getSelectedRows() ?? [];
    const realIds = selected.map((r) => r.id).filter((id) => typeof id === "number" || typeof id === "string");
    if (realIds.length === 0) {
      // locally remove any unsaved new rows that are selected
      if (selected.length) {
        setRows((prev) => prev.filter((r) => !selected.some((s) => s.id === r.id)));
        // cleanup dirty map
        selected.forEach((s) => dirtyRef.current.delete(s.id as any));
        apiGrid?.deselectAll();
        onSelectionCount(0);
      }
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/resources/delete", { ids: realIds });
      // refresh
      const param = (initialGroups ?? []).join(",");
      const res = await api.get<ResourceDto[]>(`/api/resources?groups=${encodeURIComponent(param)}`);
      setRows((res.data || []).map(toResource));
      clearDirty();
      apiGrid?.deselectAll();
      onSelectResource(null);
      onSelectionCount(0);
    } catch (e: any) {
      setError(e?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  /** Persist changed/new rows */
  const save = async () => {
    if (!canWrite) return;
    // Build list of changed rows (by rowId)
    const changedIds = Array.from(dirtyRef.current.keys());
    // If a newly added row has only the required field dirty, still include it
    const candidates = rows.filter((r) => changedIds.includes(r.id as any) || r.__isNew);

    // Validate required fields
    for (const r of candidates) {
      if (!r.resourceGroup || !r.resourceGroup.trim()) {
        setError("Please fill required fields before saving.");
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      const payload: ResourceDto[] = candidates.map(fromResource);
      const res = await api.post<ResourceDto[]>("/api/resources/save", payload);
      // Refresh from server to ensure client matches DB
      const param = (initialGroups ?? []).join(",");
      const fresh = await api.get<ResourceDto[]>(`/api/resources?groups=${encodeURIComponent(param)}`);
      setRows((fresh.data || []).map(toResource));
      clearDirty();
      onMasterPatched?.();
    } catch (e: any) {
      setError(e?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  /** Cancel: discard unsaved edits and reload from API */
  const cancel = async () => {
    setLoading(true);
    setError(null);
    try {
      const param = (initialGroups ?? []).join(",");
      const res = await api.get<ResourceDto[]>(`/api/resources?groups=${encodeURIComponent(param)}`);
      setRows((res.data || []).map(toResource));
      clearDirty();
      gridRef.current?.api.deselectAll();
      onSelectionCount(0);
      onSelectResource(null);
    } catch (e: any) {
      setError(e?.message || "Reload failed");
    } finally {
      setLoading(false);
    }
  };

  /** Cell class rules for:
   *  - dirty highlight
   *  - required-missing (for new/edited rows)
   */
  const cellClass = (p: CellClassParams<RowModel>) => {
    const col = p.colDef.field!;
    const id = p.data?.id!;
    const classes: string[] = [];
    if (isDirtyCell(id, col)) classes.push("bg-emerald-50"); // edited feedback
    if (p.data?.__isNew && col === "resourceGroup" && !p.value) classes.push("bg-amber-50");
    return classes.join(" ");
  };

  /** Handle edits: mark dirty */
  const onCellEditRequest = (e: CellEditRequestEvent<RowModel>) => {
    // Update our local rows state
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== e.data.id) return r;
        const next = { ...r, [e.colDef.field as string]: e.newValue };
        return next;
      })
    );
    markDirtyCell(e.data.id!, e.colDef.field!, e.newValue !== e.oldValue);
    // Repaint just this row for performance
    gridRef.current?.api.refreshCells({ rowNodes: [e.node], force: true });
  };

  /** Selection change: single selection -> send id; multiple/none -> null */
  const onRowSelected = (e: RowSelectedEvent<RowModel>) => {
    const apiGrid = e.api;
    const sel = apiGrid.getSelectedRows();
    onSelectionCount(sel.length);
    if (sel.length === 1) onSelectResource(sel[0].id ?? null);
    else onSelectResource(null);
  };

  /** Grid setup */
  const defaultColDef: ColDef<RowModel> = {
    editable: canWrite,
    sortable: true,
    filter: true,
    resizable: true,
    cellClass: cellClass,
  };

  const colDefs: ColDef<RowModel>[] =
    gridConfig?.columns?.length
      ? gridConfig.columns.map((c) => ({
          field: toField(c.field),
          headerName: c.headerName ?? pretty(c.field),
          editable: canWrite && (c.editable ?? true),
          hide: c.hide ?? false,
          width: c.width,
          type: c.type as any,
          cellClass: cellClass,
        }))
      : [
          { field: "resourceGroup", headerName: "Resource Group", editable: canWrite, cellClass },
          { field: "isConstraint", headerName: "Is Constraint", editable: canWrite, cellClass },
          { field: "capacity", headerName: "Capacity", editable: canWrite, cellClass },
        ];

  const onGridReady = (e: GridReadyEvent<RowModel>) => {
    // size columns to fit initially
    e.api.sizeColumnsToFit();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="card-header">
        <div className="font-medium text-slate-800">Filter Results</div>
        <div className="flex items-center gap-2 text-sm">
          <button className="btn" onClick={addNew} disabled={!canWrite}>
            Add
          </button>
          <button className="btn" onClick={save} disabled={!canWrite || dirtyRef.current.size === 0}>
            Save
          </button>
          <button className="btn-ghost" onClick={cancel} disabled={dirtyRef.current.size === 0}>
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
            theme="legacy"
            rowData={rows}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            animateRows
            rowSelection={{ mode: "multiRow" }}
            suppressRowClickSelection={false}
            onRowSelected={onRowSelected}
            readOnlyEdit={false}
            editType="fullRow"
            // AG Grid v31+ recommends onCellEditRequest for controlled edits
            onCellEditRequest={onCellEditRequest}
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
