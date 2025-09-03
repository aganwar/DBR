// src/components/CalendarGrid.tsx
import React from "react";
import { AgGridReact } from "ag-grid-react";
import type {
  CellClassParams,
  CellEditRequestEvent,
  ColDef,
  GridReadyEvent,
} from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import { api } from "../api";
import type { CalendarRowDto, CalendarPatchDto } from "../types";
import { thisWeek, next7Days, nextWeek, thisMonth, allRange } from "../utils/dates"; // exports used by CalendarGrid in repo
// Ranges & usage are consistent with prior changes. 

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

// Per-cell validation errors for edited fields
type Errors = Record<
  string, // yyyy-mm-dd
  Partial<Record<keyof RowModel, true>>
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

  // Data + pending + errors
  const [rows, setRows] = React.useState<RowModel[]>([]);
  const [pending, setPending] = React.useState<Pending>({});
  const [errors, setErrors] = React.useState<Errors>({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const dirty = React.useMemo(() => Object.keys(pending).length > 0, [pending]);
  const hasErrors = React.useMemo(() => {
    for (const d of Object.keys(errors)) if (errors[d] && Object.keys(errors[d]!).length) return true;
    return false;
  }, [errors]);

  React.useEffect(() => onDirty?.(dirty), [dirty, onDirty]);

  // Fetch rows whenever selection or range changes
  React.useEffect(() => {
    let alive = true;

    async function load() {
      // If nothing selected, show empty grid (headers visible)
      if (!selectedResource) {
        setRows([]);
        setPending({});
        setErrors({});
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
    }

    load();
    return () => {
      alive = false;
    };
  }, [selectedResource, from, to]);

  // ---------- Validation ----------
  function validateCell(field: keyof RowModel, value: any, row: RowModel): boolean {
    // return true => valid, false => invalid
    if (field === "capacity") {
      // capacity: allow null/empty; else finite number >= 0
      if (value == null || value === "") return true;
      if (typeof value === "number" && Number.isFinite(value) && value >= 0) return true;
      return false;
    }
    if (field === "is_off") {
      // boolean always valid
      return true;
    }
    return true;
  }

  function setErrorFlag(dateKey: string, field: keyof RowModel, invalid: boolean) {
    setErrors((prev) => {
      const next = { ...prev };
      const entry = { ...(next[dateKey] || {}) };
      if (invalid) {
        entry[field] = true;
      } else {
        delete entry[field];
      }
      if (Object.keys(entry).length === 0) delete next[dateKey];
      else next[dateKey] = entry;
      return next;
    });
  }

  // Grid wiring
  const defaultColDef: ColDef<RowModel> = React.useMemo(
    () => ({
      sortable: true,
      resizable: true,
      filter: true,
      editable: canWrite && !!selectedResource, // disable edits until a resource is selected
      cellClass: (p: CellClassParams<RowModel>) => {
        const d = p.data?.date || "";
        const f = (p.colDef.field as keyof RowModel) || "capacity";
        const edited = !!pending[d]?.hasOwnProperty(f as any);
        const invalid = !!errors[d]?.[f];
        // Feedback colors: green for edited+valid, red for edited+invalid
        if (edited && invalid) return "bg-rose-50";
        if (edited) return "bg-emerald-50";
        return "";
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
        valueParser: (p: any) => {
          // parse number or null; accept empty string as null
          const v = String(p.newValue ?? "").trim();
          if (v === "") return null;
          // tolerate locale comma -> dot
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

  // Apply an edit (AG Grid controlled-edit pattern)
  const onCellEditRequest = (e: CellEditRequestEvent<RowModel>) => {
    const { data, colDef, newValue, oldValue } = e;
    if (newValue === oldValue) return;

    const key = data.date;
    const field = colDef.field as keyof RowModel;
    let nextValue: any = newValue;

    // Cross-field behavior: when is_off toggled true -> capacity -> 0
    if (field === "is_off") {
      const boolVal = !!newValue;
      nextValue = boolVal;
    }

    if (field === "capacity") {
      // normalize capacity: null or >= 0 number
      if (newValue === "" || newValue == null) nextValue = null;
      else {
        const n = Number(String(newValue).replace(",", "."));
        nextValue = Number.isFinite(n) && n >= 0 ? n : oldValue ?? null;
      }
    }

    // If is_off becomes true, force capacity to 0 (visual + payload)
    let extraPatch: Partial<RowModel> | undefined;
    if (field === "is_off" && nextValue === true) {
      extraPatch = { capacity: 0 };
    }

    // Update visible rows
    setRows((prev) =>
      prev.map((r) => (r.date === key ? { ...r, [field]: nextValue, ...(extraPatch || {}) } : r))
    );

    // Track pending changes
    setPending((prev) => {
      const next = { ...prev };
      const entry = next[key] ? { ...next[key] } : {};
      entry[field === "capacity" ? "capacity" : field] = field === "capacity" ? (nextValue as number | null) : nextValue;
      if (extraPatch && typeof extraPatch.capacity !== "undefined") entry.capacity = extraPatch.capacity;
      next[key] = entry;
      return next;
    });

    // Validate edited cell (and extraPatch capacity if applied)
    const rowAfter = { ...data, [field]: nextValue, ...(extraPatch || {}) } as RowModel;
    const invalid = !validateCell(field, nextValue, rowAfter);
    setErrorFlag(key, field, invalid);
    if (extraPatch && typeof extraPatch.capacity !== "undefined") {
      const capInvalid = !validateCell("capacity", extraPatch.capacity, rowAfter);
      setErrorFlag(key, "capacity", capInvalid);
    }

    gridRef.current?.api?.flashCells({ rowNodes: [e.node], columns: [e.column] });
  };

  const save = async () => {
    if (!selectedResource || !dirty || hasErrors) return;
    setLoading(true);
    setError(null);
    try {
      const body: CalendarPatchDto = { changesByDate: pending };
      await api.patch(`/api/calendar/${encodeURIComponent(String(selectedResource))}`, body);
      onNotify?.("Calendar saved", "success");

      // Refresh and clear feedback
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
    setLoading(true);
    setError(null);
    try {
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
      {/* Header with actions (Save/Cancel on top, like Master) */}
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

      {/* Grid (always rendered so headers visible even with no rows/selection) */}
      <div className="p-3 grow">
        <div className="ag-theme-alpine modern-ag h-full">
          <AgGridReact<RowModel>
            ref={gridRef as any}
            theme="legacy"  /* using CSS file themes (avoids v33 theming conflict) */
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

        {/* Hint */}
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
