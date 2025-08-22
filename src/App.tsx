import React from "react";
import Header from "./components/Header";
import FilterBar from "./components/FilterBar";
import FilterModal from "./components/FilterModal";
import MasterGrid from "./components/MasterGrid";
import CalendarGrid from "./components/CalendarGrid";
import Toast from "./components/Toast";
import { api } from "./api";

/** Small hook to keep both grids in sync height-wise */
function useGridHeight(offset: number = 220) {
  const [h, setH] = React.useState(() => Math.max(480, window.innerHeight - offset));
  React.useEffect(() => {
    const onResize = () => setH(Math.max(480, window.innerHeight - offset));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [offset]);
  return h;
}

export default function App() {
  // Page filter (resource groups) state
  const [groups, setGroups] = React.useState<string[]>([]);
  const [filterOpen, setFilterOpen] = React.useState(false);

  // Selection state coming from Master grid
  const [selectedResource, setSelectedResource] = React.useState<string | null>(null);
  const [selectionCount, setSelectionCount] = React.useState(0);

  // Toast state
  const [toast, setToast] = React.useState<{ id: number; text: string } | null>(null);
  const pushToast = (text: string) => {
    const id = Date.now();
    setToast({ id, text });
    setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 1600);
  };

  // Keep both grids visually aligned
  const gridHeight = useGridHeight(210); // header + paddings

  // When page filter is applied
  const applyGroups = (gs: string[]) => {
    setGroups(gs);
    setSelectedResource(null); // reset calendar until user selects 1 resource
    setFilterOpen(false);
  };

  // Clear page filter quickly
  const clearPageFilter = () => applyGroups([]);

  // Optional: ping API once to ensure backend is reachable (keeps “online” dot accurate in your header)
  React.useEffect(() => {
    api.get("/api/resources?groups=").catch(() => {
      // ignore; the header "online" indicator uses your existing logic
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top bar */}
      <Header />

      {/* Filter hint row */}
      <div className="px-4 md:px-6">
        <div className="text-[12px] text-slate-500 mt-2 mb-3 flex items-center justify-between">
          <div>
            <span className="font-medium text-slate-600">Filter Results</span>
            <span className="mx-2">•</span>
            <span>Use the funnel to choose resource groups. The calendar shows only when a single resource is selected.</span>
          </div>
          <div className="text-slate-400">
            {groups.length === 0 ? "No filter applied" : `${groups.length} group(s)`}
          </div>
        </div>
      </div>

      {/* Main content: two columns */}
      <div className="px-4 md:px-6 pb-6">
        {/* Filter bar (contains the main Funnel) */}
        <FilterBar
          onOpenFilter={() => setFilterOpen(true)}
          onClearFilter={clearPageFilter}
          hasFilter={groups.length > 0}
        />

        <div className="grid grid-cols-12 gap-4">
          {/* Left: Master grid card */}
          <div className="col-span-12 lg:col-span-4">
            <div className="card">
              <div className="card-header">
                <div className="font-medium text-slate-800">Filter Results</div>
                {/* The secondary quick info lives on the right */}
                <div className="text-xs text-slate-500">
                  {selectionCount > 1 ? `${selectionCount} selected` : selectedResource || "—"}
                </div>
              </div>
              <div className="p-3">
                <div className="ag-theme-alpine modern-ag" style={{ height: gridHeight }}>
                  <MasterGrid
                    initialGroups={groups}
                    onSelectResource={(id) => setSelectedResource(id)}
                    onSelectionCount={(n) => setSelectionCount(n)}
                    onMasterPatched={() => pushToast("Master saved ✓")}
                    canWrite={true}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Calendar grid card */}
          <div className="col-span-12 lg:col-span-8">
            <div className="card">
              <div className="card-header">
                <div className="font-medium text-slate-800">Selected Item — Calendar</div>
                <div className="text-xs text-slate-500">
                  {selectedResource ? `Resource: ${selectedResource}` : "Select a single resource to view its calendar."}
                </div>
              </div>
              <div className="p-3">
                <div className="ag-theme-alpine modern-ag" style={{ height: gridHeight }}>
                  <CalendarGrid
                    resource={selectedResource}
                    onPatched={() => pushToast("Calendar saved ✓")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global toast */}
      {toast && <Toast>{toast.text}</Toast>}

      {/* Page Filter Modal */}
      <FilterModal
        open={filterOpen}
        initial={groups}
        onApply={applyGroups}
        onClose={() => setFilterOpen(false)}
      />
    </div>
  );
}
