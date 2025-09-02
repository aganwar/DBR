import React from "react";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  CellEditingStoppedEvent,
  GridApi,
  ColumnApi,
} from "ag-grid-community";
import { api } from "../api";
import type { CalendarRowDto } from "../types";
import {
  startOfThisWeek,
  endOfThisWeek,
  addDays,
  formatYMD,
} from "../utils/dates";

type Props = {
  selectedResource: string | null; // resource_group from MasterGrid
  onNotify?: (msg: string, kind?: "ok" | "err") => void;
  onDirty?: (dirty: boolean) => void; // page-level Save/Cancel enablement
  canWrite?: boolean;
};

type PendingMap = Record<string, Partial<CalendarRowDto>>;

export default function CalendarGrid({
  selectedResource,
  onNotify,
  onDirty,
  canWrite = true,
}: Props) {
  const [rows, setRows] = React.useState<CalendarRowDto[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState<PendingMap>({});
  const [from, setFrom] = React.useState<Date>(startOfThisWeek(new Date()));
  const [to, setTo] = React.useState<Date>(endOfThisWeek(new Date()));

  const gridRef = React.useRef<AgGridReact<CalendarRowDto>>(null);
  const gridApi = React.useRef<GridApi | null>(null);
  const colApi = React.useRef<ColumnApi | null>(null);

  // keep parent informed about dirty state
  React.useEffect(() => {
    onDirty?.(Object.keys(pending).length > 0);
  }, [pending, onDirty]);

  const fetchCalendar = React.useCallback(async () => {
    setError(null);
    setRows([]);
    if (!selectedResource) return;

    setLoading(true);
    try {
      const url = `/api/calendar/${encodeURIComponent(
        selectedResource
      )}?from=${formatYMD(from)}&to=${formatYMD(to)}`;
      const res = await api.get<CalendarRowDto[]>(url);
      setRows(res.data);
      setPending({});
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [selectedResource, from, to]);

  React.useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  // range presets
  const setWeek = (offsetWeeks: number) => {
    const base = new Date();
    const start = startOfThisWeek(addDays(base, offsetWeeks * 7));
    const end = endOfThisWeek(addDays(base, offsetWeeks * 7));
    setFrom(start);
    setTo(end);
  };
  const setNext7 = () => {
    const s = new Date();
    const e = addDays(s, 6);
    setFrom(s);
    setTo(e);
  };
  const setMonth = () => {
    const s = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const e = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    setFrom(s);
    setTo(e);
  };

  // track per-cell pending changes
  const markPending = (
    dateYmd: string,
    key: keyof CalendarRowDto,
    value: any
  ) => {
    setPending((prev) => ({
      ...prev,
      [dateYmd]: { ...(prev[dateYmd] || {}), [key]: value },
    }));
  };

  const onCellEditingStopped = (
    e: CellEditingStoppedEvent<CalendarRowDto>
  ) => {
    if (!canWrite) return;
    const ymd = e.data!.dates;
    if (e.colDef.field !== "capacity" && e.colDef.field !== "is_off") return;

    // if is_off toggled true => capacity should show 0 (read-only handled by colDef)
    if (e.colDef.field === "is_off") {
      const nextIsOff = !!e.value;
      if (nextIsOff) {
        e.node.setDataValue("capacity", 0);
        markPending(ymd, "capacity", 0);
      }
      markPending(ymd, "is_off", nextIsOff);
    } else if (e.colDef.field === "capacity") {
      const raw = e.value;
      let parsed: number | null = null;
      if (raw === "" || raw == null) parsed = null;
      else {
        const n = Number(String(raw).replace(",", ".")); // locale tolerant
        parsed = Number.isFinite(n) ? n : null;
      }
      // if capacity 0 => backend marks is_customised and is_off=true
      if (parsed === 0) markPending(ymd, "is_off", true);
      markPending(ymd, "capacity", parsed);
    }

    e.api.flashCells({ rowNodes: [e.node], columns: [e.column] });
  };

  // Save all pending changes
  const saveAll = async () => {
    if (!Object.keys(pending).length) return;
    try {
      const payload = Object.entries(pending).map(([date, patch]) => ({
        dates: date,
        ...patch,
      }));
      await api.post("/api/calendar/save", payload);
      setPending({});
      onNotify?.("Calendar saved", "ok");
      await fetchCalendar();
    } catch (e: any) {
      onNotify?.(e.message || "Failed to save calendar", "err");
    }
  };

  const cancelAll = async () => {
    setPending({});
    await fetchCalendar();
    onNotify?.("Calendar changes cancelled", "ok");
  };

  // columns
  const colDefs = React.useMemo<ColDef<CalendarRowDto>[]>(() => {
    return [
      {
        headerName: "Date",
        field: "dates",
        filter: "agDateColumnFilter",
        width: 130,
        editable: false,
      },
      {
        headerName: "Is Off",
        field: "is_off",
        width: 110,
        editable: canWrite,
        cellEditor: "agCheckboxCellEditor",
        cellClass: (p) =>
          pending[p.data.dates]?.hasOwnProperty("is_off") ? "cell-edited" : "",
      },
      {
        headerName: "Capacity",
        field: "capacity",
        width: 140,
        editable: (p) => canWrite && !p.data.is_off, // if day is off, disable editing capacity
        filter: "agNumberColumnFilter",
        valueParser: (p) => {
          if (p.newValue === "" || p.newValue == null) return null;
          const n = Number(String(p.newValue).replace(",", "."));
          return Number.isNaN(n) ? p.oldValue : n;
        },
        cellClass: (p) =>
          pending[p.data.dates]?.hasOwnProperty("capacity")
            ? "cell-edited"
            : "",
      },
      {
        headerName: "Customised",
        field: "is_customised",
        width: 130,
        editable: false,
      },
    ];
  }, [canWrite, pending]);

  const defaultColDef = React.useMemo<ColDef>(() => {
    return { sortable: true, resizable: true, filter: true, flex: 1 };
  }, []);

  const onGridReady = (e: any) => {
    gridApi.current = e.api;
    colApi.current = e.columnApi;
  };

  // grid height: master and calendar equal heights, internal scroll, sensible min
  const [gridHeight, setGridHeight] = React.useState<number>(480);
  React.useEffect(() => {
    const compute = () => {
      // Header (64) + outer paddings/margins allowance (~48)
      const used = 64 + 48;
      const h = Math.max(960, window.innerHeight - used); // ensure enough to split
      setGridHeight(Math.max(480, Math.floor(h / 2)));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  return (
    <div className="card h-full">
      <div className="card-header">
        <div className="font-medium text-slate-800">Selected Item (Calendar)</div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-slate-500">
            {formatYMD(from)} – {formatYMD(to)}
          </div>
          <div className="h-5 w-px bg-slate-300" />
          <button className="btn" onClick={() => setWeek(0)}>
            This week
          </button>
          <button className="btn" onClick={() => setNext7()}>
            Next 7 days
          </button>
          <button className="btn" onClick={() => setWeek(1)}>
            Next week
          </button>
          <button className="btn" onClick={() => setMonth()}>
            This month
          </button>
          <div className="h-5 w-px bg-slate-300" />
          <button
            className="btn-solid disabled"
            onClick={saveAll}
            disabled={!canWrite || !Object.keys(pending).length}
          >
            Save
          </button>
          <button
            className="btn"
            onClick={cancelAll}
            disabled={!Object.keys(pending).length}
          >
            Cancel
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-2 text-rose-700 bg-rose-50 border-t border-rose-200">
          {error}
        </div>
      )}

      <div className="p-3">
        <div
          className="ag-theme-quartz w-full"
          style={{ height: gridHeight, minHeight: 480 }}
        >
          <AgGridReact<CalendarRowDto>
            ref={gridRef as any}
            rowData={rows}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            animateRows
            rowSelection={{ mode: "singleRow" }}
            onCellEditingStopped={onCellEditingStopped}
            onGridReady={onGridReady}
          />
        </div>
        {loading && (
          <div className="text-sm text-slate-500 mt-2">Working…</div>
        )}
        {!selectedResource && (
          <div className="text-sm text-slate-500 mt-2">
            Select a resource to view its calendar.
          </div>
        )}
      </div>
    </div>
  );
}
