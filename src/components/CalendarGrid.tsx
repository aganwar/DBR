// src/components/CalendarGrid.tsx
import React from "react";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  CellClassParams,
  CellEditRequestEvent,
  GridReadyEvent,
} from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import { api } from "../api";
import type { CalendarRowDto, CalendarPatchDto } from "../types";
import {
  thisWeek,
  next7Days,
  nextWeek,
  thisMonth,
  allRange,
} from "../utils/dates";

type Props = {
  /** Selected resource id or code; when null we still render headers with no rows */
  selectedResource: string | number | null;
  /** Toast helper: (message, variant) where variant is "success" | "info" | "error" | undefined */
  onNotify?: (message: string, variant?: "success" | "info" | "error") => void;
  /** Surface “unsaved changes” to the parent if desired */
  onDirty?: (isDirty: boolean) => void;
  /** Future access control */
  canWrite?: boolean;
};

type RowModel = {
  date: string; // yyyy-mm-dd
  capacity: number | null;
  is_off: boolean;
  is_customised: boolean;
};

type Pending = Record<
  string, // yyyy-mm-dd
  {
    capacity?: number | null;
    is_off?: boolean;
  }
>;

export default function CalendarGrid({
  selectedResource,
  onNotify,
  onDirty,
  canWrite = true,
}: Props) {
  const gridRef = React.useRef<AgGridReact<RowModel>>(null);

  // Range state
  const [from, setFrom] = React.useState(() => thisWeek().from);
  const [to, setTo] = React.useState(() => thisWeek().to);

  // Data + pending
  const [rows, setRows] = React.useState<RowModel[]>([]);
  const [pending, setPending] = React.useState<Pending>({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const dirty = React.useMemo(() => Object.keys(pending).length > 0, [pending]);
  React.useEffect(() => onDirty?.(dirty), [dirty, onDirty]);

  // Fetch rows whenever selection or range changes
  React.useEffect(() => {
    let alive = true;

    async function load() {
      // If nothing selected, show empty grid (headers visible)
      if (!selectedResource) {
        setRows([]);
        setPending({});
        setError(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<CalendarRowDto[]>(
          `/api/calendar/${encodeURIComponent(String(selectedResource))}?from=${from}&to=${to}`
        );
        if (!alive) return;
        const data = (res.data || []).map((r) => ({
          date: r.dates,
          capacity: r.capacity ?? null,
          is_off: !!r.is_off,
          is_customised: !!r.is_customised,
        }));
        setRows(data);
        setPending({});
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Failed to load calendar");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [selectedResource, from, to]);

  // Grid wiring
  const defaultColDef: ColDef<RowModel> = React.useMemo(
    () => ({
      sortable: true,
      resizable: true,
      filter: true,
      editable: canWrite && !!selectedResource, // disable edits until a resource is selected
      cellClass: (p: CellClassParams<RowModel>) => {
        const classes: string[] = [];
        if (pending[p.data?.date || ""]) classes.push("bg-emerald-50");
        return classes.join(" ");
      },
    }),
    [canWrite, selectedResource, pending]
  );

  const colDefs = React.useMemo<ColDef<RowModel>[]>(() => {
    return [
      {
        field: "date",
        headerName: "Date",
        editable: false,
        width: 140,
      },
      {
        field: "capacity",
        headerName: "Capacity",
        type: "numericColumn",
        valueParser: (p: any) => {
          const v = String(p.newValue ?? "").trim();
          if (v === "") return null;
          const n = Number(v);
          return Number.isFinite(n) ? n : p.oldValue ?? null;
        },
      },
      {
        field: "is_off",
        headerName: "Off day",
        cellRenderer: "agCheckboxCellRenderer",
        width: 120,
      },
      {
        field: "is_customised",
        headerName: "Customised",
        editable: false,
        width: 130,
      },
    ];
  }, []);

  // Apply a cell edit (AG Grid controlled-edit pattern)
  const onCellEditRequest = (e: CellEditRequestEvent<RowModel>) => {
    const { data, colDef, newValue, oldValue } = e;
    if (newValue === oldValue) return;

    const key = data.date;
    const col = colDef.field as keyof RowModel;

    setRows((prev) =>
      prev.map((r) => (r.date === key ? { ...r, [col]: newValue } : r))
    );

    setPending((prev) => {
      const next = { ...prev };
      const entry = next[key] ? { ...next[key] } : {};
      if (col === "capacity") entry.capacity = (newValue ?? null) as number | null;
      if (col === "is_off") entry.is_off = !!newValue;

      // If both fields equal original values, drop the pending entry
      const original = rows.find((r) => r.date === key);
      const capEqual =
        entry.capacity === undefined ||
        entry.capacity === (original?.capacity ?? null);
      const offEqual =
        entry.is_off === undefined || entry.is_off === (original?.is_off ?? false);

      if (capEqual && offEqual) {
        delete next[key];
      } else {
        next[key] = entry;
      }
      return next;
    });

    // quick visual flash
    gridRef.current?.api?.flashCells({ rowNodes: [e.node], columns: [e.column] });
  };

  const save = async () => {
    if (!selectedResource || !dirty) return;
    setLoading(true);
    setError(null);
    try {
      const body: CalendarPatchDto = { changesByDate: pending };
      await api.patch(`/api/calendar/${encodeURIComponent(String(selectedResource))}`, body);
      onNotify?.("Calendar saved", "success");
      // refetch to normalise client with DB
      const res = await api.get<CalendarRowDto[]>(
        `/api/calendar/${encodeURIComponent(String(selectedResource))}?from=${from}&to=${to}`
      );
      const data = (res.data || []).map((r) => ({
        date: r.dates,
        capacity: r.capacity ?? null,
        is_off: !!r.is_off,
        is_customised: !!r.is_customised,
      }));
      setRows(data);
      setPending({});
    } catch (e: any) {
      setError(e?.message || "Save failed");
      onNotify?.("Save failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const cancel = async () => {
    if (!selectedResource) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<CalendarRowDto[]>(
        `/api/calendar/${encodeURIComponent(String(selectedResource))}?from=${from}&to=${to}`
      );
      const data = (res.data || []).map((r) => ({
        date: r.dates,
        capacity: r.capacity ?? null,
        is_off: !!r.is_off,
        is_customised: !!r.is_customised,
      }));
      setRows(data);
      setPending({});
    } catch (e: any) {
      setError(e?.message || "Reload failed");
    } finally {
      setLoading(false);
    }
  };

  const setRangeThisWeek = () => {
    const r = thisWeek();
    setFrom(r.from);
    setTo(r.to);
  };
  const setRangeNext7 = () => {
    const r = next7Days();
    setFrom(r.from);
    setTo(r.to);
  };
  const setRangeNextWeek = () => {
    const r = nextWeek();
    setFrom(r.from);
    setTo(r.to);
  };
  const setRangeThisMonth = () => {
    const r = thisMonth();
    setFrom(r.from);
    setTo(r.to);
  };
  const setRangeAll = () => {
    const r = allRange();
    setFrom(r.from ?? "");
    setTo(r.to ?? "");
  };

  const onGridReady = (e: GridReadyEvent<RowModel>) => {
    e.api.sizeColumnsToFit();
  };

  const showEmptyHint = !selectedResource;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="card-header">
        <div className="font-medium text-slate-800">Selected Item — Calendar</div>
        <div className="flex items-center gap-2 text-sm">
          <button className="btn" onClick={setRangeThisWeek}>This week</button>
          <button className="btn" onClick={setRangeNext7}>Next 7</button>
          <button className="btn" onClick={setRangeNextWeek}>Next week</button>
          <button className="btn" onClick={setRangeThisMonth}>This month</button>
          <button className="btn-ghost" onClick={setRangeAll}>All</button>
          <div className="text-xs text-slate-500 ml-2">
            Range: {from || "—"} → {to || "—"}
          </div>
        </div>
      </div>

      {error && <div className="px-4 py-2 text-rose-700 bg-rose-50 border-t border-rose-200">{error}</div>}

      {/* Grid (always rendered so headers are visible even with no rows/selection) */}
      <div className="p-3 grow">
        <div className="ag-theme-alpine modern-ag h-full">
          <AgGridReact<RowModel>
            ref={gridRef as any}
            rowData={rows}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            animateRows
            editType="fullRow"
            readOnlyEdit={false}
            onCellEditRequest={onCellEditRequest}
            onGridReady={onGridReady}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          <button className="btn" onClick={save} disabled={!canWrite || !dirty || !selectedResource}>
            Save
          </button>
          <button className="btn-ghost" onClick={cancel} disabled={!dirty || !selectedResource}>
            Cancel
          </button>
          {loading && <span className="text-sm text-slate-500">Working…</span>}
        </div>

        {/* Hint */}
        {showEmptyHint && (
          <div className="mt-2 text-xs text-slate-500">
            Select a single resource from the Master grid to load its calendar.
          </div>
        )}
      </div>
    </div>
  );
}
