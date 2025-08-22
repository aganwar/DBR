import React from "react";
import { Filter } from "lucide-react";

interface ControlRailProps {
  onOpenFilter: () => void;
}

export default function ControlRail({ onOpenFilter }: ControlRailProps) {
  return (
    <aside className="w-[48px] bg-slate-50 border-r border-slate-200 flex flex-col items-center py-3">
      {/* Funnel (filter) button */}
      <button
        title="Page Filter"
        onClick={onOpenFilter}
        className="w-8 h-8 grid place-items-center rounded-md border text-slate-600 hover:bg-slate-100"
      >
        <Filter size={16} strokeWidth={1.6} />
      </button>
    </aside>
  );
}
