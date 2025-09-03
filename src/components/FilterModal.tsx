// src/components/FilterModal.tsx
import React from "react";
import { api } from "../api";

type Props = {
  /** Whether the modal is visible */
  open: boolean;
  /** Initially selected groups when opening the modal */
  initial: string[];
  /** Called with selected groups when user clicks Apply */
  onApply: (groups: string[]) => void;
  /** Close the modal (called by X or after Apply/Clear) */
  onClose: () => void;
};

export default function FilterModal({ open, initial, onApply, onClose }: Props) {
  const [allGroups, setAllGroups] = React.useState<string[]>([]);
  const [selected, setSelected] = React.useState<Set<string>>(new Set(initial));
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Refetch groups each time the modal opens
  React.useEffect(() => {
    if (!open) return;
    setSelected(new Set(initial));
    setQuery("");
    setError(null);
    setLoading(true);
    api
      .get<string[]>("/api/resource-groups")
      .then((res) => {
        setAllGroups(res.data || []);
      })
      .catch((e: any) => setError(e?.message || String(e)))
      .finally(() => setLoading(false));
  }, [open, initial]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allGroups;
    return allGroups.filter((g) => g.toLowerCase().includes(q));
  }, [query, allGroups]);

  const toggle = (g: string) => {
    const next = new Set(selected);
    if (next.has(g)) next.delete(g);
    else next.add(g);
    setSelected(next);
  };

  const selectAll = () => setSelected(new Set(allGroups));
  const clearSelection = () => setSelected(new Set());

  const apply = () => {
    onApply(Array.from(selected));
    onClose();
  };

  // Important: Clear in the dialog means “no groups”
  const clearAndClose = () => {
    onApply([]); // explicit empty array, drives clearing Master + Calendar
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 w-[min(680px,96vw)] rounded-xl bg-white border border-slate-200 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h2 id="filter-title" className="text-base font-semibold text-slate-800">
            Filter — Resource Groups
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-4 pt-3 pb-4">
          {/* Controls row */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search groups…"
                className="h-9 w-[240px] rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
              <div className="pointer-events-none absolute right-2 top-2.5 text-slate-400">
                <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M11 19a8 8 0 100-16 8 8 0 000 16zm7 2l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200" />

            <button
              type="button"
              onClick={selectAll}
              className="h-9 px-3 rounded-md border text-sm text-slate-700 hover:bg-slate-50"
              disabled={loading || allGroups.length === 0}
              title="Select all groups"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="h-9 px-3 rounded-md border text-sm text-slate-700 hover:bg-slate-50"
              disabled={loading || selected.size === 0}
              title="Clear current selection"
            >
              Clear selection
            </button>
          </div>

          {/* Status / error */}
          {loading && <div className="text-sm text-slate-500">Loading groups…</div>}
          {error && <div className="text-sm text-rose-700">Error: {error}</div>}

          {/* List */}
          {!loading && !error && (
            <div className="max-h-[42vh] overflow-auto rounded-md border border-slate-200">
              {filtered.length === 0 ? (
                <div className="p-3 text-sm text-slate-500">No groups found.</div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {filtered.map((g) => {
                    const checked = selected.has(g);
                    return (
                      <li key={g} className="flex items-center gap-3 px-3 py-2">
                        <input
                          id={`chk-${g}`}
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(g)}
                          className="h-4 w-4 rounded border-slate-300"
                        />
                        <label htmlFor={`chk-${g}`} className="text-sm text-slate-800">
                          {g}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-slate-200">
          <div className="text-xs text-slate-500">
            {selected.size} selected {query ? `• filtered (${filtered.length})` : ""}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clearAndClose}
              className="h-9 px-3 rounded-md border text-sm text-slate-700 hover:bg-slate-50"
              title="Clear filter and close"
            >
              Clear filter
            </button>
            <button
              type="button"
              onClick={apply}
              className="h-9 px-3 rounded-md border text-sm text-white bg-slate-800 hover:bg-slate-900"
              disabled={loading}
              title="Apply selected groups"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
