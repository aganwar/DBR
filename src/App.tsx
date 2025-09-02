// src/App.tsx
import React from "react";
import "./index.css";

import Header from "./components/Header";
import ControlRail from "./components/ControlRail";
import MasterGrid from "./components/MasterGrid";
import CalendarGrid from "./components/CalendarGrid";
import { Toast, useToast } from "./components/Toast";

// Top-level: provide Toast context first, then render the actual app content.
export default function App() {
  return (
    <Toast>
      <AppContent />
    </Toast>
  );
}

function AppContent() {
  // Now it's safe to call the hook because we're inside <Toast>
  const toast = useToast();

  const [filterGroups, setFilterGroups] = React.useState<string[]>([]);
  const [selectedResource, setSelectedResource] = React.useState<string | null>(null);
  const [selectionCount, setSelectionCount] = React.useState(0);

  const canWrite = true; // plug in your real access control when ready

  const openFilter = () => {
    // If you have a FilterModal/FilterBar, open it here.
    // For now, just show a small feedback so we know the rail button works.
    toast.show("Open filter panel", { variant: "info" });
  };

  const handleMasterPatched = () => {
    // Called after master grid saves; keep for future refresh logic if needed
    toast.show("Saved", { variant: "success" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left control rail (funnel button lives here) */}
        <ControlRail onOpenFilter={openFilter} />

        {/* Content column */}
        <main className="flex-1 overflow-auto p-3">
          {/* Filter bar placeholder — keep space ready if you wire a bar later */}
          <div className="mb-3" />

          {/* Two-column layout: master (left ~35%) / calendar (right ~65%) */}
          <div className="grid grid-cols-12 gap-3 h-full">
            {/* Master grid */}
            <section className="col-span-12 lg:col-span-5 flex flex-col">
              <MasterGrid
                initialGroups={filterGroups}
                onSelectResource={setSelectedResource}
                onSelectionCount={setSelectionCount}
                onMasterPatched={handleMasterPatched}
                canWrite={canWrite}
              />
            </section>

            {/* Calendar grid */}
            <section className="col-span-12 lg:col-span-7 flex flex-col">
              <CalendarGrid
                selectedResource={selectedResource}
                onNotify={(m, v) => toast.show(m, { variant: v })}
                onDirty={(isDirty: boolean) => {
                  // you can surface “Unsaved changes” here if you like
                }}
              />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
