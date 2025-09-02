import React from "react";

type Props = {
  onOpenFilter: () => void;
};

export default function ControlRail({ onOpenFilter }: Props) {
  return (
    <aside className="w-[48px] bg-slate-50 border-r border-slate-200 flex flex-col items-center py-3">
      <button
        title="Filter (F)"
        onClick={onOpenFilter}
        className="w-7 h-7 grid place-items-center rounded-md border text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300"
      >
        {/* Inline funnel icon (14x14) */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 5h18l-7 8v6l-4-2v-4L3 5z" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>
    </aside>
  );
}
