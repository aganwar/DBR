// src/App.tsx
import React from "react";
import "./index.css";

import Header from "./components/Header";
import ControlRail from "./components/ControlRail";
import MasterGrid from "./components/MasterGrid";
import CalendarGrid from "./components/CalendarGrid";
import { Toast, useToast } from "./components/Toast";
import type { ResourceDto } from "./components/MasterGrid";

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

  const [selectedResource, setSelectedResource] = React.useState<string | null>(null);
  const [selectionCount, setSelectionCount] = React.useState(0);

  // Open filter rail action (funnel button)
  const openFilter = () => {
    // If you have a FilterModal/FilterBar, open it here.
    toast.show("Open filter panel", { variant: "info" });
  };

  // Map MasterGrid selection -> CalendarGrid selectedResource
  const handleSelectionChange = (rows: ResourceDto[]) => {
    setSelectionCount(rows.length);
    setSelectedResource(rows[0]?.resourceGroup ?? null);
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
          {/* Space for a future filter bar */}
          <div className="mb-3" />

          {/* Two-column layout: master (left ~35%) / calendar (right ~65%) */}
          <div className="grid grid-cols-12 gap-3 h-full">
            {/* Master grid */}
            <section className="col-span-12 lg:col-span-5 flex flex-col">
              <MasterGrid onSelectionChange={handleSelectionChange} />
              {/* You can surface selectionCount somewhere if you want */}
              {selectionCount > 0 && (
                <div className="text-xs text-slate-500 mt-2">
                  Selected: {selectionCount}
                </div>
              )}
            </section>

            {/* Calendar grid */}
            <section className="col-span-12 lg:col-span-7 flex flex-col">
              <CalendarGrid
                selectedResource={selectedResource}
                onNotify={(m, v) => toast.show(m, { variant: v })}
                onDirty={(isDirty: boolean) => {
                  // If you want, show an "Unsaved changes" badge somewhere.
                }}
              />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
