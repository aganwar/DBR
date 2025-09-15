// src/pages/ResourcePlannerPage.tsx
import React from "react";
import ControlRail from "../components/ControlRail";
import MasterGrid from "../components/MasterGrid";
import CalendarGrid from "../components/CalendarGrid";
import FilterModal from "../components/FilterModal";
import { useToast } from "../components/Toast";

export default function ResourcePlannerPage() {
  const toast = useToast();

  // Page state
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [filterGroups, setFilterGroups] = React.useState<string[]>([]);
  const [selectedResource, setSelectedResource] = React.useState<string | number | null>(null);
  const [selectionCount, setSelectionCount] = React.useState(0);

  const canWrite = true; // future: wire to auth/roles

  // Control rail (left) opens the filter modal
  const openFilter = () => setFilterOpen(true);

  // Apply/Clear from modal
  const applyGroups = (groups: string[]) => {
    // NOTE: empty [] means CLEAR filter → clear both grids
    setFilterGroups(groups);
    // Clearing selection on any filter change avoids stale calendars
    setSelectedResource(null);
    setSelectionCount(0);

    if (groups.length === 0) {
      toast.show("Filter cleared", { variant: "info" });
    } else {
      toast.show(`Filter applied (${groups.length} group${groups.length > 1 ? "s" : ""})`, {
        variant: "info",
      });
    }
  };

  const handleMasterPatched = () => {
    toast.show("Saved", { variant: "success" });
  };

  return (
    <>
      {/* Main area: left rail + content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left control rail (funnel) */}
        <ControlRail onOpenFilter={openFilter} />

        {/* Content column */}
        <div className="flex-1 overflow-auto p-3">
          {/* 12-col content grid: master (5) / calendar (7) */}
          <div className="grid grid-cols-12 gap-3 h-full">
            {/* Master grid (left) */}
            <section className="col-span-12 lg:col-span-5 flex flex-col">
              <div className="card flex-1 flex flex-col">
                <MasterGrid
                  initialGroups={filterGroups}
                  onSelectResource={setSelectedResource}
                  onSelectionCount={setSelectionCount}
                  onMasterPatched={handleMasterPatched}
                  canWrite={canWrite}
                />
              </div>
            </section>

            {/* Calendar grid (right) */}
            <section className="col-span-12 lg:col-span-7 flex flex-col">
              <div className="card flex-1 flex flex-col">
                <CalendarGrid
                  selectedResource={selectedResource}
                  onNotify={(m, v) => toast.show(m, { variant: v })}
                  onDirty={(isDirty: boolean) => {
                    // optional: surface "Unsaved changes" badge if you want
                  }}
                  canWrite={canWrite}
                />
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        open={filterOpen}
        initial={filterGroups}
        onApply={applyGroups}
        onClose={() => setFilterOpen(false)}
      />
    </>
  );
}