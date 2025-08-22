import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, SelectionChangedEvent } from "ag-grid-community"; // ✅ type-only import
import { api } from "../api";
import Toast from "./Toast";

export interface ResourceDto {
  id?: number;
  resourceGroup: string;
  isConstraint: boolean;
  capacity?: number;
}

export type MasterGridHandle = {
  refresh: () => void;
  clearFilter: () => void;
  getSelected: () => ResourceDto[];
};

type Props = {
  onSelectionChange: (rows: ResourceDto[]) => void;
};

const MasterGrid = forwardRef<MasterGridHandle, Props>(({ onSelectionChange }, ref) => {
  const gridRef = useRef<AgGridReact<ResourceDto>>(null);
  const [rowData, setRowData] = useState<ResourceDto[]>([]);
  const [colDefs, setColDefs] = useState<ColDef<ResourceDto>[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [dirtyRows, setDirtyRows] = useState<Set<number>>(new Set());
  const [newRowId, setNewRowId] = useState<number | null>(null);

  // fetch config + data
  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const cfg = await api.get("/api/grid-config/scheduled-resources-master");
        if (!alive) return;

        const defs: ColDef<ResourceDto>[] = [
          {
            field: "resourceGroup",
            headerName: "Resource Group",
            editable: Boolean(cfg.data?.resourceGroup?.editable),
            cellClass: params => {
              const missing = newRowId === Number(params.node.id) && !params.value;
              return missing ? "required-missing" : "";
            }
          },
          {
            field: "isConstraint",
            headerName: "Is Constraint",
            editable: Boolean(cfg.data?.isConstraint?.editable),
            cellRenderer: "agCheckboxCellRenderer"
          },
          {
            field: "capacity",
            headerName: "Capacity",
            editable: Boolean(cfg.data?.capacity?.editable),
            type: "numericColumn",
            cellClass: params =>
              dirtyRows.has(params.node.rowIndex!) ? "cell-dirty" : ""
          }
        ];
        setColDefs(defs);

        const res = await api.get("/api/resources");
        if (!alive) return;
        setRowData(res.data);
      } catch (e) {
        // minimal fallback; keep grid usable
        setColDefs([
          { field: "resourceGroup", headerName: "Resource Group", editable: true },
          { field: "isConstraint", headerName: "Is Constraint", editable: true, cellRenderer: "agCheckboxCellRenderer" },
          { field: "capacity", headerName: "Capacity", editable: true, type: "numericColumn" }
        ]);
      }
    }
    load();
    return () => { alive = false; };
  }, [newRowId, dirtyRows]);

  useImperativeHandle(ref, () => ({
    refresh: async () => {
      const res = await api.get("/api/resources");
      setRowData(res.data);
    },
    clearFilter: () => {
      gridRef.current?.api.setFilterModel(null);
      gridRef.current?.api.onFilterChanged();
    },
    getSelected: () => {
      return gridRef.current?.api.getSelectedRows() ?? [];
    }
  }));

  async function saveAll() {
    if (newRowId !== null) {
      const node = gridRef.current?.api.getRowNode(String(newRowId));
      if (node && !node.data.resourceGroup) {
        setToast("Resource Group is required");
        return;
      }
    }
    const updates: ResourceDto[] = [];
    gridRef.current?.api.forEachNode(node => {
      if (dirtyRows.has(node.rowIndex!)) updates.push(node.data);
    });
    if (updates.length === 0) {
      setToast("No changes to save");
      return;
    }
    await api.post("/api/resources/save", updates);
    setToast("Saved ✔");
    setDirtyRows(new Set());
    setNewRowId(null);
    const res = await api.get("/api/resources");
    setRowData(res.data);
  }

  async function cancelAll() {
    const res = await api.get("/api/resources");
    setRowData(res.data);
    setDirtyRows(new Set());
    setNewRowId(null);
  }

  function addNew() {
    const id = Date.now();
    const newRow: ResourceDto = { id, resourceGroup: "", isConstraint: false, capacity: undefined };
    setRowData(prev => [...prev, newRow]);
    setNewRowId(id);
  }

  async function deleteSelected() {
    const sel = gridRef.current?.api.getSelectedRows() ?? [];
    if (sel.length === 0) return;
    await api.post("/api/resources/delete", sel.map(r => r.id));
    setToast("Deleted ✔");
    const res = await api.get("/api/resources");
    setRowData(res.data);
  }

  function onCellEditingStopped(e: any) {
    setDirtyRows(prev => new Set(prev).add(e.node.rowIndex!));
    e.api.flashCells({ rowNodes: [e.node], columns: [e.column] });
  }

  function onSelectionChanged(e: SelectionChangedEvent) {
    onSelectionChange(e.api.getSelectedRows());
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-gradient-to-b from-white to-slate-50 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <button onClick={addNew} className="btn" title="Add new">+ Add</button>
          <button onClick={deleteSelected} className="btn" title="Delete">🗑 Delete</button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={saveAll} className="btn-solid">Save</button>
          <button onClick={cancelAll} className="btn">Cancel</button>
          <button onClick={() => gridRef.current?.api.setFilterModel(null)} className="btn-ghost">Clear Filter</button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 ag-theme-alpine modern-ag">
        <AgGridReact<ResourceDto>
          ref={gridRef}
          rowData={rowData}
          columnDefs={colDefs}
          defaultColDef={{ flex: 1, resizable: true, sortable: true, filter: true }}
          animateRows
          theme="legacy"
          rowSelection={{ mode: "singleRow" }}   // ✅ v34 style
          onCellEditingStopped={onCellEditingStopped}
          onSelectionChanged={onSelectionChanged}
        />
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
});

export default MasterGrid;
