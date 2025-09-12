// src/components/MasterGrid.tsx
import React from "react";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  CellClassParams,
  GridReadyEvent,
  CellEditRequestEvent,
} from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

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
  const [gridConfig, setGridConfig] = React.useState<GridConfigDto | null>(null);

  const dirtyRef = React.useRef<DirtyMap>(new Map());

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
          clearDirty();
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
        clearDirty();

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

  const clearDirty = () => {
    dirtyRef.current.clear();
    gridRef.current?.api?.redrawRows();
  };

  const isDirtyCell = (rowId: string | number | undefined, colId: string) => {
    if (rowId === undefined || rowId === null) return false;
    return !!dirtyRef.current.get(rowId)?.has(colId);
  };

  const markDirtyCell = (rowId: string | number | undefined, colId: string, dirty: boolean) => {
    if (rowId === undefined || rowId === null) return;
    const map = dirtyRef.current;
    const set = map.get(rowId) ?? new Set<string>();
    if (dirty) set.add(colId);
    else set.delete(colId);
    if (set.size > 0) map.set(rowId, set);
    else map.delete(rowId);
  };

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
    markDirtyCell(blank.id!, "resourceGroup", true);
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
    const realIds = selected
      .map((r) => r.id)
      .filter((id) => typeof id === "number" || typeof id === "string");
    if (realIds.length === 0) {
      if (selected.length) {
        setRows((prev) => prev.filter((r) => !selected.some((s) => s.id === r.id)));
        selected.forEach((s) => dirtyRef.current.delete(s.id as any));
        apiGrid?.deselectAll?.();
        onSelectionCount(0);
        selectedKeyRef.current = null;
      }
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/resources/delete", { ids: realIds });
      const param = (initialGroups ?? []).join(",");
      const res = await api.get<ResourceDto[]>(`/api/resources?groups=${encodeURIComponent(param)}`);
      const mapped = (res.data || []).map(toResource);
      setRows(mapped);
      clearDirty();
      // Reselect if the same id still exists
      reselectAfterRefresh(mapped);
      onSelectionCount(gridRef.current?.api?.getSelectedRows()?.length || 0);
    } catch (e: any) {
      setError(e?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!canWrite) return;
    const changedIds = Array.from(dirtyRef.current.keys());
    const candidates = rows.filter((r) => changedIds.includes(r.id as any) || r.__isNew);
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
      await api.post<ResourceDto[]>("/api/resources/save", payload);
      const param = (initialGroups ?? []).join(",");
      const fresh = await api.get<ResourceDto[]>(`/api/resources?groups=${encodeURIComponent(param)}`);
      const mapped = (fresh.data || []).map(toResource);
      setRows(mapped);
      clearDirty();

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
      clearDirty();

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

  const cellClass = (p: CellClassParams<RowModel>) => {
    const col = p.colDef.field!;
    const id = p.data?.id!;
    const classes: string[] = [];
    if (isDirtyCell(id, col)) classes.push("bg-emerald-50");
    if (p.data?.__isNew && col === "resourceGroup" && !p.value) classes.push("bg-amber-50");
    return classes.join(" ");
  };

  const onCellEditRequest = (e: CellEditRequestEvent<RowModel>) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== e.data.id) return r;
        return { ...r, [e.colDef.field as string]: e.newValue };
      })
    );
    markDirtyCell(e.data.id!, e.colDef.field!, e.newValue !== e.oldValue);
    gridRef.current?.api?.refreshCells({ rowNodes: [e.node], force: true });
  };

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
          type: (c.type as any) || undefined,
          cellClass: cellClass,
        }))
      : [
          { field: "resourceGroup", headerName: "Resource Group", editable: canWrite, cellClass },
          { field: "isConstraint", headerName: "Is Constraint", editable: canWrite, cellClass },
          { field: "capacity", headerName: "Capacity", editable: canWrite, cellClass },
        ];

  const onGridReady = (e: GridReadyEvent<RowModel>) => {
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
            rowSelection={{ mode: "singleRow", enableClickSelection: true }}
            onSelectionChanged={onSelectionChanged}
            readOnlyEdit={false}
            editType="fullRow"
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
