"use client";

import { useEffect, useState } from "react";

type ToastState = { id: number; message: string };

export function ToastHost() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<string>;
      setToasts((t) => [...t, { id: Date.now(), message: ce.detail }]);
      setTimeout(() => setToasts((t) => t.slice(1)), 3000);
    };
    window.addEventListener("app:toast", handler as EventListener);
    return () =>
      window.removeEventListener("app:toast", handler as EventListener);
  }, []);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="px-3 py-2 rounded bg-white/10 text-white border border-white/15 shadow-lg"
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

export function showToast(message: string) {
  window.dispatchEvent(new CustomEvent("app:toast", { detail: message }));
}
