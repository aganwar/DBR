import React from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, GridApi, ColumnApi, CellEditingStoppedEvent } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { api } from "../api";
import { startOfThisWeek, endOfThisWeek, addDays, fmtYMD } from "../dates";

/** Server model */
export type CalendarRowDto = {
  dates: string;            // "yyyy-MM-dd"
  resource: string;
  capacity?: number | null; // editable
  is_off?: boolean | null;  // checkbox
  is_customised?: boolean | null;
};

type Props = {
  /** single selected resource group from Master grid; null = hide data */
  selectedResource: string | null;
  /** optional: show a small toast */
  onNotify?: (msg: string) => void;
  /** optional: tell parent when the grid has unsaved edits */
  onDirty?: (dirty: boolean) => void;
};

/** Save-buffer keyed by ymd */
type DirtyMap = Record<string, Partial<CalendarRowDto>>;

export default function CalendarGrid({ selectedResource, onNotify, onDirty }: Props) {
  const [rows, setRows] = React.useState<CalendarRowDto[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [dirty, setDirty] = React.useState<DirtyMap>({});
  const [rangeFrom, setRangeFrom] = React.useState<Date>(startOfThisWeek());
  const [rangeTo, setRangeTo] = React.useState<Date>(endOfThisWeek());

  const gridRef = React.useRef<AgGridReact<CalendarRowDto>>(null);
  const gridApi = React.useRef<GridApi | null>(null);
  const colApi = React.useRef<ColumnApi | null>(null);

  // keep parent informed
  React.useEffect(() => { onDirty?.(Object.keys(dirty).length > 0); }, [dirty, onDirty]);

  const fetchData = React.useCallback(async () => {
    if (!selectedResource) { setRows([]); setDirty({}); return; }
    setError(null);
    setLoading(true);
    try {
      const url = `/api/calendar/${encodeURIComponent(selectedResource)}?from=${fmtYMD(rangeFrom)}&to=${fmtYMD(rangeTo)}`;
      const res = await api.get<CalendarRowDto[]>(url);
      setRows(res.data || []);
      setDirty({});
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [selectedResource, rangeFrom, rangeTo]);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  const markDirty = (ymd: string, key: keyof CalendarRowDto, value: any) => {
    setDirty(prev => ({ ...prev, [ymd]: { ...(prev[ymd] || {}), [key]: value } }));
  };

  const onCellEditingStopped = (e: CellEditingStoppedEvent<CalendarRowDto>) => {
    const ymd = e.data!.dates;
    if (e.colDef.field === "dates" || e.colDef.field === "resource") return; // read-only
    // normalize for capacity: allow empty => null, numeric only
    if (e.colDef.field === "capacity") {
      const raw = e.value;
      if (raw === "" || raw == null) {
        markDirty(ymd, "capacity", null);
      } else {
        const n = Number(raw);
        if (Number.isNaN(n)) return; // ignore invalid
        markDirty(ymd, "capacity", Math.round(n));
      }
    } else if (e.colDef.field === "is_off") {
      markDirty(ymd, "is_off", !!e.value);
      // is_off true => capacity 0 (server also enforces)
      if (e.value === true) markDirty(ymd, "capacity", 0);
    }
    e.api.flashCells({ rowNodes: [e.node], columns: [e.column] });
  };

  const saveChanges = async () => {
    if (!selectedResource) return;
    const payload = { changesByDate: dirty };
    if (!Object.keys(dirty).length) return;
    setLoading(true); setError(null);
    try {
      await api.patch(`/api/calendar/${encodeURIComponent(selectedResource)}`, payload);
      setDirty({});
      onNotify?.("Calendar changes saved");
      await fetchData();
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const cancelChanges = () => {
    setDirty({});
    fetchData();
  };

  // quick range helpers
  const setThisWeek = () => { setRangeFrom(startOfThisWeek()); setRangeTo(endOfThisWeek()); };
  const setNext7 = () => { setRangeFrom(new Date()); setRangeTo(addDays(new Date(), 6)); };
  const setThisMonth = () => {
    const d = new Date();
    const from = new Date(d.getFullYear(), d.getMonth(), 1);
    const to = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    setRangeFrom(from); setRangeTo(to);
  };
  const setAll = () => { setRangeFrom(new Date(2000, 0, 1)); setRangeTo(new Date(2099, 11, 31)); };

  const colDefs = React.useMemo<ColDef<CalendarRowDto>[]>(() => ([
    {
      headerName: "Date",
      field: "dates",
      width: 140,
      sortable: true,
      filter: true,
      editable: false,
    },
    { headerName: "Resource", field: "resource", width: 140, editable: false, sortable: true, filter: true },
    {
      headerName: "Capacity (hrs)",
      field: "capacity",
      width: 140,
      editable: true,
      filter: "agNumberColumnFilter",
      valueParser: p => {
        if (p.newValue === "" || p.newValue == null) return null;
        const n = Number(p.newValue);
        return Number.isNaN(n) ? p.oldValue : Math.round(n);
      },
      cellClass: p => (dirty[p.data.dates]?.capacity !== undefined ? "cell-edited" : ""),
    },
    {
      headerName: "Off",
      field: "is_off",
      width: 100,
      editable: true,
      cellEditor: "agCheckboxCellEditor",
      filter: true,
      cellClass: p => (dirty[p.data.dates]?.is_off !== undefined ? "cell-edited" : ""),
    },
    {
      headerName: "Customised",
      field: "is_customised",
      width: 130,
      editable: false,
      filter: true,
    },
  ]), [dirty]);

  const defaultColDef = React.useMemo<ColDef>(() => ({
    resizable: true,
    sortable: true,
    filter: true,
    flex: 1,
  }), []);

  const onGridReady = (p: any) => { gridApi.current = p.api; colApi.current = p.columnApi; };

  return (
    <div className="flex flex-col h-full">
      {/* Header / actions */}
      <div className="card-header">
        <div className="font-medium text-slate-800">Selected Item — Calendar</div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500 mr-1">Range:</span>
          <button className="btn-ghost" onClick={setThisWeek}>This week</button>
          <button className="btn-ghost" onClick={setNext7}>Next 7 days</button>
          <button className="btn-ghost" onClick={setThisMonth}>This month</button>
          <button className="btn-ghost" onClick={setAll}>All</button>
          <div className="w-px h-5 bg-slate-200 mx-2" />
          <button className="btn" onClick={saveChanges} disabled={!Object.keys(dirty).length}>Save Changes</button>
          <button className="btn-ghost" onClick={cancelChanges} disabled={!Object.keys(dirty).length}>Cancel</button>
        </div>
      </div>

      {error && <div className="px-4 py-2 text-rose-700 bg-rose-50 border-t border-rose-200">{error}</div>}

      {/* Grid */}
      <div className="p-3 grow">
        <div className="ag-theme-alpine modern-ag h-full">
          <AgGridReact<CalendarRowDto>
            /** ✅ use legacy theme to match imported CSS and avoid error #9 */
            theme="legacy"
            ref={gridRef as any}
            rowData={selectedResource ? rows : []}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            animateRows
            rowSelection={{ mode: "singleRow" }}
            onCellEditingStopped={onCellEditingStopped}
            onGridReady={onGridReady}
          />
        </div>
        {loading && <div className="text-sm text-slate-500 mt-2">Working…</div>}
        {!selectedResource && (
          <div className="text-sm text-slate-500 mt-2">Select a single resource to view its calendar.</div>
        )}
      </div>
    </div>
  );
}
