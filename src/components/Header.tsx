// src/components/Header.tsx
import React from "react";

/**
 * Header
 *
 * Left-aligned DBR logo + product title
 * Compact, sober B2B styling
 * Room on the right for future indicators
 */
export default function Header() {
  return (
    <header className="w-full bg-white border-b border-slate-200">
      <div className="px-3 md:px-4 h-[64px] flex items-center justify-between">
        {/* Left: logo + title */}
        <div className="flex items-center gap-3">
          {/* Logo (replace src with your actual logo path if different) */}
          <img
            src="/logo.svg"
            alt="DBR"
            className="h-8 w-auto object-contain"
            onError={(e) => {
              // fallback to text if logo missing
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = "none";
              const sib = target.nextElementSibling as HTMLElement | null;
              if (sib) sib.style.display = "inline-flex";
            }}
          />
          {/* Text fallback if logo not present */}
          <span className="hidden text-slate-900 font-semibold text-lg">
            DBR
          </span>

          <div className="h-6 w-px bg-slate-200 mx-1" />

          <div className="leading-tight">
            <div className="text-slate-900 font-semibold text-[15px]">
              DBR-AI
            </div>
            <div className="text-slate-500 text-[12px]">Resource Planner</div>
          </div>
        </div>

        {/* Right: reserved for future status / user menu */}
        <div className="flex items-center gap-3" />
      </div>
    </header>
  );
}
