// src/components/Toast.tsx
import React from "react";

type ToastItem = { id: number; message: string; type?: "success" | "error" | "info" };

type ToastContextType = {
  show: (message: string, type?: ToastItem["type"]) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  clear: () => void;
};

const ToastContext = React.createContext<ToastContextType | null>(null);

/** Hook: use inside descendants of <ToastProvider> */
export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    // Keep message explicit so future mistakes are easy to diagnose.
    throw new Error("useToast must be used within <ToastProvider>");
  }
  return ctx;
}

/** Provider + viewport */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);
  const nextId = React.useRef(1);

  const dismiss = (id: number) => setItems((xs) => xs.filter((t) => t.id !== id));

  const show = (message: string, type: ToastItem["type"] = "info") => {
    const id = nextId.current++;
    setItems((xs) => [...xs, { id, message, type }]);
    // auto-dismiss after 2.5s
    window.setTimeout(() => dismiss(id), 2500);
  };

  const api: ToastContextType = {
    show,
    success: (m) => show(m, "success"),
    error: (m) => show(m, "error"),
    info: (m) => show(m, "info"),
    clear: () => setItems([]),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Toast viewport */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {items.map((t) => {
          const base =
            "min-w-[240px] max-w-[420px] px-3 py-2 rounded-md shadow border text-sm flex items-start gap-2";
          const byType =
            t.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : t.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-slate-50 border-slate-200 text-slate-800";

          return (
            <div key={t.id} className={`${base} ${byType}`}>
              <span className="mt-0.5">✓</span>
              <div className="flex-1">{t.message}</div>
              <button
                onClick={() => dismiss(t.id)}
                className="pl-2 text-slate-500 hover:text-slate-700"
                aria-label="Dismiss"
                title="Dismiss"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

/** Default export for conventional imports */
export default ToastProvider;

/** Named alias so `{ Toast }` imports also work if you used that earlier */
export const Toast = ToastProvider;
