"use client";

import { useState, createContext, useContext } from "react";
import { X, Bell, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info" | "notification";

type Toast = {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
  link?: string;
};

type ToastContextType = {
  toast: (t: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex w-full animate-in slide-in-from-right-5 overflow-hidden rounded-2xl border bg-card shadow-2xl transition-all",
              t.type === "success" && "border-emerald-500/20 bg-emerald-500/5",
              t.type === "error" && "border-red-500/20 bg-red-500/5",
              t.type === "notification" && "border-accent/20 bg-accent/5"
            )}
            onClick={() => {
                if (t.link) window.location.href = t.link;
            }}
          >
            <div className="flex flex-1 items-start gap-3 p-4">
              <div className={cn(
                  "rounded-full p-2 shrink-0",
                  t.type === "success" && "bg-emerald-500/10 text-emerald-500",
                  t.type === "error" && "bg-red-500/10 text-red-500",
                  t.type === "notification" && "bg-accent/10 text-accent",
                  t.type === "info" && "bg-blue-500/10 text-blue-500"
              )}>
                {t.type === "success" && <CheckCircle2 className="h-5 w-5" />}
                {t.type === "error" && <AlertCircle className="h-5 w-5" />}
                {t.type === "notification" && <Bell className="h-5 w-5" />}
                {t.type === "info" && <Info className="h-5 w-5" />}
              </div>
              <div className="grid gap-1">
                <h3 className="text-sm font-bold leading-tight">{t.title}</h3>
                {t.message && <p className="text-xs text-muted-foreground">{t.message}</p>}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setToasts((prev) => prev.filter((toast) => toast.id !== t.id));
                }}
                className="ml-auto rounded-full p-1 text-muted hover:bg-foreground/5 hover:text-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}
