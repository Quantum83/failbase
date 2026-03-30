"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { theme } from "@/lib/theme";

export function useToast() {
  const [toast, setToast] = useState(null);

  function showToast(message, emoji = "✅") {
    setToast({ message, emoji });
    setTimeout(() => setToast(null), 2500);
  }

  return { toast, showToast };
}

export function ToastPortal({ toast }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !toast) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        left: 0,
        right: 0,
        zIndex: 10001,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        className="flex items-center gap-2 px-4 py-3 rounded-full shadow-lg animate-slide-up"
        style={{
          background: theme.dark,
          color: "white",
          fontSize: "14px",
          fontWeight: 500,
          whiteSpace: "nowrap",
          pointerEvents: "auto",
        }}
      >
        <span>{toast.emoji}</span>
        <span>{toast.message}</span>
      </div>
    </div>,
    document.body,
  );
}

// Keep backward compat export name
export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        left: 0,
        right: 0,
        zIndex: 10001,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        className="flex items-center gap-2 px-4 py-3 rounded-full shadow-lg animate-slide-up"
        style={{
          background: theme.dark,
          color: "white",
          fontSize: "14px",
          fontWeight: 500,
          whiteSpace: "nowrap",
          pointerEvents: "auto",
        }}
      >
        <span>{toast.emoji}</span>
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
