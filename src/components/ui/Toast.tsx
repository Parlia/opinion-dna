"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

type ToastKind = "success" | "error" | "info";

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
  detail?: string;
  action?: ToastAction;
}

interface ToastContextValue {
  push: (kind: ToastKind, message: string, detail?: string, action?: ToastAction) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Hook that returns a small API for surfacing toasts:
 *   const toast = useToast();
 *   toast.success("Sent!");
 *   toast.error("Something broke.");
 *   toast.info("Just so you know…", "Optional longer detail.");
 *
 * Safe to call even if the ToastProvider isn't mounted — falls back to console.
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  return useMemo(
    () => ({
      success: (message: string, detail?: string, action?: ToastAction) => {
        if (ctx) ctx.push("success", message, detail, action);
        else console.log("[toast:success]", message, detail || "");
      },
      error: (message: string, detail?: string, action?: ToastAction) => {
        if (ctx) ctx.push("error", message, detail, action);
        else console.error("[toast:error]", message, detail || "");
      },
      info: (message: string, detail?: string, action?: ToastAction) => {
        if (ctx) ctx.push("info", message, detail, action);
        else console.log("[toast:info]", message, detail || "");
      },
    }),
    [ctx]
  );
}

/**
 * Wrap the authed app in this provider. Renders a viewport in the
 * bottom-right corner. Each toast auto-dismisses after 4.5s.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const push = useCallback((kind: ToastKind, message: string, detail?: string, action?: ToastAction) => {
    const id = ++nextId.current;
    setToasts((t) => [...t, { id, kind, message, detail, action }]);
    // Toasts with an action (e.g. Undo) linger longer so the user has a
    // realistic window to click it.
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, action ? 8000 : 4500);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col gap-2 px-4 pb-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:left-auto sm:w-full sm:max-w-sm sm:px-0 sm:pb-0"
        style={{
          paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
          paddingRight: "max(1rem, env(safe-area-inset-right))",
          paddingLeft: "max(1rem, env(safe-area-inset-left))",
        }}
      >
        {toasts.map((toast) => (
          <ToastCard
            key={toast.id}
            toast={toast}
            onDismiss={() => setToasts((t) => t.filter((x) => x.id !== toast.id))}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: () => void;
}) {
  const tone =
    toast.kind === "success"
      ? { bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500", text: "text-emerald-900" }
      : toast.kind === "error"
        ? { bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500", text: "text-red-900" }
        : { bg: "bg-white", border: "border-[var(--border)]", dot: "bg-[var(--primary)]", text: "text-[var(--foreground)]" };

  return (
    <div
      className={`pointer-events-auto rounded-xl border shadow-lg ${tone.bg} ${tone.border} p-4 flex items-start gap-3 animate-[fadeIn_160ms_ease-out]`}
      role="status"
      aria-live="polite"
    >
      <span className={`mt-1.5 inline-block h-2 w-2 rounded-full ${tone.dot} shrink-0`} />
      <div className={`flex-1 min-w-0 ${tone.text}`}>
        <p className="text-sm font-medium leading-tight">{toast.message}</p>
        {toast.detail && (
          <p className="mt-1 text-xs opacity-80 leading-snug">{toast.detail}</p>
        )}
        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action?.onClick();
              onDismiss();
            }}
            className="mt-2 text-xs font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className={`${tone.text} opacity-50 hover:opacity-100 transition-opacity shrink-0 text-lg leading-none`}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
