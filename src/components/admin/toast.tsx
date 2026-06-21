"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface Toast {
  id: number;
  message: string;
  visible: boolean;
}

interface ToastContextValue {
  toast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, visible: false }]);

    requestAnimationFrame(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, visible: true } : t)));
    });

    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, visible: false } : t)));
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 260);
    }, 2600);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-[22px] left-1/2 z-300 flex w-full max-w-[440px] -translate-x-1/2 flex-col items-center gap-[7px] px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-[9px] rounded-[12px] bg-foreground px-4 py-[11px] text-[13px] font-medium text-white shadow-[0_10px_30px_rgba(26,25,31,.24)] transition-all duration-[260ms] ease-[cubic-bezier(.32,.72,0,1)]"
            style={{
              transform: t.visible ? "translateY(0)" : "translateY(14px)",
              opacity: t.visible ? 1 : 0,
            }}
          >
            <span className="size-[6px] shrink-0 rounded-full bg-secondary" />
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
