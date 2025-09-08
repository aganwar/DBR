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
import { thisWeek, next7Days, nextWeek, thisMonth, allRange } from "../utils/dates";

type Props = {
  /** Selected resource id/code; when null we still render headers with no rows */
  selectedResource: string | number | null;
  /** Optional toast helper */
  onNotify?: (message: string, variant?: "success" | "info" | "error") => void;
  /** Let parent know if there are unsaved changes */
  onDirty?: (isDirty: boolean) => void;
  /** Access control */
  canWrite?: boolean;
};

type RowModel = {
  date: string; // yyyy-mm-dd
  capacity: number | null;
  is_off: boolean;
  is_customised: boolean;
};

type Pending = Record<
  string, // date key
  {
    capacity?: number | null;
    is_off?: boolean;
  }
>;

/** Per-cell validation errors for edited fields */
type Errors = Record<
  string, // date key
  Partial<Record<keyof RowModel, true>>
>;

export default function CalendarGrid({
  selectedResource,
  onNotify,
  onDirty,
  canWrite = true,
}: Props) {
  const gridRef = React.useRef<AgGridReact<RowModel>>(null);

  // Visible range
  const [from, setFrom] = React.useState(() => thisWeek().from);
  const [to, setTo] = React.useState(() => thisWeek().to);

  // Data + edit tracking
  const [rows, setRows] = React.useState<RowModel[]>([]);
  const [pending, setPending] = React.useState<Pending>({});
  const [errors, setErrors] = React.useState<Errors>({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const dirty = React.useMemo(() => Object.keys(pending).length > 0, [pending]);
  const hasErrors = React.useMemo(
    () => Object.values(errors).some((e) => e && Object.keys(e).length > 0),
    [errors]
  );
  React.useEffect(() => onDirty?.(dirty), [dirty, onDirty]);

  // Load whenever selection or range changes
  React.useEffect(() => {
    let alive = true;
    (async () => {
      if (!selectedResource) {
        setRows([]);
        setPending({});
        setErrors({});
        setError(null);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const res = await api.get<CalendarRowDto[]>(
          `/api/calendar/${encodeURIComponent(String(selectedResource))}?from=${from}&to=${to}`
        );
        if (!alive) return;
        const data: RowModel[] = (res.data || []).map((r) => ({
          date: r.dates,
          capacity: r.capacity ?? null,
          is_off: !!r.is_off,
          is_customised: !!r.is_customised,
        }));
        setRows(data);
        setPending({});
        setErrors({});
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Failed to load calendar");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [selectedResource, from, to]);

  // ----- Validation helpers -----
  function validate(field: keyof RowModel, value: any): boolean {
    if (field === "capacity") {
      // allow null/empty; else finite number >= 0
      if (value === "" || value == null) return true;
      if (typeof value === "number" && Number.isFinite(value) && value >= 0) return true;
      return false;
    }
    if (field === "is_off") return true; // boolean always valid
    return true;
  }

  function setErrorFlag(dateKey: string, field: keyof RowModel, invalid: boolean) {
    setErrors((prev) => {
      const next = { ...prev };
      const entry = { ...(next[dateKey] || {}) };
      if (invalid) entry[field] = true;
      else delete entry[field];
      if (Object.keys(entry).length === 0) delete next[dateKey];
      else next[dateKey] = entry;
      return next;
    });
  }

  // ----- Grid defs -----
  const defaultColDef: ColDef<RowModel> = React.useMemo(
    () => ({
      sortable: true,
      resizable: true,
      filter: true,
      editable: canWrite && !!selectedResource, // disable edits if no selection
      cellClass: (p: CellClassParams<RowModel>) => {
        const d = p.data?.date || "";
        const f = (p.colDef.field as keyof RowModel) || "capacity";
        const edited = !!pending[d]?.hasOwnProperty(f);
        const invalid = !!errors[d]?.[f];
        if (edited && invalid) return "bg-rose-50";      // edited + invalid → light red
        if (edited) return "bg-emerald-50";              // edited + valid   → light green
        return "";                                       // unchanged
      },
    }),
    [canWrite, selectedResource, pending, errors]
  );

  const colDefs = React.useMemo<ColDef<RowModel>[]>(() => {
    return [
      { field: "date", headerName: "Date", editable: false, width: 140 },
      {
        field: "capacity",
        headerName: "Capacity",
        type: "numericColumn",
        // Value parser isn’t strictly used with readOnlyEdit=true, but keeping it is harmless
        valueParser: (p: any) => {
          const v = String(p.newValue ?? "").trim();
          if (v === "") return null;
          const n = Number(v.replace(",", "."));
          return Number.isFinite(n) && n >= 0 ? n : p.oldValue ?? null;
        },
      },
      {
        field: "is_off",
        headerName: "Off day",
        cellRenderer: "agCheckboxCellRenderer",
        width: 120,
      },
      { field: "is_customised", headerName: "Customised", editable: false, width: 130 },
    ];
  }, []);

  // ----- Controlled editing (AG Grid) -----
  const onCellEditRequest = (e: CellEditRequestEvent<RowModel>) => {
    const { data, colDef, newValue, oldValue, node, column } = e;
    if (newValue === oldValue) return;

    const dateKey = data.date;
    const field = colDef.field as keyof RowModel;

    // Normalize values
    let nextVal: any = newValue;
    if (field === "capacity") {
      if (newValue === "" || newValue == null) nextVal = null;
      else {
        const n = Number(String(newValue).replace(",", "."));
        nextVal = Number.isFinite(n) && n >= 0 ? n : oldValue ?? null;
      }
    }
    if (field === "is_off") {
      nextVal = !!newValue;
    }

    // When toggling off-day ON, force capacity to 0 for that date
    let extra: Partial<RowModel> | undefined;
    if (field === "is_off" && nextVal === true) extra = { capacity: 0 };

    // Update visible rows
    setRows((prev) =>
      prev.map((r) =>
        r.date === dateKey ? { ...r, [field]: nextVal, ...(extra || {}) } : r
      )
    );

    // Track pending patch
    setPending((prev) => {
      const next = { ...prev };
      const entry = next[dateKey] ? { ...next[dateKey] } : {};
      if (field === "capacity") entry.capacity = nextVal as number | null;
      if (field === "is_off") entry.is_off = nextVal as boolean;
      if (extra && typeof extra.capacity !== "undefined") entry.capacity = extra.capacity;
      next[dateKey] = entry;
      return next;
    });

    // Validate edited field (and extra capacity change if any)
    const invalid = !validate(field, nextVal);
    setErrorFlag(dateKey, field, invalid);
    if (extra && typeof extra.capacity !== "undefined") {
      setErrorFlag(dateKey, "capacity", !validate("capacity", extra.capacity));
    }

    gridRef.current?.api?.flashCells({ rowNodes: [node], columns: [column] });
  };

  // ----- Save / Cancel -----
  const save = async () => {
    if (!selectedResource || !dirty || hasErrors) return;
    try {
      setLoading(true);
      setError(null);
      const body: CalendarPatchDto = { changesByDate: pending };
      await api.patch(`/api/calendar/${encodeURIComponent(String(selectedResource))}`, body);
      onNotify?.("Calendar saved", "success");

      // Refresh from server and clear feedback
      const res = await api.get<CalendarRowDto[]>(
        `/api/calendar/${encodeURIComponent(String(selectedResource))}?from=${from}&to=${to}`
      );
      const data: RowModel[] = (res.data || []).map((r) => ({
        date: r.dates,
        capacity: r.capacity ?? null,
        is_off: !!r.is_off,
        is_customised: !!r.is_customised,
      }));
      setRows(data);
      setPending({});
      setErrors({});
    } catch (e: any) {
      setError(e?.message || "Save failed");
      onNotify?.("Save failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const cancel = async () => {
    if (!selectedResource) {
      setPending({});
      setErrors({});
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<CalendarRowDto[]>(
        `/api/calendar/${encodeURIComponent(String(selectedResource))}?from=${from}&to=${to}`
      );
      const data: RowModel[] = (res.data || []).map((r) => ({
        date: r.dates,
        capacity: r.capacity ?? null,
        is_off: !!r.is_off,
        is_customised: !!r.is_customised,
      }));
      setRows(data);
      setPending({});
      setErrors({});
    } catch (e: any) {
      setError(e?.message || "Reload failed");
    } finally {
      setLoading(false);
    }
  };

  // Range helpers
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
      {/* Header (Save/Cancel at the top, consistent with Master) */}
      <div className="card-header">
        <div className="font-medium text-slate-800">Selected Item — Calendar</div>
        <div className="flex items-center gap-2 text-sm">
          <div className="text-xs text-slate-500 mr-2">
            Range: {from || "—"} → {to || "—"}
          </div>
          <button className="btn" onClick={setRangeThisWeek}>This week</button>
          <button className="btn" onClick={setRangeNext7}>Next 7</button>
          <button className="btn" onClick={setRangeNextWeek}>Next week</button>
          <button className="btn" onClick={setRangeThisMonth}>This month</button>
          <button className="btn-ghost" onClick={setRangeAll}>All</button>

          <div className="w-px h-5 bg-slate-200 mx-1" />

          <button
            className="btn"
            onClick={save}
            disabled={!canWrite || !dirty || hasErrors || !selectedResource}
            title={hasErrors ? "Fix invalid cells before saving" : "Save changes"}
          >
            Save
          </button>
          <button
            className="btn-ghost"
            onClick={cancel}
            disabled={!dirty || !selectedResource}
          >
            Cancel
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-2 text-rose-700 bg-rose-50 border-t border-rose-200">{error}</div>
      )}

      {/* Grid (headers visible even with no rows) */}
      <div className="p-3 grow">
        <div className="ag-theme-alpine modern-ag h-full">
          <AgGridReact<RowModel>
            ref={gridRef as any}
            theme="legacy"              /* keep CSS-file themes; avoids v33 theming clash */
            rowData={rows}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            animateRows
            editType="fullRow"
            readOnlyEdit={true}         /* REQUIRED for onCellEditRequest to fire */
            onCellEditRequest={onCellEditRequest}
            onGridReady={onGridReady}
          />
        </div>

        {/* Bottom hints / status */}
        {showEmptyHint && (
          <div className="mt-2 text-xs text-slate-500">
            Select a single resource from the Master grid to load its calendar.
          </div>
        )}
        {loading && <div className="text-sm text-slate-500 mt-2">Working…</div>}
      </div>
    </div>
  );
}
