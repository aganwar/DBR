import React from "react";
import { api } from "../api";

type Props = {
  open: boolean;
  /** Currently applied groups (from App). Used to seed selection on open. */
  initial: string[];
  /** Called with the final selection when user clicks Apply. */
  onApply: (groups: string[]) => void;
  /** Close without changing selection. */
  onClose: () => void;
};

export default function FilterModal({ open, initial, onApply, onClose }: Props) {
  const [allGroups, setAllGroups] = React.useState<string[]>([]);
  const [working, setWorking] = React.useState<boolean>(false);
  const [err, setErr] = React.useState<string | null>(null);

  // selection the user is editing inside the modal
  const [selected, setSelected] = React.useState<string[]>([]);
  const [query, setQuery] = React.useState<string>("");

  // reconcile selected with incoming initial + fetched allGroups
  React.useEffect(() => {
    if (!open) return;
    let alive = true;

    (async () => {
      try {
        setWorking(true);
        setErr(null);
        // always fetch fresh on open, so new resources appear
        const res = await api.get<string[]>("/api/resource-groups");
        const fresh = res.data ?? [];
        if (!alive) return;

        setAllGroups(fresh);

        // If nothing applied yet -> default to "all"
        const base = initial && initial.length ? initial : fresh;

        // Reconcile: keep only groups that still exist
        const reconciled = base.filter(g => fresh.includes(g));
        setSelected(reconciled);
      } catch (e: any) {
        setErr(e?.message || "Failed to load resource groups");
        // still seed selection from initial in case of network issues
        setSelected(initial ?? []);
        setAllGroups(prev => prev.length ? prev : []);
      } finally {
        if (!alive) return;
        setWorking(false);
      }
    })();

    return () => { alive = false; };
  }, [open, initial]);

  // keyboard shortcuts: Esc closes, Enter applies
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        onApply(selected);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, selected, onApply, onClose]);

  if (!open) return null;

  const toggle = (g: string, checked: boolean) => {
    setSelected(prev => {
      if (checked) return prev.includes(g) ? prev : [...prev, g];
      return prev.filter(x => x !== g);
    });
  };

  const selectAll = () => setSelected([...allGroups]);
  const clearAll = () => setSelected([]);

  const visible = query.trim()
    ? allGroups.filter(g => g.toLowerCase().includes(query.trim().toLowerCase()))
    : allGroups;

  return (
    <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm">
      <div className="absolute inset-0 flex items-start justify-center pt-20 px-3">
        <div className="w-[760px] max-w-[96vw] rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3 border-b bg-gradient-to-b from-white to-slate-50 flex items-center justify-between">
            <div className="font-medium text-slate-800">Choose Resource Groups</div>
            <button className="btn-ghost" onClick={onClose} title="Close">Close</button>
          </div>

          {/* Body */}
          <div className="px-5 py-4">
            {/* Actions row */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <button className="btn" onClick={selectAll}>Select all</button>
              <button className="btn" onClick={clearAll}>Clear</button>
              <div className="text-xs text-slate-500 ml-1">
                {selected.length} / {allGroups.length} selected
              </div>

              <div className="ml-auto">
                <input
                  aria-label="Search resource groups"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-8 px-3 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  placeholder="Search…"
                  disabled={working}
                />
              </div>
            </div>

            {/* Errors / loading */}
            {err && (
              <div className="text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded mb-3">
                {err}
              </div>
            )}
            {working && (
              <div className="text-sm text-slate-500 mb-2">Loading…</div>
            )}

            {/* Checkbox list */}
            <div className="border rounded-xl overflow-hidden">
              <div className="max-h-[50vh] overflow-auto divide-y">
                {visible.length === 0 ? (
                  <div className="px-4 py-8 text-sm text-slate-500">No resource groups.</div>
                ) : visible.map(g => {
                  const checked = selected.includes(g);
                  return (
                    <label
                      key={g}
                      className={`flex items-center gap-3 px-4 py-2 cursor-pointer ${
                        checked ? "bg-indigo-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="accent-indigo-600"
                        checked={checked}
                        onChange={(e) => toggle(g, e.target.checked)}
                      />
                      <span className="text-sm text-slate-800">{g}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t bg-gradient-to-t from-white to-slate-50 flex items-center justify-end gap-2">
            <button className="btn" onClick={onClose}>Cancel</button>
            <button
              className="btn-solid"
              onClick={() => onApply(selected)}
              disabled={working}
            >
              Apply filter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
