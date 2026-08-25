// src/shared/context/ToastContext.jsx
//
// App-wide toast notification system. Mirrors the pattern used by
// ThemeContext.jsx (see src/shared/context/ThemeContext.jsx) so it plugs
// into the same provider tree.
//
// Usage inside a component:
//   import { useToast } from "../../shared/context/ToastContext";
//   const toast = useToast();
//   toast.success("Circuit saved.");
//   toast.error("Could not reach the server.");
//   toast.warning("Session expiring soon.");
//   toast.info("Progress synced.");
//
// Usage inside a plain JS file (services, apiClient, etc. — no hooks):
//   import { notify } from "../utils/toastBridge";
//   notify.error("Network error occurred");

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import "../styles/Toast.css";
import { setToastBridge } from "../utils/toastBridge";

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

let idCounter = 0;
const nextId = () => `toast-${Date.now()}-${idCounter++}`;

function ToastItem({ toast, onDismiss }) {
  const Icon = ICONS[toast.type] || Info;
  const timerRef = useRef(null);
  const remainingRef = useRef(toast.duration);
  const startRef = useRef(Date.now());

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const scheduleDismiss = useCallback(
    (delay) => {
      clearTimer();
      if (delay <= 0) return;
      startRef.current = Date.now();
      timerRef.current = setTimeout(() => onDismiss(toast.id), delay);
    },
    [onDismiss, toast.id],
  );

  React.useEffect(() => {
    if (toast.duration > 0) scheduleDismiss(toast.duration);
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pause the auto-dismiss timer while the user is reading/hovering.
  const handleMouseEnter = () => {
    if (toast.duration <= 0) return;
    const elapsed = Date.now() - startRef.current;
    remainingRef.current = Math.max(toast.duration - elapsed, 600);
    clearTimer();
  };

  const handleMouseLeave = () => {
    if (toast.duration <= 0) return;
    scheduleDismiss(remainingRef.current);
  };

  return (
    <div
      className={`app-toast app-toast--${toast.type}`}
      role={toast.type === "error" ? "alert" : "status"}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="app-toast__icon" aria-hidden="true">
        <Icon size={18} strokeWidth={2.25} />
      </span>
      <div className="app-toast__body">
        {toast.title ? <span className="app-toast__title">{toast.title}</span> : null}
        <span className="app-toast__message">{toast.message}</span>
      </div>
      <button
        type="button"
        className="app-toast__close"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
      {toast.duration > 0 ? (
        <span className="app-toast__progress" style={{ animationDuration: `${toast.duration}ms` }} />
      ) : null}
    </div>
  );
}

/**
 * position: "top-right" (default) | "top-left" | "bottom-right" | "bottom-left"
 * Pick a corner that doesn't collide with your DlsMentorWidget launcher
 * (which sits bottom-right at 22px) — "top-right" is the safe default.
 */
export function ToastProvider({ children, position = "top-right" }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((message, { type = "info", title, duration = 4500 } = {}) => {
    const id = nextId();
    setToasts((prev) => [...prev, { id, message, type, title, duration }]);
    return id;
  }, []);

  const clear = useCallback(() => setToasts([]), []);

  const api = useMemo(() => {
    const toast = (message, options) => push(message, options);
    toast.success = (message, options) => push(message, { ...options, type: "success" });
    toast.error = (message, options) => push(message, { ...options, type: "error" });
    toast.warning = (message, options) => push(message, { ...options, type: "warning" });
    toast.info = (message, options) => push(message, { ...options, type: "info" });
    toast.dismiss = dismiss;
    toast.clear = clear;
    return toast;
  }, [push, dismiss, clear]);

  // Makes toast.* callable from plain JS modules (apiClient interceptors,
  // authService, etc.) that can't use the useToast() hook.
  setToastBridge(api);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className={`app-toast-viewport app-toast-viewport--${position}`}>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

export default ToastContext;
