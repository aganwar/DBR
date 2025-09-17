// src/App.tsx
import React from "react";
import "./index.css";

import Header from "./components/Header";
import ControlRail from "./components/ControlRail";
import MasterGrid from "./components/MasterGrid";
import CalendarGrid from "./components/CalendarGrid";
import PriorityListPage from "./components/PriorityListPage";
import UserManagementPage from "./components/UserManagementPage";
import LandingPage from "./components/LandingPage";
import FilterModal from "./components/FilterModal";
import { Toast, useToast } from "./components/Toast";
import { ThemeProvider } from "./contexts/ThemeContext";
import type { PageType } from "./types/navigation";

export default function App() {
  // Provide theme and toast context at the top
  return (
    <ThemeProvider>
      <Toast>
        <AppContent />
      </Toast>
    </ThemeProvider>
  );
}

function AppContent() {
  const toast = useToast();

  // Navigation state
  const [currentPage, setCurrentPage] = React.useState<PageType>('landing');

  // Update browser tab title based on current page
  React.useEffect(() => {
    const pageTitle =
      currentPage === 'landing' ? 'OCX-DBR AI | Intelligent Production Flow' :
      currentPage === 'priority-list' ? 'OCX-PriorityList' :
      currentPage === 'user-management' ? 'OCX-User Management' :
      'OCX-Schedule Resource';
    document.title = pageTitle;
  }, [currentPage]);

  // Resource Planner page state
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

  // Render page content based on current page
  const renderPageContent = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage />;

      case 'priority-list':
        return (
          <main className="flex-1 overflow-hidden p-3">
            <div className="h-full">
              <div className="card h-full flex flex-col">
                <PriorityListPage />
              </div>
            </div>
          </main>
        );

      case 'user-management':
        return (
          <main className="flex-1 overflow-hidden p-3">
            <div className="h-full">
              <div className="card h-full flex flex-col">
                <UserManagementPage />
              </div>
            </div>
          </main>
        );

      case 'resource-planner':
      default:
        return (
          <>
            {/* Left control rail (funnel) */}
            <ControlRail onOpenFilter={openFilter} />

            {/* Content column */}
            <main className="flex-1 overflow-auto p-3">
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
            </main>
          </>
        );
    }
  };

  // Landing page has header like other pages
  if (currentPage === 'landing') {
    return (
      <div className="min-h-screen flex flex-col bg-transparent">
        {/* Top header with icon + title */}
        <Header
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />

        {/* Landing page content */}
        <div className="flex-1">
          <LandingPage />
        </div>
      </div>
    );
  }

  // Other pages have the standard layout
  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      {/* Top header with icon + title */}
      <Header
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      {/* Main area: dynamic content based on current page */}
      <div className="flex flex-1 overflow-hidden">
        {renderPageContent()}
      </div>

      {/* Filter Modal - only for resource planner */}
      {currentPage === 'resource-planner' && (
        <FilterModal
          open={filterOpen}
          initial={filterGroups}
          onApply={applyGroups}
          onClose={() => setFilterOpen(false)}
        />
      )}
    </div>
  );
}
