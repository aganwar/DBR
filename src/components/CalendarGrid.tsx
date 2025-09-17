// src/components/CalendarGrid.tsx
import React from "react";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  CellClassParams,
  CellEditRequestEvent,
  GridReadyEvent,
} from "ag-grid-community";

import { api } from "../api";
import type { CalendarRowDto, CalendarPatchDto } from "../types";
import { thisWeek, next7Days, nextWeek, thisMonth, allRange } from "../utils/dates";

type Props = {
  selectedResource: string | number | null;
  onNotify?: (message: string, variant?: "success" | "info" | "error") => void;
  onDirty?: (isDirty: boolean) => void;
  canWrite?: boolean;
};

type RowModel = {
  date: string; // yyyy-mm-dd
  capacity: number | null;
  is_off: boolean;
  is_customised: boolean;
};

type Pending = Record<string, { capacity?: number | null; is_off?: boolean }>;
type Errors = Record<string, Partial<Record<keyof RowModel, true>>>;

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
      // Also handle string numbers
      const num = Number(value);
      if (typeof value === "string" && !isNaN(num) && Number.isFinite(num) && num >= 0) return true;
      return false;
    }
    if (field === "is_off") return true;
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

  // ----- Cell class helper for individual fields -----
  const getCellClass = React.useCallback((p: CellClassParams<RowModel>) => {
    const d = p.data?.date || "";
    const f = p.colDef.field as keyof RowModel;

    // Check if this specific field was edited
    const edited = f === "capacity" ?
      (pending[d] && "capacity" in pending[d]) :
      f === "is_off" ?
        (pending[d] && "is_off" in pending[d]) :
        false;

    const invalid = !!errors[d]?.[f];

    if (edited && invalid) {
      console.log(`CalendarGrid: Applied bg-rose-50 to cell ${d}-${f}`);
      return "bg-rose-50";  // edited + invalid → light red
    }
    if (edited) {
      console.log(`CalendarGrid: Applied bg-emerald-50 to cell ${d}-${f}`);
      return "bg-emerald-50";          // edited + valid   → light green
    }
    return "";
  }, [pending, errors]);

  // ----- Grid defs -----
  const defaultColDef: ColDef<RowModel> = React.useMemo(
    () => ({
      sortable: true,
      resizable: true,
      filter: true,
      editable: canWrite && !!selectedResource, // disable edits if no selection
    }),
    [canWrite, selectedResource]
  );

  const colDefs = React.useMemo<ColDef<RowModel>[]>(() => {
    return [
      { field: "date", headerName: "Date", editable: false, width: 140, headerTooltip: "Date - The calendar date for this capacity entry" },
      {
        field: "capacity",
        headerName: "Capacity",
        type: "numericColumn",
        cellClass: getCellClass,
        headerTooltip: "Capacity - Available production capacity for this date (units per day)",
        valueParser: (p: any) => {
          const v = String(p.newValue ?? "").trim();
          if (v === "") return null;
          const n = Number(v.replace(",", "."));
          // Return the parsed value even if invalid - let validation handle it
          return Number.isFinite(n) ? n : p.newValue;
        },
      },
      {
        field: "is_off",
        headerName: "Off day",
        cellRenderer: "agCheckboxCellRenderer",
        cellClass: getCellClass,
        width: 120,
        headerTooltip: "Off Day - Whether this date is marked as a non-working day (capacity will be set to 0)"
      },
      { field: "is_customised", headerName: "Customised", editable: false, width: 130, headerTooltip: "Customised - Indicates if this date's capacity has been manually customized from default values" },
    ];
  }, [getCellClass]);

  // ----- Controlled editing (AG Grid) -----
  const onCellEditRequest = (e: CellEditRequestEvent<RowModel>) => {
    const { data, colDef, newValue, oldValue, node, column } = e;
    if (newValue === oldValue) return;

    const dateKey = data.date;
    const field = colDef.field as keyof RowModel;

    // Normalize values - but don't auto-correct invalid values, let them pass for validation
    let nextVal: any = newValue;
    if (field === "capacity") {
      if (newValue === "" || newValue == null) {
        nextVal = null;
      } else {
        const n = Number(String(newValue).replace(",", "."));
        nextVal = Number.isFinite(n) ? n : newValue; // Keep original value if invalid
      }
    }
    if (field === "is_off") nextVal = !!newValue;

    // Handle bidirectional logic between is_off and capacity
    let extra: Partial<RowModel> | undefined;

    if (field === "is_off") {
      if (nextVal === true) {
        // If turning off-day ON, force capacity 0
        extra = { capacity: 0 };
      }
      // If turning off-day OFF, don't auto-change capacity (user might want specific value)
    }

    if (field === "capacity") {
      if (nextVal === 0 || nextVal === "0") {
        // If capacity is set to 0, turn on is_off flag
        extra = { is_off: true };
      } else if (typeof nextVal === "number" && nextVal > 0) {
        // If capacity is positive, turn off is_off flag
        extra = { is_off: false };
      }
      // If capacity is null/empty or invalid, don't change is_off flag
    }

    // Update visible rows
    setRows((prev) =>
      prev.map((r) =>
        r.date === dateKey ? { ...r, [field]: nextVal, ...(extra || {}) } : r
      )
    );

    // Track pending change
    setPending((prev) => {
      const next = { ...prev };
      const entry = next[dateKey] ? { ...next[dateKey] } : {};
      if (field === "capacity") entry.capacity = nextVal as number | null;
      if (field === "is_off") entry.is_off = nextVal as boolean;

      // Handle extra fields from bidirectional logic
      if (extra) {
        if (typeof extra.capacity !== "undefined") entry.capacity = extra.capacity;
        if (typeof extra.is_off !== "undefined") entry.is_off = extra.is_off;
      }

      next[dateKey] = entry;
      return next;
    });

    // Validate edited cell(s)
    setErrorFlag(dateKey, field, !validate(field, nextVal));

    // Validate extra fields from bidirectional logic
    if (extra) {
      if (typeof extra.capacity !== "undefined") {
        setErrorFlag(dateKey, "capacity", !validate("capacity", extra.capacity));
      }
      if (typeof extra.is_off !== "undefined") {
        setErrorFlag(dateKey, "is_off", !validate("is_off", extra.is_off));
      }
    }

    // Force cell refresh to update visual feedback
    setTimeout(() => {
      const affectedColumns = [e.column];

      // If bidirectional logic affected other fields, refresh those columns too
      if (extra) {
        if (typeof extra.capacity !== "undefined") {
          const capacityCol = gridRef.current?.api?.getColumnDef("capacity");
          if (capacityCol) affectedColumns.push(capacityCol as any);
        }
        if (typeof extra.is_off !== "undefined") {
          const isOffCol = gridRef.current?.api?.getColumnDef("is_off");
          if (isOffCol) affectedColumns.push(isOffCol as any);
        }
      }

      gridRef.current?.api?.refreshCells({ rowNodes: [e.node], columns: affectedColumns, force: true });
    }, 0);
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

      // Refresh & clear feedback
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

  /** Cancel is ALWAYS enabled: refresh rows, keep selection & range, drop edits/errors */
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
      {/* Header matching MasterGrid height */}
      <div className="card-header">
        <div className="flex items-center gap-3">
          <div className="font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">Selected Item</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
            {from || "—"} → {to || "—"}
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <button className="btn whitespace-nowrap text-xs px-2 py-1" onClick={setRangeThisWeek}>Week</button>
          <button className="btn whitespace-nowrap text-xs px-2 py-1" onClick={setRangeNext7}>+7</button>
          <button className="btn whitespace-nowrap text-xs px-2 py-1" onClick={setRangeNextWeek}>Next</button>
          <button className="btn whitespace-nowrap text-xs px-2 py-1" onClick={setRangeThisMonth}>Month</button>
          <button className="btn-ghost whitespace-nowrap text-xs px-2 py-1" onClick={setRangeAll}>All</button>

          <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" />

          <button
            className="btn-solid text-xs"
            onClick={save}
            disabled={!canWrite || !dirty || hasErrors || !selectedResource}
            title={hasErrors ? "Fix invalid cells before saving" : "Save changes"}
          >
            Save ({Object.keys(pending).length})
          </button>
          <button
            className="btn text-xs"
            onClick={cancel}
          >
            Cancel ({Object.keys(pending).length})
          </button>

          <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" />

          <button
            onClick={() => {
              if (gridRef.current?.api) {
                gridRef.current.api.exportDataAsCsv({
                  fileName: `calendar-${selectedResource || 'data'}-${new Date().toISOString().split('T')[0]}.csv`,
                  columnKeys: colDefs.map(col => col.field).filter(field => field !== undefined) as string[]
                });
              }
            }}
            disabled={rows.length === 0 || !selectedResource}
            className="btn text-xs"
            title="Export calendar data to CSV"
          >
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-2 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/30 border-t border-rose-200 dark:border-rose-700">{error}</div>
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
            readOnlyEdit={true}         /* required for onCellEditRequest */
            onCellEditRequest={onCellEditRequest}
            onGridReady={onGridReady}
          />
        </div>

        {/* Hint */}
        {showEmptyHint && (
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            
          </div>
        )}

        {loading && <div className="text-sm text-slate-500 dark:text-slate-400 mt-2">Working…</div>}
      </div>
    </div>
  );
}
