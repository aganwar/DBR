import React from "react";

/**
 * FilterBar
 * - Lives above the two cards, always visible
 * - Hosts the primary Funnel (opens FilterModal) and Clear Filter
 */
type Props = {
  onOpenFilter: () => void;
  onClearFilter: () => void;
  hasFilter: boolean;
};

export default function FilterBar({ onOpenFilter, onClearFilter, hasFilter }: Props) {
  return (
    <div className="mb-3">
      <div className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2">
        <div className="flex items-center justify-between gap-3">
          {/* Left-actions: Funnel + Clear */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              title="Open page filter"
              onClick={onOpenFilter}
              className="h-8 px-3 inline-flex items-center gap-2 rounded-md border text-slate-700 hover:bg-slate-50"
            >
              {/* funnel icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 5h18l-7 8v6l-4-2v-4L3 5z" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              <span className="text-sm">Filter</span>
            </button>

            <button
              type="button"
              title="Clear applied filter"
              onClick={onClearFilter}
              disabled={!hasFilter}
              className="h-8 px-3 inline-flex items-center gap-2 rounded-md border text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {/* eraser icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 15l7-7 9 9-3 3H7l-3-5zM11 8l5 5" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              <span className="text-sm">Clear filter</span>
            </button>
          </div>

          {/* Right spacer (future actions or info) */}
          <div className="text-xs text-slate-500">
            {/* empty for now; keeps layout balanced */}
          </div>
        </div>
      </div>
    </div>
  );
}
