// src/components/Header.tsx
import React, { useState, useEffect } from "react";
import HelpDropdown from "./HelpDropdown";
import HelpGuide from "./HelpGuide";
import IconOptions from "./IconOptions";
import IconGenerator from "./IconGenerator";
import { updateFavicon } from "../utils/iconUtils";

/**
 * Header
 *
 * Left-aligned OCX AI logo + product title
 * Right-aligned help/settings dropdown
 * Compact, sober B2B styling
 */
export default function Header() {
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [showIconOptions, setShowIconOptions] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(() => {
    return localStorage.getItem('ocx-ai-icon') || 'modern-letters';
  });

  // Update favicon when component mounts
  useEffect(() => {
    updateFavicon(selectedIcon);
  }, [selectedIcon]);

  const handleIconSelect = (iconType: string) => {
    setSelectedIcon(iconType);
    localStorage.setItem('ocx-ai-icon', iconType);
    updateFavicon(iconType);
  };

  return (
    <>
      <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 transition-colors">
        <div className="px-3 md:px-4 h-[64px] flex items-center justify-between">
          {/* Left: logo + title */}
          <div className="flex items-center gap-3">
            {/* OCX AI Logo */}
            <button
              onClick={() => setShowIconOptions(true)}
              className="hover:opacity-80 transition-opacity"
              title="Change OCX AI icon"
            >
              <IconGenerator iconType={selectedIcon} size={32} />
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

            <div className="leading-tight">
              <div className="text-slate-900 dark:text-slate-100 font-semibold text-[15px]">
                OCX AI
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-[12px]">Resource Planner</div>
            </div>
          </div>

          {/* Right: help/settings */}
          <div className="flex items-center gap-3">
            <HelpDropdown onOpenGuide={() => setShowHelpGuide(true)} />
          </div>
        </div>
      </header>

      {/* Help Guide Modal */}
      <HelpGuide
        open={showHelpGuide}
        onClose={() => setShowHelpGuide(false)}
      />

      {/* Icon Options Modal */}
      <IconOptions
        open={showIconOptions}
        onSelect={handleIconSelect}
        onClose={() => setShowIconOptions(false)}
      />
    </>
  );
}
