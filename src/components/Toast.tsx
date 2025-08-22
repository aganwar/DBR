import React from "react";

type Props = {
  /** Prefer children, but message also supported for convenience */
  message?: string;
  children?: React.ReactNode;
  /** Optional close handler (parent can also auto-dismiss) */
  onClose?: () => void;
  /** Visual style: "success" | "info" | "error" (defaults to success) */
  tone?: "success" | "info" | "error";
};

export default function Toast({ message, children, onClose, tone = "success" }: Props) {
  const content = children ?? message ?? "";

  const toneClasses =
    tone === "error"
      ? "bg-rose-50 border-rose-200 text-rose-800"
      : tone === "info"
      ? "bg-sky-50 border-sky-200 text-sky-800"
      : "bg-emerald-50 border-emerald-200 text-emerald-800"; // success

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-4 right-4 z-[60] animate-[fadeIn_120ms_ease-out]"
    >
      <div
        className={`min-w-[200px] max-w-[360px] px-3 py-2 rounded-lg border shadow-sm ${toneClasses}`}
      >
        <div className="flex items-start gap-2">
          {/* Icon */}
          <span aria-hidden className="mt-0.5">
            {tone === "error" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 8v5m0 3h.01M3 12a9 9 0 1 0 18 0A9 9 0 0 0 3 12Z" stroke="currentColor" strokeWidth="1.6"/>
              </svg>
            ) : tone === "info" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 17v-6m0-3h.01M3 12a9 9 0 1 0 18 0A9 9 0 0 0 3 12Z" stroke="currentColor" strokeWidth="1.6"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            )}
          </span>

          {/* Message */}
          <div className="text-sm leading-5 flex-1">{content}</div>

          {/* Close */}
          {onClose && (
            <button
              aria-label="Close"
              className="ml-1 p-1 rounded hover:bg-black/5"
              onClick={onClose}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* tiny fade-in keyframes */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  );
}
