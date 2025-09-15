// src/components/ControlRail.tsx
import React from "react";

export interface ControlRailProps {
  /** Called when the funnel (page filter) control is activated */
  onOpenFilter: () => void;
  /** Optional: add more actions later (icons/buttons) */
  children?: React.ReactNode;
}

/**
 * Left-side vertical control rail.
 * - Hosts the global page filter "funnel" action.
 * - Keyboard accessible (Enter/Space).
 * - Keeps styling minimal and consistent with Tailwind utility classes used in the app.
 */
export default function ControlRail({ onOpenFilter, children }: ControlRailProps) {
  const onKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpenFilter();
    }
  };

  return (
    <aside
      className="hidden lg:flex flex-col items-center gap-3 w-12 shrink-0 py-3"
      aria-label="Page controls"
    >
      {/* Funnel / Filter trigger */}
      <button
        type="button"
        onClick={onOpenFilter}
        onKeyDown={onKeyDown}
        aria-label="Open filter"
        title="Open filter"
        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 active:bg-slate-100
                   dark:border-slate-700 dark:hover:bg-slate-800 dark:active:bg-slate-700
                   focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-sky-500"
      >
        {/* Funnel icon (inline SVG, no external icon deps) */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M3 5h18l-7 8v5l-4 2v-7L3 5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Additional controls (optional) */}
      {children}
    </aside>
  );
}
